/**
 * Groceriando API - ACTUALIZADO
 * 
 * Arquitectura con Background Jobs y Cache:
 * - Redis para cache persistente
 * - Bull para job queues
 * - Background workers para scraping
 * - Scheduled jobs para cache warming
 */

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { errorHandler } from './middleware/errorHandler.js';
import productsRouter from './routes/products.js';
import notionRouter from './routes/notion.js';
import { startScrapingWorker } from './workers/scrapingWorker.js';
import { startCacheWarmingWorker } from './workers/cacheWarmingWorker.js';
import { startScheduledJobs } from './jobs/scheduledJobs.js';
import { startCatalogScrapingJobs } from './jobs/catalogScrapingJobs.js';
// Redis se importa solo si es necesario
import { connectDatabase } from './lib/database.js';

const PORT = Number(process.env.PORT) || 3001;

const app = express();

// CORS configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? [
        process.env.FRONTEND_URL || 'https://groceriando.vercel.app',
        /\.vercel\.app$/, // Cualquier subdominio de Vercel
      ]
    : [
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:3000',
      ],
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());

// Routes
app.use('/api/products', productsRouter);
app.use('/api/notion', notionRouter);

// Health check
app.get('/health', async (_req, res) => {
  try {
    // Verificar conexión Redis (opcional)
    let redisStatus = 'unavailable';
    try {
      const { pingRedis, isRedisAvailable } = await import('./lib/redis.js');
      if (isRedisAvailable() && await pingRedis()) {
        redisStatus = 'connected';
      } else {
        redisStatus = 'memory-fallback';
      }
    } catch (error) {
      redisStatus = 'memory-fallback';
    }
    
    // Verificar conexión MongoDB
    const mongoose = await import('mongoose');
    const mongoStatus = mongoose.default.connection.readyState === 1 ? 'connected' : 'disconnected';
    
    res.json({
      ok: true,
      service: 'groceriando-api',
      redis: redisStatus,
      mongodb: mongoStatus,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    res.status(503).json({
      ok: false,
      service: 'groceriando-api',
      redis: 'error',
      mongodb: 'error',
      error: error.message,
    });
  }
});

// Queue stats endpoint
app.get('/api/queues/stats', async (_req, res, next) => {
  try {
    const { getWorkerStats } = await import('./workers/scrapingWorker.js');
    const stats = await getWorkerStats();
    res.json({
      scraping: stats,
      timestamp: new Date().toISOString(),
    });
  } catch (e) {
    next(e);
  }
});

app.use(errorHandler);

// Inicializar workers y scheduled jobs
async function initializeWorkers() {
  try {
    console.log('\n🚀 Inicializando workers y scheduled jobs...\n');

    // Conectar a MongoDB
    await connectDatabase();

    // Iniciar workers
    startScrapingWorker();
    startCacheWarmingWorker();

    // Iniciar scheduled jobs
    startScheduledJobs();
    
    // Iniciar jobs de scraping completo de catálogos
    startCatalogScrapingJobs();

    // Cache warming inicial de productos populares (opcional)
    if (process.env.WARM_CACHE_ON_START === 'true') {
      console.log('[Startup] Ejecutando cache warming inicial...');
      const { warmPopularProducts } = await import('./workers/cacheWarmingWorker.js');
      await warmPopularProducts('Puerto Rico');
    }

    // Scraping inicial completo (opcional)
    if (process.env.SCRAPE_ON_START === 'true') {
      console.log('[Startup] ⚠️ Ejecutando scraping completo inicial (esto puede tardar)...');
      const { scrapeAllStores } = await import('./services/catalogScraperService.js');
      await scrapeAllStores(['Puerto Rico']);
    }

    console.log('\n✅ Workers y scheduled jobs inicializados\n');
  } catch (error: any) {
    console.error('❌ Error inicializando workers:', error);
  }
}

// Iniciar servidor
app.listen(PORT, async () => {
  console.log(`[Groceriando] API escuchando en http://localhost:${PORT}`);
  console.log(`[Groceriando] Redis: ${process.env.REDIS_URL || 'redis://localhost:6379'}`);
  
  // Inicializar workers después de que el servidor esté listo
  await initializeWorkers();
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('\n[SIGTERM] Cerrando servidor gracefully...');
  const { closeRedis } = await import('./lib/redis.js');
  await closeRedis();
  const mongoose = await import('mongoose');
  await mongoose.default.disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('\n[SIGINT] Cerrando servidor gracefully...');
  const { closeRedis } = await import('./lib/redis.js');
  await closeRedis();
  const mongoose = await import('mongoose');
  await mongoose.default.disconnect();
  process.exit(0);
});
