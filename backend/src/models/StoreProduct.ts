/**
 * Modelo de Producto de Supermercado
 * Almacena productos scrapeados de cada supermercado
 */

import mongoose, { Schema, Document } from 'mongoose';

export interface IStoreProduct extends Document {
  // Identificación del producto
  name: string;
  brand?: string;
  upc?: string;
  sku?: string;
  
  // Información del supermercado
  storeName: string;
  storeId: string; // 'supermax', 'econo', etc.
  location: string; // 'Bayamón', 'San Juan', etc.
  storeUrl?: string; // URL del producto en el sitio del supermercado
  
  // Precio y disponibilidad
  price: number;
  originalPrice?: number; // Si está en oferta
  unitPrice?: number; // Precio por unidad (ej. $/oz)
  unit?: string; // 'oz', 'lb', 'unit', etc.
  available: boolean;
  inStock: boolean;
  
  // Información adicional
  imageUrl?: string;
  description?: string;
  category?: string;
  size?: string; // '8 oz', '1 galón', etc.
  
  // Metadatos de scraping
  lastScraped: Date;
  scrapedAt: Date;
  priceHistory?: Array<{
    price: number;
    date: Date;
  }>;
  
  // Búsqueda y indexación
  searchKeywords: string[]; // Para búsqueda rápida
}

const StoreProductSchema = new Schema<IStoreProduct>(
  {
    name: { type: String, required: true, index: true },
    brand: { type: String, index: true },
    upc: { type: String, index: true },
    sku: { type: String },
    
    storeName: { type: String, required: true, index: true },
    storeId: { type: String, required: true, index: true },
    location: { type: String, required: true, index: true },
    storeUrl: { type: String },
    
    price: { type: Number, required: true, index: true },
    originalPrice: { type: Number },
    unitPrice: { type: Number },
    unit: { type: String },
    available: { type: Boolean, default: true, index: true },
    inStock: { type: Boolean, default: true, index: true },
    
    imageUrl: { type: String },
    description: { type: String },
    category: { type: String, index: true },
    size: { type: String },
    
    lastScraped: { type: Date, default: Date.now, index: true },
    scrapedAt: { type: Date, default: Date.now },
    priceHistory: [
      {
        price: { type: Number, required: true },
        date: { type: Date, default: Date.now },
      },
    ],
    
    searchKeywords: [{ type: String, index: true }],
  },
  {
    timestamps: true, // Crea createdAt y updatedAt automáticamente
  }
);

// Índices compuestos para búsquedas rápidas
StoreProductSchema.index({ storeId: 1, location: 1 });
StoreProductSchema.index({ name: 'text', brand: 'text', searchKeywords: 'text' });
StoreProductSchema.index({ upc: 1, storeId: 1 });
StoreProductSchema.index({ lastScraped: -1 }); // Para encontrar productos antiguos

// Método para actualizar precio y mantener historial
StoreProductSchema.methods.updatePrice = function(newPrice: number) {
  const currentPrice = this.price;
  
  // Solo actualizar si el precio cambió
  if (currentPrice !== newPrice) {
    // Agregar al historial
    if (!this.priceHistory) {
      this.priceHistory = [];
    }
    this.priceHistory.push({
      price: currentPrice,
      date: this.lastScraped,
    });
    
    // Actualizar precio actual
    this.price = newPrice;
    this.lastScraped = new Date();
  }
  
  return this.save();
};

export const StoreProduct = mongoose.model<IStoreProduct>('StoreProduct', StoreProductSchema);
