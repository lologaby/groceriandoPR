/**
 * TTLs de cache (segundos). Estructura lista para Redis.
 */

export const CACHE_TTL_PRODUCTS = 86400; // 24 horas
export const CACHE_TTL_STORES = 7200; // 2 horas
export const CACHE_TTL_PRICES = 3600; // 1 hora

export const CACHE_TTL_PRODUCTS_MS = CACHE_TTL_PRODUCTS * 1000;
export const CACHE_TTL_STORES_MS = CACHE_TTL_STORES * 1000;
