/**
 * ACTUALIZADO - Enero 28, 2026
 *
 * Busca en TODOS los supermercados que tienen scrapers.
 * Ya no marcamos tiendas como "sin e-commerce" sin intentar scraping primero.
 *
 * Scrapers activos: SuperMax, Econo, Walmart, Selectos, Pueblo, Amigo, Agranel, Ralph's
 * Membresía (en desarrollo): Costco, Sam's Club
 */

import PQueue from 'p-queue';
import type { StoreCheckResult } from '../types/index.js';
import { scrapers, STORE_NAMES, type StoreId } from '../scrapers/index.js';
import { withRetry } from '../scrapers/utils.js';
import { STORES_WITH_SCRAPERS, MEMBERSHIP_MSG } from '../constants/stores.js';
import { getRecommendations } from './smartRecommendationService.js';

const TIMEOUT_MS = 15_000;
const QUEUE = new PQueue({ concurrency: 3, interval: 500, intervalCap: 1 });

const MEMBERSHIP_STORES: { storeName: string; location: string }[] = [
  { storeName: 'Costco', location: 'San Juan' },
  { storeName: "Sam's Club", location: 'Bayamón' },
];

function runWithTimeout<T>(p: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    p,
    new Promise<never>((_, rej) =>
      setTimeout(() => rej(new Error(`Timeout ${label} (${ms}ms)`)), ms)
    ),
  ]);
}

export interface CheckStoresInput {
  productName: string;
  upc: string;
  brand?: string;
  userLocation: string;
  /** Incluir tamaño para precio unitario (ej. "8oz"). */
  size?: string;
}

export type CheckStoresOutput = import('../types/index.js').CheckStoresResponse;

export async function checkStores(input: CheckStoresInput): Promise<CheckStoresOutput> {
  const { productName, upc, brand, userLocation, size } = input;
  const location = userLocation || 'Puerto Rico';
  const results: StoreCheckResult[] = [];

  const runOne = async (id: (typeof STORES_WITH_SCRAPERS)[number]): Promise<void> => {
    const fn = scrapers[id as StoreId];
    if (!fn) {
      // Si no hay scraper implementado, marcar como error
      results.push({
        storeName: STORE_NAMES[id as StoreId],
        location,
        price: 0,
        available: false,
        url: '',
        status: 'error',
        message: 'Scraper no implementado aún',
      });
      return;
    }

    try {
      const stores = await withRetry(
        () => runWithTimeout(fn(productName, location), TIMEOUT_MS, STORE_NAMES[id as StoreId]),
        STORE_NAMES[id as StoreId],
        3
      );
      const valid = stores.filter((s) => s.price > 0 || s.url);
      if (valid.length > 0) {
        const best = valid.reduce((a, b) => (a.price <= b.price ? a : b));
        results.push({
          storeName: best.chain,
          location: best.location,
          price: best.price,
          available: best.available,
          url: best.url,
          productName: best.productName,
          lastUpdated: new Date().toISOString(),
          status: 'found',
        });
      } else {
        results.push({
          storeName: STORE_NAMES[id as StoreId],
          location,
          price: 0,
          available: false,
          url: '',
          status: 'error',
          message: 'No encontrado',
        });
      }
    } catch (e) {
      results.push({
        storeName: STORE_NAMES[id as StoreId],
        location,
        price: 0,
        available: false,
        url: '',
        status: 'error',
        message: (e as Error)?.message ?? 'Error al buscar',
      });
    }
  };

  // INTENTAR SCRAPING EN TODAS LAS TIENDAS
  await Promise.allSettled(STORES_WITH_SCRAPERS.map((id) => QUEUE.add(() => runOne(id))));

  for (const m of MEMBERSHIP_STORES) {
    results.push({
      storeName: m.storeName,
      location: m.location,
      price: 0,
      available: false,
      url: '',
      status: 'no_ecommerce',
      message: MEMBERSHIP_MSG,
      requiresMembership: true,
    });
  }

  const found = results.filter((r) => r.status === 'found' && r.available && r.price > 0);
  const bestPrice = found.length > 0 ? Math.min(...found.map((r) => r.price)) : null;

  const { bestDeal, recommendations, alternatives } = getRecommendations({
    productName,
    brand,
    size,
    storeResults: results,
    userLocation: location,
  });

  return {
    productName,
    brand,
    upc,
    results,
    bestPrice,
    availableCount: found.length,
    bestDeal,
    recommendations,
    alternatives,
  };
}
