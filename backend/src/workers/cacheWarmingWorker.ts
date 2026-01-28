/**
 * Background Worker para cache warming
 * Pre-scrapea productos populares para tenerlos listos en cache
 */

import Bull from 'bull';
import { cacheWarmingQueue, type CacheWarmingJobData } from '../lib/queues.js';
import { checkStores } from '../services/checkStoresService.js';
import { setCache, getCache, checkStoresKey, TTL_CHECK_STORES } from '../lib/redis.js';

/**
 * Lista de productos populares para cache warming
 * Estos productos se scrapean automáticamente cada cierto tiempo
 */
export const POPULAR_PRODUCTS = [
  { name: 'Leche', upc: '041000021007', brand: 'Goya', size: '1 galón' },
  { name: 'Arroz', upc: '041331000000', brand: 'Goya', size: '2 lbs' },
  { name: 'Jamón', upc: '007160000000', brand: 'Hormel', size: '8 oz' },
  { name: 'Pan', upc: '072140000000', brand: 'Wonder', size: '1 lb' },
  { name: 'Huevos', upc: '041303000000', brand: 'Goya', size: '12 unidades' },
  { name: 'Aceite', upc: '041331000000', brand: 'Goya', size: '32 oz' },
  { name: 'Azúcar', upc: '041331000000', brand: 'Goya', size: '4 lbs' },
  { name: 'Harina', upc: '041331000000', brand: 'Goya', size: '5 lbs' },
] as const;

/**
 * Procesar job de cache warming
 */
async function processCacheWarmingJob(
  job: Bull.Job<CacheWarmingJobData>
): Promise<void> {
  const { productName, upc, brand, location } = job.data;

  console.log(`\n[Cache Warming] Procesando: ${productName} (${upc})`);

  try {
    // Verificar si ya existe en cache (evitar trabajo innecesario)
    const cacheKey = checkStoresKey(upc, location);
    const cached = await getCache(cacheKey);
    if (cached) {
      console.log(`[Cache Warming] ⏭️ Ya existe en cache, saltando`);
      return;
    }

    // Ejecutar scraping
    const results = await checkStores({
      productName,
      upc,
      brand,
      userLocation: location || 'Puerto Rico',
    });

    // Guardar en cache
    await setCache(cacheKey, results, TTL_CHECK_STORES);

    console.log(`[Cache Warming] ✅ Cache actualizado para ${productName}`);
  } catch (error: any) {
    console.error(`[Cache Warming] ❌ Error:`, error.message);
    // No re-throw para cache warming - no queremos que falle el job
    // Solo logueamos el error
  }
}

/**
 * Inicializar worker de cache warming
 */
export function startCacheWarmingWorker(): void {
  console.log('[Worker] Iniciando cache warming worker...');

  cacheWarmingQueue.process(async (job) => {
    return processCacheWarmingJob(job);
  });

  console.log('[Worker] ✅ Cache warming worker iniciado');
}

/**
 * Agregar productos populares a la queue de cache warming
 */
export async function warmPopularProducts(location: string = 'Puerto Rico'): Promise<void> {
  console.log(`[Cache Warming] Agregando ${POPULAR_PRODUCTS.length} productos populares...`);

  const jobs = POPULAR_PRODUCTS.map((product) =>
    cacheWarmingQueue.add(
      {
        productName: product.name,
        upc: product.upc,
        brand: product.brand,
        location,
        priority: 'high',
      },
      {
        // Stagger los jobs para no sobrecargar
        delay: Math.random() * 30000, // 0-30 segundos de delay aleatorio
      }
    )
  );

  await Promise.all(jobs);
  console.log(`[Cache Warming] ✅ ${POPULAR_PRODUCTS.length} jobs agregados`);
}
