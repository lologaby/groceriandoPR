/**
 * Bull Queues para background jobs
 * Maneja scraping en background y cache warming
 */

import Bull from 'bull';

// Configuración de Redis para Bull
const REDIS_CONFIG = {
  host: process.env.REDIS_HOST || 'localhost',
  port: Number(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD,
  db: Number(process.env.REDIS_DB) || 0,
};

/**
 * Queue para scraping de productos en supermercados
 */
export const scrapingQueue = new Bull('scraping', {
  redis: REDIS_CONFIG,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000, // 2s, 4s, 8s
    },
    removeOnComplete: {
      age: 3600, // Mantener jobs completados por 1 hora
      count: 1000, // Máximo 1000 jobs completados
    },
    removeOnFail: {
      age: 86400, // Mantener jobs fallidos por 24 horas
    },
  },
});

/**
 * Queue para cache warming de productos populares
 */
export const cacheWarmingQueue = new Bull('cache-warming', {
  redis: REDIS_CONFIG,
  defaultJobOptions: {
    attempts: 2,
    backoff: {
      type: 'fixed',
      delay: 5000,
    },
    removeOnComplete: {
      age: 7200, // 2 horas
      count: 500,
    },
  },
});

// Event listeners para debugging
scrapingQueue.on('completed', (job) => {
  console.log(`[Queue] Scraping job ${job.id} completado`);
});

scrapingQueue.on('failed', (job, err) => {
  console.error(`[Queue] Scraping job ${job.id} falló:`, err.message);
});

cacheWarmingQueue.on('completed', (job) => {
  console.log(`[Queue] Cache warming job ${job.id} completado`);
});

cacheWarmingQueue.on('failed', (job, err) => {
  console.error(`[Queue] Cache warming job ${job.id} falló:`, err.message);
});

/**
 * Tipos de jobs
 */
export interface ScrapingJobData {
  productName: string;
  upc: string;
  brand?: string;
  userLocation: string;
  size?: string;
}

export interface CacheWarmingJobData {
  productName: string;
  upc: string;
  brand?: string;
  location: string;
  priority?: 'high' | 'medium' | 'low';
}

/**
 * Helper para agregar job de scraping
 */
export async function addScrapingJob(
  data: ScrapingJobData,
  options?: { priority?: number; delay?: number }
): Promise<Bull.Job<ScrapingJobData>> {
  return scrapingQueue.add(data, {
    priority: options?.priority || 0,
    delay: options?.delay || 0,
  });
}

/**
 * Helper para agregar job de cache warming
 */
export async function addCacheWarmingJob(
  data: CacheWarmingJobData
): Promise<Bull.Job<CacheWarmingJobData>> {
  return cacheWarmingQueue.add(data, {
    priority: data.priority === 'high' ? 10 : data.priority === 'medium' ? 5 : 0,
  });
}

/**
 * Obtener estado de un job
 */
export async function getJobStatus(jobId: string | number): Promise<{
  id: string | number;
  state: 'waiting' | 'active' | 'completed' | 'failed' | 'delayed';
  progress?: number;
  data?: any;
  result?: any;
  error?: string;
} | null> {
  const job = await scrapingQueue.getJob(jobId);
  if (!job) return null;

  const state = await job.getState();
  const progress = job.progress();

  return {
    id: job.id!,
    state: state as 'waiting' | 'active' | 'completed' | 'failed' | 'delayed',
    progress: typeof progress === 'number' ? progress : undefined,
    data: job.data,
    result: job.returnvalue,
    error: job.failedReason || undefined,
  };
}

/**
 * Limpiar queues (útil para desarrollo)
 */
export async function cleanQueues(): Promise<void> {
  await scrapingQueue.clean(0, 'completed');
  await scrapingQueue.clean(0, 'failed');
  await cacheWarmingQueue.clean(0, 'completed');
  await cacheWarmingQueue.clean(0, 'failed');
}
