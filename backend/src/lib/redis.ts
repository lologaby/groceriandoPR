/**
 * Redis Client para cache persistente
 * Reemplaza el cache en memoria con Redis para mejor performance y persistencia
 */

import { Redis } from 'ioredis';
import { CACHE_TTL_PRODUCTS, CACHE_TTL_STORES } from '../constants/cache.js';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const REDIS_ENABLED = process.env.REDIS_ENABLED !== 'false'; // Por defecto true, pero puede desactivarse

// Fallback a cache en memoria si Redis no está disponible
const memoryCache = new Map<string, { data: any; expires: number }>();

// Crear cliente Redis (solo si está habilitado)
let redis: Redis | null = null;
let redisConnected = false;

if (REDIS_ENABLED) {
  try {
    redis = new Redis(REDIS_URL, {
      maxRetriesPerRequest: 3,
      retryStrategy: (times: number) => {
        // Después de 5 intentos, desactivar Redis y usar memoria
        if (times > 5) {
          console.warn('[Redis] Desactivando Redis después de múltiples fallos, usando cache en memoria');
          redisConnected = false;
          return null; // Detener retries
        }
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      reconnectOnError: (err: Error) => {
        const targetError = 'READONLY';
        if (err.message.includes(targetError)) {
          return true; // Reconectar
        }
        return false;
      },
      lazyConnect: true, // No conectar automáticamente
    });

    // Manejar errores de conexión (solo una vez)
    let errorLogged = false;
    redis.on('error', (err: Error) => {
      if (!errorLogged && !err.message.includes('ECONNREFUSED')) {
        console.error('[Redis] Error:', err.message);
        errorLogged = true;
      }
      redisConnected = false;
    });

    redis.on('connect', () => {
      redisConnected = true;
      console.log('[Redis] ✅ Conectado exitosamente');
    });

    redis.on('ready', () => {
      redisConnected = true;
      console.log('[Redis] ✅ Listo para recibir comandos');
    });

    // Intentar conectar
    redis.connect().catch(() => {
      // Silenciosamente fallar a cache en memoria
      redisConnected = false;
      console.warn('[Redis] ⚠️ No disponible, usando cache en memoria');
    });
  } catch (error) {
    console.warn('[Redis] ⚠️ Error inicializando Redis, usando cache en memoria');
    redisConnected = false;
  }
} else {
  console.log('[Redis] ⚠️ Redis desactivado (REDIS_ENABLED=false), usando cache en memoria');
}

/**
 * Cache helper functions con fallback a memoria
 */
export async function getCache<T>(key: string): Promise<T | null> {
  // Si Redis está disponible y conectado, usarlo
  if (redis && redisConnected) {
    try {
      const data = await redis.get(key);
      if (!data) return null;
      return JSON.parse(data) as T;
    } catch (error) {
      // Fallback a memoria si Redis falla
      redisConnected = false;
    }
  }
  
  // Fallback a cache en memoria
  const cached = memoryCache.get(key);
  if (cached && cached.expires > Date.now()) {
    return cached.data as T;
  }
  
  // Expirar entrada si existe
  if (cached) {
    memoryCache.delete(key);
  }
  
  return null;
}

export async function setCache<T>(
  key: string,
  data: T,
  ttlSeconds?: number
): Promise<void> {
  const serialized = JSON.stringify(data);
  
  // Si Redis está disponible y conectado, usarlo
  if (redis && redisConnected) {
    try {
      if (ttlSeconds) {
        await redis.setex(key, ttlSeconds, serialized);
      } else {
        await redis.set(key, serialized);
      }
      return; // Éxito, no necesitamos guardar en memoria también
    } catch (error) {
      // Fallback a memoria si Redis falla
      redisConnected = false;
    }
  }
  
  // Fallback a cache en memoria
  const expires = ttlSeconds ? Date.now() + (ttlSeconds * 1000) : Date.now() + (24 * 60 * 60 * 1000); // Default 24h
  memoryCache.set(key, { data, expires });
  
  // Limpiar entradas expiradas periódicamente (cada 1000 entradas)
  if (memoryCache.size > 1000) {
    const now = Date.now();
    for (const [k, v] of memoryCache.entries()) {
      if (v.expires < now) {
        memoryCache.delete(k);
      }
    }
  }
}

export async function deleteCache(key: string): Promise<void> {
  // Intentar en Redis primero
  if (redis && redisConnected) {
    try {
      await redis.del(key);
      return;
    } catch (error) {
      redisConnected = false;
    }
  }
  
  // Fallback a memoria
  memoryCache.delete(key);
}

export async function existsCache(key: string): Promise<boolean> {
  // Intentar en Redis primero
  if (redis && redisConnected) {
    try {
      const result = await redis.exists(key);
      return result === 1;
    } catch (error) {
      redisConnected = false;
    }
  }
  
  // Fallback a memoria
  const cached = memoryCache.get(key);
  return cached !== undefined && cached.expires > Date.now();
}

/**
 * Verificar si Redis está disponible
 */
export function isRedisAvailable(): boolean {
  return redisConnected && redis !== null;
}

/**
 * Obtener instancia de Redis (para Bull queues)
 * Retorna null si Redis no está disponible
 */
export function getRedisClient(): Redis | null {
  return redisConnected && redis ? redis : null;
}

/**
 * Ping a Redis (para health check)
 */
export async function pingRedis(): Promise<boolean> {
  if (redis && redisConnected) {
    try {
      await redis.ping();
      return true;
    } catch {
      return false;
    }
  }
  return false;
}

/**
 * Cache key generators
 */
export function productsKey(query: string): string {
  return `products:${query.toLowerCase().trim()}`;
}

export function checkStoresKey(upc: string, location: string): string {
  return `checkStores:${upc}|${(location || '').trim()}`;
}

export function jobKey(productName: string, upc: string, location: string): string {
  return `job:${productName}|${upc}|${location}`;
}

/**
 * TTL constants
 */
export const TTL_PRODUCTS = CACHE_TTL_PRODUCTS; // 24 horas
export const TTL_CHECK_STORES = CACHE_TTL_STORES; // 2 horas

/**
 * Cerrar conexión Redis (útil para tests o shutdown graceful)
 */
export async function closeRedis(): Promise<void> {
  if (redis && redisConnected) {
    await redis.quit();
  }
  memoryCache.clear();
}
