/**
 * Modelo de Job de Scraping
 * Trackea jobs de scraping completo de catálogos
 */

import mongoose, { Schema, Document } from 'mongoose';

export interface IScrapingJob extends Document {
  storeId: string;
  storeName: string;
  location?: string;
  
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number; // 0-100
  
  totalProducts?: number;
  productsScraped?: number;
  productsUpdated?: number;
  productsNew?: number;
  errorCount?: number;
  
  startedAt?: Date;
  completedAt?: Date;
  errorMessage?: string;
  
  metadata?: {
    categoriesScraped?: string[];
    lastSuccessfulScrape?: Date;
  };
}

const ScrapingJobSchema = new Schema<IScrapingJob>(
  {
    storeId: { type: String, required: true, index: true },
    storeName: { type: String, required: true },
    location: { type: String },
    
    status: {
      type: String,
      enum: ['pending', 'running', 'completed', 'failed'],
      default: 'pending',
      index: true,
    },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    
    totalProducts: { type: Number },
    productsScraped: { type: Number, default: 0 },
    productsUpdated: { type: Number, default: 0 },
    productsNew: { type: Number, default: 0 },
    errorCount: { type: Number, default: 0 },
    
    startedAt: { type: Date },
    completedAt: { type: Date },
    errorMessage: { type: String },
    
    metadata: {
      categoriesScraped: [{ type: String }],
      lastSuccessfulScrape: { type: Date },
    },
  },
  {
    timestamps: true,
  }
);

ScrapingJobSchema.index({ storeId: 1, status: 1 });
ScrapingJobSchema.index({ createdAt: -1 });

export const ScrapingJob = mongoose.model<IScrapingJob>('ScrapingJob', ScrapingJobSchema);
