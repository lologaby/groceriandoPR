/**
 * Background Worker para scraping de productos
 * Procesa jobs de scraping en background y actualiza cache
 */

import Bull from 'bull';
import { scrapingQueue, type ScrapingJobData } from '../lib/queues.js';
import { checkStores } from '../services/checkStoresService.js';
import { setCache, checkStoresKey, TTL_CHECK_STORES } from '../lib/redis.js';

/**
 * Procesar job de scraping
 */
async function processScrapingJob(job: Bull.Job<ScrapingJobData>): Promise<void> {
  const { productName, upc, brand, userLocation, size } = job.data;

  console.log(`\n[Worker] Procesando scraping job:`);
  console.log(`  Producto: ${productName}`);
  console.log(`  UPC: ${upc}`);
  console.log(`  Ubicación: ${userLocation}`);

  try {
    // Actualizar progreso
    await job.progress(10);

    // Ejecutar scraping
    const results = await checkStores({
      productName,
      upc,
      brand,
      userLocation: userLocation || 'Puerto Rico',
      size,
    });

    await job.progress(80);

    // Guardar en cache
    const cacheKey = checkStoresKey(upc, userLocation || 'Puerto Rico');
    await setCache(cacheKey, results, TTL_CHECK_STORES);

    await job.progress(100);

    console.log(`[Worker] ✅ Scraping completado para ${productName}`);
    console.log(`  Resultados: ${results.results.length} tiendas`);
    console.log(`  Mejor precio: $${results.bestPrice || 'N/A'}`);

    // Retornar resultados para que estén disponibles en el job
    return results as any;
  } catch (error: any) {
    console.error(`[Worker] ❌ Error en scraping job:`, error.message);
    throw error; // Re-throw para que Bull maneje el retry
  }
}

/**
 * Inicializar worker
 */
export function startScrapingWorker(): void {
  console.log('[Worker] Iniciando scraping worker...');

  scrapingQueue.process(async (job) => {
    return processScrapingJob(job);
  });

  console.log('[Worker] ✅ Scraping worker iniciado');
}

/**
 * Obtener estadísticas del worker
 */
export async function getWorkerStats(): Promise<{
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
}> {
  const [waiting, active, completed, failed, delayed] = await Promise.all([
    scrapingQueue.getWaitingCount(),
    scrapingQueue.getActiveCount(),
    scrapingQueue.getCompletedCount(),
    scrapingQueue.getFailedCount(),
    scrapingQueue.getDelayedCount(),
  ]);

  return {
    waiting,
    active,
    completed,
    failed,
    delayed,
  };
}
