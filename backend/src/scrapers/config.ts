/**
 * Configuración de supermercados PR: IDs, URLs, ubicaciones, User-Agents.
 */

export const STORE_IDS = [
  'supermax',
  'econo',
  'amigo',
  'walmart',
  'pueblo',
  'selectos',
  'agranel',
  'ralphs',
] as const;

export type StoreId = (typeof STORE_IDS)[number];

export const STORE_NAMES: Record<StoreId, string> = {
  supermax: 'SuperMax',
  econo: 'Econo',
  amigo: 'Amigo',
  walmart: 'Walmart',
  pueblo: 'Pueblo',
  selectos: 'Selectos',
  agranel: 'Agranel',
  ralphs: "Ralph's",
};

export const STORE_BASE_URLS: Record<StoreId, string> = {
  supermax: 'https://www.supermaxpr.com',
  econo: 'https://www.econo.com',
  amigo: 'https://www.amigo.com',
  walmart: 'https://www.walmart.com',
  pueblo: 'https://www.pueblosupermarkets.com',
  selectos: 'https://www.selectospr.com',
  agranel: 'https://www.agranelpr.com',
  ralphs: 'https://www.ralphspr.com',
};

/** Ubicaciones por tienda (para filtros y normalización). */
export const STORE_LOCATIONS: Record<StoreId, string[]> = {
  supermax: [
    'Bayamón',
    'Guaynabo',
    'Carolina',
    'Trujillo Alto',
    'Caguas',
    'San Juan',
    'Río Piedras',
    'Hato Rey',
    'Santurce',
  ],
  econo: [
    'Bayamón',
    'Guaynabo',
    'Carolina',
    'San Juan',
    'Caguas',
    'Humacao',
    'Ponce',
    'Mayagüez',
    'Aguadilla',
    'Arecibo',
  ],
  amigo: [
    'Bayamón',
    'Guaynabo',
    'Carolina',
    'Toa Baja',
    'Cataño',
    'Río Grande',
    'Fajardo',
    'Caguas',
    'Cayey',
  ],
  walmart: [
    'Bayamón',
    'Carolina',
    'Caguas',
    'Arecibo',
    'Fajardo',
    'Hatillo',
    'Humacao',
    'Manatí',
    'Mayagüez',
    'Ponce',
  ],
  pueblo: [
    'Bayamón',
    'Guaynabo',
    'San Juan',
    'Carolina',
    'Caguas',
    'Trujillo Alto',
    'Vega Baja',
    'Toa Alta',
  ],
  selectos: ['Bayamón', 'Carolina', 'San Juan', 'Guaynabo', 'Caguas', 'Ponce', 'Mayagüez'],
  agranel: ['Bayamón', 'Guaynabo', 'Carolina', 'San Juan'],
  ralphs: ['Bayamón', 'Caguas', 'Guaynabo', 'San Juan', 'Ponce'],
};

/** Rotación de User-Agent para reducir bloqueos. */
export const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
];

let uaIndex = 0;

export function nextUserAgent(): string {
  const ua = USER_AGENTS[uaIndex % USER_AGENTS.length];
  uaIndex += 1;
  return ua;
}
