/**
 * Scrapers por supermercado PR. Cada uno exporta searchX(query, location?).
 */

import type { StoreId } from './config.js';
import { searchSuperMax } from './supermax.js';
import { searchEcono } from './econo.js';
import { searchAmigo } from './amigo.js';
import { searchWalmart } from './walmart.js';
import { searchPueblo } from './pueblo.js';
import { searchSelectos } from './selectos.js';
import { searchAgranel } from './agranel.js';
import { searchRalphs } from './ralphs.js';

export type { StoreId } from './config.js';
export { STORE_IDS, STORE_NAMES, STORE_LOCATIONS, STORE_BASE_URLS } from './config.js';

export const scrapers: Record<
  StoreId,
  (query: string, location?: string) => Promise<import('../types/index.js').StoreInfo[]>
> = {
  supermax: searchSuperMax,
  econo: searchEcono,
  amigo: searchAmigo,
  walmart: searchWalmart,
  pueblo: searchPueblo,
  selectos: searchSelectos,
  agranel: searchAgranel,
  ralphs: searchRalphs,
};
