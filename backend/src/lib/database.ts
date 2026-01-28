/**
 * MongoDB Connection
 * Base de datos para almacenar productos scrapeados de supermercados
 */

import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/groceriando';

export async function connectDatabase(): Promise<void> {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('[MongoDB] ✅ Conectado exitosamente');
  } catch (error: any) {
    console.error('[MongoDB] ❌ Error conectando:', error.message);
    throw error;
  }
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
  console.log('[MongoDB] Desconectado');
}

// Manejar eventos de conexión
mongoose.connection.on('error', (err) => {
  console.error('[MongoDB] Error de conexión:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('[MongoDB] Desconectado');
});

mongoose.connection.on('reconnected', () => {
  console.log('[MongoDB] Reconectado');
});
