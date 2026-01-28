/**
 * Scheduled Jobs usando node-cron
 * Ejecuta tareas periódicas como cache warming de productos populares
 */

import cron from 'node-cron';
import { warmPopularProducts } from '../workers/cacheWarmingWorker.js';

/**
 * Inicializar scheduled jobs
 */
export function startScheduledJobs(): void {
  console.log('[Scheduled Jobs] Inicializando jobs programados...');

  // Cache warming de productos populares cada 2 horas
  // Ejecuta a las :00 y :30 de cada hora
  cron.schedule('0,30 * * * *', async () => {
    console.log('[Scheduled Jobs] 🕐 Ejecutando cache warming de productos populares...');
    try {
      await warmPopularProducts('Puerto Rico');
      console.log('[Scheduled Jobs] ✅ Cache warming completado');
    } catch (error: any) {
      console.error('[Scheduled Jobs] ❌ Error en cache warming:', error.message);
    }
  });

  // Cache warming diario a las 6 AM (cuando los precios suelen actualizarse)
  cron.schedule('0 6 * * *', async () => {
    console.log('[Scheduled Jobs] 🌅 Ejecutando cache warming diario...');
    try {
      await warmPopularProducts('Puerto Rico');
      console.log('[Scheduled Jobs] ✅ Cache warming diario completado');
    } catch (error: any) {
      console.error('[Scheduled Jobs] ❌ Error en cache warming diario:', error.message);
    }
  });

  console.log('[Scheduled Jobs] ✅ Jobs programados iniciados:');
  console.log('  - Cache warming cada 2 horas (00 y 30 minutos)');
  console.log('  - Cache warming diario a las 6:00 AM');
}

/**
 * Detener scheduled jobs (útil para tests)
 */
export function stopScheduledJobs(): void {
  // node-cron no tiene un método directo para detener todos los jobs
  // En producción, esto se manejaría con un graceful shutdown
  console.log('[Scheduled Jobs] ⚠️ Deteniendo jobs programados...');
}
