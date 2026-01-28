/**
 * Búsqueda de productos en base externa (UPCitemdb) con fallback local.
 * NUNCA hace scraping; solo API / JSON local.
 */

import axios from 'axios';
import type { ProductSearchResult } from '../types/index.js';
import { searchLocal } from './productDatabaseLocal.js';
import { filterFoodProducts, inferFoodCategory } from '../utils/productValidator.js';

const UPCITEMDB_URL = 'https://api.upcitemdb.com/prod/trial/search';

export async function searchProducts(query: string): Promise<ProductSearchResult[]> {
  const q = query.trim();
  if (!q) return [];

  try {
    const { data } = await axios.get<{
      items?: Array<{
        upc?: string;
        title?: string;
        brand?: string;
        category?: string;
        description?: string;
        images?: string[];
        size?: string;
      }>;
    }>(UPCITEMDB_URL, {
      params: { s: q },
      headers: { 'Content-Type': 'application/json' },
      timeout: 10_000,
    });

    const items = data?.items ?? [];
    if (items.length > 0) {
      // Mapear y filtrar solo productos de comida
      const mapped = items
        .map(
          (item: {
            upc?: string;
            title?: string;
            brand?: string;
            category?: string;
            description?: string;
            images?: string[];
            size?: string;
          }) => ({
            upc: String(item.upc ?? ''),
            name: String(item.title ?? '').trim() || 'Sin nombre',
            brand: String(item.brand ?? '').trim(),
            category: inferFoodCategory(
              String(item.title ?? ''),
              String(item.category ?? '')
            ),
            description: String(item.description ?? '').trim(),
            images: Array.isArray(item.images) ? item.images : [],
            size: item.size ? String(item.size) : undefined,
          })
        );
      
      // Filtrar solo productos de comida/groceries
      const filtered = filterFoodProducts(mapped);
      
      // Limitar a 20 resultados
      return filtered.slice(0, 20);
    }
  } catch (err) {
    console.warn('[ProductDB] UPCitemdb error, using local fallback:', (err as Error)?.message);
  }

  return searchLocal(q);
}
