/**
 * Cliente API Groceriando.
 */

import type { ProductSearchResult, CheckStoresResponse, NotionAddItemPayload } from '../types';

const API_BASE = import.meta.env.VITE_API_URL ?? '';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = path.startsWith('http') ? path : `${API_BASE}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((data?.error as string) || `Error ${res.status}`);
  }
  return data as T;
}

export async function productSearch(query: string) {
  const params = new URLSearchParams({ q: query });
  const data = await request<{ products: ProductSearchResult[] }>(
    `/api/products/search?${params}`,
    { method: 'GET' }
  );
  return data.products;
}

export async function checkStores(body: {
  productName: string;
  upc: string;
  brand?: string;
  userLocation: string;
  size?: string;
}) {
  return request<CheckStoresResponse>('/api/products/check-stores', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function addToNotion(
  notionApiKey: string,
  databaseId: string,
  productData: NotionAddItemPayload
) {
  return request<{ id: string }>('/api/notion/add-item', {
    method: 'POST',
    body: JSON.stringify({
      notionApiKey,
      databaseId,
      productData,
    }),
  });
}

export async function getNotionList(notionApiKey: string, databaseId: string) {
  const params = new URLSearchParams({ notionApiKey, databaseId });
  return request<unknown[]>(`/api/notion/list?${params}`, { method: 'GET' });
}

export async function markAsPurchased(pageId: string, notionApiKey: string, databaseId?: string) {
  return request<{ success: boolean }>(`/api/notion/mark-purchased/${encodeURIComponent(pageId)}`, {
    method: 'PATCH',
    body: JSON.stringify({ notionApiKey, databaseId }),
  });
}
