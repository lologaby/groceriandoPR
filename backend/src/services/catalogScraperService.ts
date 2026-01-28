/**
 * Servicio de Scraping de Catálogos Completos
 * Scrapea TODOS los productos de un supermercado, no solo búsquedas específicas
 */

import { StoreProduct, IStoreProduct } from '../models/StoreProduct.js';
import { ScrapingJob, IScrapingJob } from '../models/ScrapingJob.js';
import { scrapers, STORE_NAMES, type StoreId } from '../scrapers/index.js';
import { STORES_WITH_SCRAPERS } from '../constants/stores.js';
import { isValidFoodProduct, inferFoodCategory } from '../utils/productValidator.js';

export interface CatalogScrapingOptions {
  storeId: StoreId;
  location?: string;
  categories?: string[]; // Categorías específicas a scrapear
  limit?: number; // Límite de productos por categoría (para testing)
}

export interface ScrapingResult {
  storeId: string;
  storeName: string;
  location: string;
  totalProducts: number;
  productsNew: number;
  productsUpdated: number;
  productsSkipped: number;
  errorCount: number;
  duration: number;
}

/**
 * Scrapear catálogo completo de un supermercado
 * 
 * Estrategia:
 * 1. Obtener todas las categorías del supermercado
 * 2. Para cada categoría, obtener todos los productos
 * 3. Guardar/actualizar en base de datos
 */
