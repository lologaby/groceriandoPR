/**
 * Cache en memoria. TTLs desde constants/cache.
 */

import { CACHE_TTL_PRODUCTS_MS, CACHE_TTL_STORES_MS } from '../constants/cache.js';

const TTL = {
  products: CACHE_TTL_PRODUCTS_MS,
  checkStores: CACHE_TTL_STORES_MS,
} as const;

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

const cache = new Map<string, CacheEntry<unknown>>();

function isExpired<T>(entry: CacheEntry<T>): boolean {
  return Date.now() - entry.timestamp >= entry.ttl;
}

export function get<T>(key: string): T | null {
  const entry = cache.get(key) as CacheEntry<T> | undefined;
  if (!entry) return null;
  if (isExpired(entry)) {
    cache.delete(key);
    return null;
  }
  return entry.data;
}

export function set<T>(key: string, data: T, ttlMs: number): void {
  cache.set(key, { data, timestamp: Date.now(), ttl: ttlMs });
}

export function productsKey(query: string): string {
  return `products:${query.toLowerCase().trim()}`;
}

export function checkStoresKey(upc: string, location: string): string {
  return `checkStores:${upc}|${(location || '').trim()}`;
}

export const TTL_PRODUCTS = TTL.products;
export const TTL_CHECK_STORES = TTL.checkStores;
export { TTL };
