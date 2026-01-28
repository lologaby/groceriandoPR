/**
 * ACTUALIZADO - Enero 28, 2026
 *
 * TODOS los supermercados intentan scraping primero.
 * Si el scraper falla, entonces se marca como error.
 *
 * NO MARCAR TIENDAS COMO "SIN E-COMMERCE" SIN VERIFICAR MANUALMENTE.
 */

// Tiendas con scrapers activos
export const STORES_WITH_SCRAPERS = [
  'supermax',
  'econo',
  'walmart',
  'selectos',
  'pueblo',
  'amigo',
  'agranel',
  'ralphs',
] as const;

// Tiendas que requieren membresía
export const STORES_MEMBERSHIP = ['costco', 'sams'] as const;

// Mensajes
export const MEMBERSHIP_MSG = '🔐 Requiere membresía. Comparador en desarrollo.';

// DEPRECATED - No usar
export const STORES_TIER_1_SCRAPE = STORES_WITH_SCRAPERS;
export const STORES_TIER_2_NO_ECOMMERCE = [] as const;
export const NO_ECOMMERCE_MSG = '';
