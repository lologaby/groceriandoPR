export interface ProductSearchResult {
  upc: string;
  name: string;
  brand: string;
  category: string;
  description: string;
  images: string[];
  size?: string;
}

export type StoreCheckStatus = 'found' | 'error' | 'no_ecommerce';

export interface StoreCheckResult {
  storeName: string;
  location: string;
  price: number;
  available: boolean;
  url: string;
  productName?: string;
  lastUpdated?: string;
  status: StoreCheckStatus;
  message?: string;
  requiresMembership?: boolean;
}

export interface BestDeal {
  store: string;
  location: string;
  price: number;
  unitPrice?: number;
  unit?: string;
}

export interface Recommendation {
  type: 'best_single_price' | 'best_unit_price' | 'nearby' | 'sale';
  message: string;
  store?: string;
  savings?: number;
}

export interface Alternative {
  name: string;
  store: string;
  price: number;
  brand?: string;
}

export interface CheckStoresResponse {
  productName: string;
  brand?: string;
  upc: string;
  results: StoreCheckResult[];
  bestPrice: number | null;
  availableCount: number;
  bestDeal: BestDeal | null;
  recommendations: Recommendation[];
  alternatives: Alternative[];
}

export interface PriceByStore {
  walmart?: number | null;
  econo?: number | null;
  supermax?: number | null;
  freshmart?: number | null;
  amigo?: number | null;
  pueblo?: number | null;
  selectos?: number | null;
  agranel?: number | null;
  ralphs?: number | null;
}

export interface NotionAddItemPayload {
  productName: string;
  brand?: string;
  upc?: string;
  category: string;
  quantity: number;
  bestPrice: number;
  whereToBuy: string;
  location: string;
  priceByStore: PriceByStore;
  availableAt: string[];
  productUrl: string;
  notes?: string;
}

export const NOTION_CONFIG_KEY = 'groceriando_notion_config';

export interface NotionConfig {
  notionApiKey: string;
  databaseId: string;
}
