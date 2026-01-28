/**
 * Fallback local de productos cuando UPCitemdb falla o no devuelve resultados.
 * Productos comunes en PR.
 */

import type { ProductSearchResult } from '../types/index.js';

const LOCAL: ProductSearchResult[] = [
  {
    upc: '037600109864',
    name: 'Jamón Hormel Original 8 oz',
    brand: 'Hormel',
    category: 'Carnes',
    description: '',
    images: [],
    size: '8 oz',
  },
  {
    upc: '037600109871',
    name: 'Jamón Hormel Black Label',
    brand: 'Hormel',
    category: 'Carnes',
    description: '',
    images: [],
    size: '8 oz',
  },
  {
    upc: '041331038701',
    name: 'Leche Tres Monjitas Entera 1 gal',
    brand: 'Tres Monjitas',
    category: 'Lácteos',
    description: '',
    images: [],
    size: '1 gal',
  },
  {
    upc: '041331038718',
    name: 'Leche Tres Monjitas 2% 1 gal',
    brand: 'Tres Monjitas',
    category: 'Lácteos',
    description: '',
    images: [],
    size: '1 gal',
  },
  {
    upc: '078742301234',
    name: 'Arroz Canilla Goya 5 lb',
    brand: 'Goya',
    category: 'Despensa',
    description: '',
    images: [],
    size: '5 lb',
  },
  {
    upc: '078742301241',
    name: 'Arroz Canilla Goya 2 lb',
    brand: 'Goya',
    category: 'Despensa',
    description: '',
    images: [],
    size: '2 lb',
  },
  {
    upc: '024000163205',
    name: 'Coca‑Cola 12 pk 12 oz',
    brand: 'Coca‑Cola',
    category: 'Bebidas',
    description: '',
    images: [],
    size: '12x12 oz',
  },
  {
    upc: '049000050521',
    name: 'Ketchup Heinz 20 oz',
    brand: 'Heinz',
    category: 'Despensa',
    description: '',
    images: [],
    size: '20 oz',
  },
  {
    upc: '051500241234',
    name: 'Pan Bimbo Blanco',
    brand: 'Bimbo',
    category: 'Panadería',
    description: '',
    images: [],
    size: '20 oz',
  },
  {
    upc: '037000640234',
    name: 'Cereal Cheerios Original',
    brand: 'General Mills',
    category: 'Despensa',
    description: '',
    images: [],
    size: '18 oz',
  },
  {
    upc: '038000340567',
    name: 'Aceite Mazola 48 oz',
    brand: 'Mazola',
    category: 'Despensa',
    description: '',
    images: [],
    size: '48 oz',
  },
  {
    upc: '052000012345',
    name: 'Huevos Grade A Dozen',
    brand: '',
    category: 'Lácteos',
    description: '',
    images: [],
    size: '12 ct',
  },
  {
    upc: '072140012345',
    name: 'Pasta Spaghetti Barilla 16 oz',
    brand: 'Barilla',
    category: 'Despensa',
    description: '',
    images: [],
    size: '16 oz',
  },
  {
    upc: '028400123456',
    name: 'Salsa de Tomate Goya 8 oz',
    brand: 'Goya',
    category: 'Despensa',
    description: '',
    images: [],
    size: '8 oz',
  },
  {
    upc: '012000162789',
    name: 'Crema de Coco Coco López',
    brand: 'Coco López',
    category: 'Despensa',
    description: '',
    images: [],
    size: '15 oz',
  },
];

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/\s+/g, ' ');
}

export function searchLocal(query: string): ProductSearchResult[] {
  const q = normalize(query);
  if (q.length < 2) return [];

  const terms = q.split(/\s+/).filter(Boolean);
  const scored = LOCAL.map((p) => {
    const name = normalize(p.name);
    const brand = normalize(p.brand);
    const cat = normalize(p.category);
    const text = `${name} ${brand} ${cat}`;
    let score = 0;
    for (const t of terms) {
      if (text.includes(t)) score += 1;
    }
    return { product: p, score };
  })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 20)
    .map((x) => x.product);

  return scored;
}
