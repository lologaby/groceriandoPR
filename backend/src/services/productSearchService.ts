/**
 * Servicio de Búsqueda en Base de Datos Local
 * Busca productos en la base de datos scrapeada en lugar de hacer scraping en tiempo real
 */

import { StoreProduct, IStoreProduct } from '../models/StoreProduct.js';
import type { StoreCheckResult } from '../types/index.js';
import { isValidFoodProduct } from '../utils/productValidator.js';

export interface ProductSearchOptions {
  query: string;
  storeIds?: string[];
  locations?: string[];
  maxResults?: number;
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
}

export interface ProductSearchResult {
  products: IStoreProduct[];
  total: number;
  stores: string[];
  locations: string[];
}

/**
 * Buscar productos en la base de datos local
 */
export async function searchProductsInDatabase(
  options: ProductSearchOptions
): Promise<ProductSearchResult> {
  const {
    query,
    storeIds,
    locations,
    maxResults = 50,
    minPrice,
    maxPrice,
    inStockOnly = true,
  } = options;

  // Construir query de búsqueda
  const searchQuery: any = {
    $or: [
      { name: { $regex: query, $options: 'i' } },
      { brand: { $regex: query, $options: 'i' } },
      { searchKeywords: { $in: [query.toLowerCase()] } },
    ],
  };

  // Filtros adicionales
  if (storeIds && storeIds.length > 0) {
    searchQuery.storeId = { $in: storeIds };
  }

  if (locations && locations.length > 0) {
    searchQuery.location = { $in: locations };
  }

  if (inStockOnly) {
    searchQuery.inStock = true;
    searchQuery.available = true;
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    searchQuery.price = {};
    if (minPrice !== undefined) searchQuery.price.$gte = minPrice;
    if (maxPrice !== undefined) searchQuery.price.$lte = maxPrice;
  }

  // Buscar productos
  let products = await StoreProduct.find(searchQuery)
    .sort({ price: 1, lastScraped: -1 }) // Ordenar por precio y fecha de scraping
    .limit(maxResults * 2) // Buscar más para filtrar después
    .lean();
  
  // Filtrar solo productos de comida válidos
  products = products.filter((product) =>
    isValidFoodProduct(product.name, product.category, product.description)
  );
  
  // Limitar a maxResults después del filtro
  products = products.slice(0, maxResults);

  // Obtener stores y locations únicos
  const stores = [...new Set(products.map((p) => p.storeId))];
  const locationsFound = [...new Set(products.map((p) => p.location))];

  return {
    products: products as IStoreProduct[],
    total: products.length,
    stores,
    locations: locationsFound,
  };
}

/**
 * Buscar producto específico por UPC y convertir a formato de API
 */
export async function findProductByUPC(
  upc: string,
  userLocation?: string
): Promise<StoreCheckResult[]> {
  const query: any = { upc };

  if (userLocation) {
    query.location = userLocation;
  }

  let products = await StoreProduct.find(query)
    .sort({ price: 1, lastScraped: -1 })
    .lean();
  
  // Filtrar solo productos de comida válidos
  products = products.filter((product) =>
    isValidFoodProduct(product.name, product.category, product.description)
  );

  // Convertir a formato StoreCheckResult
  return products.map((product) => ({
    storeName: product.storeName,
    location: product.location,
    price: product.price,
    available: product.available && product.inStock,
    url: product.storeUrl || '',
    productName: product.name,
    lastUpdated: product.lastScraped.toISOString(),
    status: product.inStock ? 'found' : 'error',
    message: product.inStock ? undefined : 'No disponible',
  }));
}

/**
 * Buscar productos similares (alternativas)
 */
export async function findSimilarProducts(
  productName: string,
  brand?: string,
  maxResults: number = 10
): Promise<IStoreProduct[]> {
  const query: any = {
    $or: [
      { name: { $regex: productName, $options: 'i' } },
      { searchKeywords: { $in: productName.toLowerCase().split(/\s+/) } },
    ],
    inStock: true,
    available: true,
  };

  // Excluir el producto exacto si hay brand
  if (brand) {
    query.brand = { $ne: brand };
  }

  let products = await StoreProduct.find(query)
    .sort({ price: 1 })
    .limit(maxResults * 2) // Buscar más para filtrar
    .lean();
  
  // Filtrar solo productos de comida válidos
  products = products.filter((product) =>
    isValidFoodProduct(product.name, product.category, product.description)
  );
  
  // Limitar después del filtro
  products = products.slice(0, maxResults);

  return products as IStoreProduct[];
}

/**
 * Obtener estadísticas de la base de datos
 */
export async function getDatabaseStats(): Promise<{
  totalProducts: number;
  productsByStore: Record<string, number>;
  productsByLocation: Record<string, number>;
  lastScraped: Date | null;
  oldestScraped: Date | null;
}> {
  const totalProducts = await StoreProduct.countDocuments();

  // Productos por store
  const productsByStore = await StoreProduct.aggregate([
    {
      $group: {
        _id: '$storeId',
        count: { $sum: 1 },
      },
    },
  ]);

  // Productos por location
  const productsByLocation = await StoreProduct.aggregate([
    {
      $group: {
        _id: '$location',
        count: { $sum: 1 },
      },
    },
  ]);

  // Fechas de scraping
  const lastScrapedDoc = await StoreProduct.findOne().sort({ lastScraped: -1 });
  const oldestScrapedDoc = await StoreProduct.findOne().sort({ lastScraped: 1 });

  return {
    totalProducts,
    productsByStore: productsByStore.reduce(
      (acc, item) => ({ ...acc, [item._id]: item.count }),
      {}
    ),
    productsByLocation: productsByLocation.reduce(
      (acc, item) => ({ ...acc, [item._id]: item.count }),
      {}
    ),
    lastScraped: lastScrapedDoc?.lastScraped || null,
    oldestScraped: oldestScrapedDoc?.lastScraped || null,
  };
}