export async function scrapeFullCatalog(
  options: CatalogScrapingOptions
): Promise<ScrapingResult> {
  const { storeId, location = 'Puerto Rico', categories, limit } = options;
  const startTime = Date.now();
  
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🏪 SCRAPING CATÁLOGO COMPLETO: ${STORE_NAMES[storeId]}`);
  console.log(`📍 Ubicación: ${location}`);
  console.log('='.repeat(60));

  // Crear job de scraping
  const job = await ScrapingJob.create({
    storeId,
    storeName: STORE_NAMES[storeId],
    location,
    status: 'running',
    progress: 0,
    startedAt: new Date(),
  });

  let productsNew = 0;
  let productsUpdated = 0;
  let productsSkipped = 0;
  let errorCount = 0;
  const allProducts: IStoreProduct[] = [];

  try {
    const scraper = scrapers[storeId];
    if (!scraper) {
      throw new Error(`Scraper no encontrado para: ${storeId}`);
    }

    // Obtener categorías del supermercado
    // Por ahora, usamos categorías comunes. En el futuro, cada scraper puede tener su propia lista
    const categoriesToScrape = categories || getDefaultCategories();
    
    console.log(`📂 Categorías a scrapear: ${categoriesToScrape.length}`);

    // Scrapear cada categoría
    for (let i = 0; i < categoriesToScrape.length; i++) {
      const category = categoriesToScrape[i];
      console.log(`\n[${i + 1}/${categoriesToScrape.length}] Scrapeando categoría: ${category}`);

      try {
        // Cada scraper necesita implementar scrapeCategory()
        // Por ahora, usamos búsqueda por término de categoría
        const products = await scrapeCategoryProducts(
          scraper,
          category,
          location,
          limit
        );

        console.log(`   ✅ Encontrados ${products.length} productos`);

        // Procesar y guardar productos
        for (const product of products) {
          try {
            const result = await saveOrUpdateProduct({
              ...product,
              storeId,
              storeName: STORE_NAMES[storeId],
              location,
              category,
            });

            if (result === 'new') productsNew++;
            else if (result === 'updated') productsUpdated++;
            else productsSkipped++;

            allProducts.push(product as any);
          } catch (error: any) {
            console.error(`   ⚠️ Error guardando producto: ${error.message}`);
            errorCount++;
          }
        }

        // Actualizar progreso del job
        const progress = Math.round(((i + 1) / categoriesToScrape.length) * 100);
        await job.updateOne({
          progress,
          productsScraped: allProducts.length,
          productsNew,
          productsUpdated,
          errorCount,
        });
      } catch (error: any) {
        console.error(`   ❌ Error scrapeando categoría ${category}:`, error.message);
        errorCount++;
      }
    }

    // Completar job
    const duration = Date.now() - startTime;
    await job.updateOne({
      status: 'completed',
      progress: 100,
      completedAt: new Date(),
      totalProducts: allProducts.length,
      productsNew,
      productsUpdated,
      'metadata.lastSuccessfulScrape': new Date(),
    });

    console.log(`\n✅ SCRAPING COMPLETADO`);
    console.log(`   Total productos: ${allProducts.length}`);
    console.log(`   Nuevos: ${productsNew}`);
    console.log(`   Actualizados: ${productsUpdated}`);
    console.log(`   Omitidos: ${productsSkipped}`);
    console.log(`   Errores: ${errorCount}`);
    console.log(`   Duración: ${(duration / 1000).toFixed(2)}s`);
    console.log('='.repeat(60) + '\n');

    return {
      storeId,
      storeName: STORE_NAMES[storeId],
      location,
      totalProducts: allProducts.length,
      productsNew,
      productsUpdated,
      productsSkipped,
      errorCount,
      duration,
    };
  } catch (error: any) {
    console.error(`\n❌ ERROR EN SCRAPING:`, error.message);
    
    await job.updateOne({
      status: 'failed',
      errorMessage: error.message,
      completedAt: new Date(),
    });

    throw error;
  }
}

/**
 * Obtener productos de una categoría específica
 * Por ahora usa búsqueda por término, pero cada scraper puede implementar su propia lógica
 */
async function scrapeCategoryProducts(
  scraper: any,
  category: string,
  location: string,
  limit?: number
): Promise<any[]> {
  // Usar el scraper existente con búsqueda por categoría
  // Esto es temporal - cada scraper debería tener un método scrapeCategory()
  try {
    const results = await scraper(category, location);
    return limit ? results.slice(0, limit) : results;
  } catch (error) {
    console.error(`Error scrapeando categoría ${category}:`, error);
    return [];
  }
}

/**
 * Guardar o actualizar producto en base de datos
 */
async function saveOrUpdateProduct(
  productData: Partial<IStoreProduct>
): Promise<'new' | 'updated' | 'skipped'> {
  const {
    name,
    storeId,
    location,
    storeUrl,
    price,
    upc,
    category,
    description,
  } = productData;

  if (!name || !storeId || !location || price === undefined) {
    return 'skipped';
  }

  // VALIDAR: Solo guardar productos de comida/groceries
  if (!isValidFoodProduct(name, category, description)) {
    console.log(`   ⏭️ Producto rechazado (no es comida): ${name}`);
    return 'skipped';
  }

  // Buscar producto existente
  // Usar storeUrl como identificador único si está disponible
  const query: any = {
    name: name.trim(),
    storeId,
    location,
  };

  if (storeUrl) {
    query.storeUrl = storeUrl;
  } else if (upc) {
    query.upc = upc;
  }

  const existing = await StoreProduct.findOne(query);

  // Generar keywords de búsqueda
  const searchKeywords = generateSearchKeywords(name, productData.brand);

  if (existing) {
    // Actualizar producto existente
    const priceChanged = existing.price !== price;
    
    if (priceChanged && existing.priceHistory) {
      existing.priceHistory.push({
        price: existing.price,
        date: existing.lastScraped,
      });
    }

    existing.price = price;
    existing.available = productData.available ?? true;
    existing.inStock = productData.inStock ?? true;
    existing.lastScraped = new Date();
    existing.scrapedAt = new Date();
    existing.searchKeywords = searchKeywords;
    
    if (productData.imageUrl) existing.imageUrl = productData.imageUrl;
    if (productData.description) existing.description = productData.description;
    if (productData.size) existing.size = productData.size;
    if (productData.unitPrice) existing.unitPrice = productData.unitPrice;
    if (productData.unit) existing.unit = productData.unit;

    await existing.save();
    return priceChanged ? 'updated' : 'skipped';
  } else {
    // Crear nuevo producto
    // Asegurar que la categoría sea válida
    const validCategory = category && isValidFoodProduct(name, category)
      ? category
      : inferFoodCategory(name, category);
    
    await StoreProduct.create({
      ...productData,
      category: validCategory,
      searchKeywords,
      lastScraped: new Date(),
      scrapedAt: new Date(),
    });
    return 'new';
  }
}

/**
 * Generar keywords de búsqueda para indexación
 */
function generateSearchKeywords(name: string, brand?: string): string[] {
  const keywords = new Set<string>();
  
  // Nombre completo en minúsculas
  keywords.add(name.toLowerCase());
  
  // Palabras individuales del nombre
  name
    .toLowerCase()
    .split(/\s+/)
    .forEach((word) => {
      if (word.length > 2) {
        keywords.add(word);
      }
    });
  
  // Brand si existe
  if (brand) {
    keywords.add(brand.toLowerCase());
  }
  
  return Array.from(keywords);
}

/**
 * Categorías por defecto para scraping
 */
function getDefaultCategories(): string[] {
  return [
    'leche',
    'arroz',
    'frijoles',
    'aceite',
    'azúcar',
    'harina',
    'pan',
    'huevos',
    'jamón',
    'queso',
    'pollo',
    'carne',
    'pescado',
    'frutas',
    'vegetales',
    'cereal',
    'galletas',
    'refrescos',
    'agua',
    'detergente',
    'jabón',
    'papel',
    'limpieza',
  ];
}

/**
 * Scrapear todos los supermercados
 */
export async function scrapeAllStores(
  locations: string[] = ['Puerto Rico']
): Promise<ScrapingResult[]> {
  const results: ScrapingResult[] = [];

  for (const storeId of STORES_WITH_SCRAPERS) {
    for (const location of locations) {
      try {
        const result = await scrapeFullCatalog({
          storeId: storeId as StoreId,
          location,
        });
        results.push(result);
      } catch (error: any) {
        console.error(`Error scrapeando ${storeId}:`, error.message);
      }
    }
  }

  return results;
}
