/**
 * Scheduled Jobs para Scraping Completo de Catálogos
 * Ejecuta scraping completo de todos los supermercados periódicamente
 */

import cron from 'node-cron';
import { scrapeAllStores, scrapeFullCatalog } from '../services/catalogScraperService.js';
import { STORES_WITH_SCRAPERS } from '../constants/stores.js';
import type { StoreId } from '../scrapers/index.js';

/**
 * Inicializar jobs programados de scraping completo
 */
export function startCatalogScrapingJobs(): void {
  console.log('[Catalog Scraping Jobs] Inicializando jobs programados...');

  // Scraping completo diario a las 3 AM (cuando hay menos tráfico)
  cron.schedule('0 3 * * *', async () => {
    console.log('[Catalog Scraping] 🌙 Iniciando scraping completo diario...');
    try {
      const results = await scrapeAllStores(['Puerto Rico']);
      console.log('[Catalog Scraping] ✅ Scraping diario completado');
      console.log(`   Total supermercados: ${results.length}`);
      console.log(`   Total productos: ${results.reduce((sum, r) => sum + r.totalProducts, 0)}`);
    } catch (error: any) {
      console.error('[Catalog Scraping] ❌ Error en scraping diario:', error.message);
    }
  });

  // Scraping incremental cada 6 horas (solo productos actualizados)
  cron.schedule('0 */6 * * *', async () => {
    console.log('[Catalog Scraping] 🔄 Iniciando scraping incremental...');
    try {
      // Scrapear solo categorías populares para actualizar precios
      const popularCategories = ['leche', 'arroz', 'jamón', 'huevos', 'pan', 'aceite'];
      
      for (const storeId of STORES_WITH_SCRAPERS) {
        try {
          await scrapeFullCatalog({
            storeId: storeId as StoreId,
            location: 'Puerto Rico',
            categories: popularCategories,
            limit: 100, // Límite por categoría para ser más rápido
          });
        } catch (error: any) {
          console.error(`[Catalog Scraping] Error en ${storeId}:`, error.message);
        }
      }
      
      console.log('[Catalog Scraping] ✅ Scraping incremental completado');
    } catch (error: any) {
      console.error('[Catalog Scraping] ❌ Error en scraping incremental:', error.message);
    }
  });

  // Scraping completo semanal (domingos a las 2 AM)
  cron.schedule('0 2 * * 0', async () => {
    console.log('[Catalog Scraping] 📅 Iniciando scraping completo semanal...');
    try {
      const results = await scrapeAllStores(['Puerto Rico']);
      console.log('[Catalog Scraping] ✅ Scraping semanal completado');
      console.log(`   Total productos scrapeados: ${results.reduce((sum, r) => sum + r.totalProducts, 0)}`);
    } catch (error: any) {
      console.error('[Catalog Scraping] ❌ Error en scraping semanal:', error.message);
    }
  });

  console.log('[Catalog Scraping Jobs] ✅ Jobs programados iniciados:');
  console.log('  - Scraping completo diario: 3:00 AM');
  console.log('  - Scraping incremental: Cada 6 horas');
  console.log('  - Scraping completo semanal: Domingos 2:00 AM');
}

/**
 * Ejecutar scraping manualmente (útil para testing o triggers manuales)
 */
export async function runManualScraping(
  storeId?: StoreId,
  location: string = 'Puerto Rico'
): Promise<void> {
  if (storeId) {
    console.log(`[Manual Scraping] Scrapeando ${storeId}...`);
    await scrapeFullCatalog({ storeId, location });
  } else {
    console.log('[Manual Scraping] Scrapeando todos los supermercados...');
    await scrapeAllStores([location]);
  }
}
