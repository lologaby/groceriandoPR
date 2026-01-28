/**
 * Utilidades compartidas para scrapers: parsePrice, browser launch, timeout, retry.
 */

import puppeteer, { type Browser, type LaunchOptions } from 'puppeteer';
import type { StoreInfo } from '../types/index.js';
import { nextUserAgent } from './config.js';

export function parsePrice(priceText: string | null | undefined): number {
  if (!priceText || typeof priceText !== 'string') return 0;
  const m = priceText.replace(/,/g, '').match(/[\d.]+/);
  return m ? parseFloat(m[0]) : 0;
}

export function normalizeToStoreInfo(
  raw: Array<{
    name?: string;
    price?: string | number;
    brand?: string;
    url?: string;
    available?: boolean;
    image?: string;
  }>,
  chain: string,
  location: string
): StoreInfo[] {
  return raw
    .filter((p) => p?.name && String(p.name).trim().length > 1)
    .slice(0, 10)
    .map((p) => {
      const price = typeof p.price === 'number' ? p.price : parsePrice(String(p.price ?? ''));
      return {
        chain,
        location,
        price,
        available: p.available !== false,
        inStock: p.available !== false,
        url: String(p.url ?? '').trim() || '',
        onSale: false,
        productName: String(p.name ?? '').trim(),
        brand: p.brand ? String(p.brand).trim() : undefined,
      };
    });
}

export function getLaunchOptions(): LaunchOptions {
  const opts: LaunchOptions = {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
  };
  const exec = process.env.PUPPETEER_EXECUTABLE_PATH;
  if (exec) opts.executablePath = exec;
  return opts;
}

export async function launchBrowser(): Promise<Browser> {
  return puppeteer.launch(getLaunchOptions());
}

export function runWithTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`Timeout ${label} (${ms}ms)`)), ms)
    ),
  ]);
}

const DEFAULT_RETRIES = 3;
const BASE_DELAY_MS = 1000;

export async function withRetry<T>(
  fn: () => Promise<T>,
  label: string,
  retries = DEFAULT_RETRIES
): Promise<T> {
  let lastErr: unknown;
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (e) {
      lastErr = e;
      if (i < retries - 1) {
        const delay = BASE_DELAY_MS * Math.pow(2, i);
        await new Promise((r) => setTimeout(r, delay));
      }
    }
  }
  throw lastErr;
}

export function setPageUserAgent(page: {
  setUserAgent: (ua: string) => Promise<void>;
}): Promise<void> {
  return page.setUserAgent(nextUserAgent());
}
