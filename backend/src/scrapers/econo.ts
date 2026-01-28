/**
 * Scraper Econo PR - https://www.econo.com
 */

import type { StoreInfo } from '../types/index.js';
import { STORE_NAMES, STORE_LOCATIONS, type StoreId } from './config.js';
import { launchBrowser, runWithTimeout, setPageUserAgent, normalizeToStoreInfo } from './utils.js';

const STORE: StoreId = 'econo';
const TIMEOUT_MS = 10_000;

export async function searchEcono(query: string, location?: string): Promise<StoreInfo[]> {
  const browser = await launchBrowser();
  try {
    return await runWithTimeout(scrape(), TIMEOUT_MS, 'Econo');
  } catch {
    return [];
  } finally {
    await browser.close().catch(() => {});
  }

  async function scrape(): Promise<StoreInfo[]> {
    const page = await browser.newPage();
    await setPageUserAgent(page);
    await page.setViewport({ width: 1280, height: 800 });

    const base = 'https://www.econo.com';
    const url = `${base}/buscar?q=${encodeURIComponent(query)}`;
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 15000 });

    await page
      .waitForSelector(
        '.product-card, [class*="product-card"], .product-title, [class*="product"]',
        { timeout: 5000 }
      )
      .catch(() => {});

    const raw = await page.evaluate(() => {
      const items = document.querySelectorAll(
        '.product-card, [class*="product-card"], [class*="product"]'
      );
      return Array.from(items).map((item) => {
        const nameEl = item.querySelector('.product-title, [class*="product-title"], .name, h3, a');
        const priceEl = item.querySelector('.price-amount, [class*="price"]');
        const brandEl = item.querySelector('.product-brand, [class*="brand"]');
        const stockEl = item.querySelector('.stock-status, [class*="stock"]');
        const link = item.querySelector('a');
        const inStock =
          !stockEl || (stockEl.textContent ?? '').toLowerCase().includes('disponible');
        return {
          name: nameEl?.textContent?.trim(),
          price: priceEl?.textContent?.trim(),
          brand: brandEl?.textContent?.trim(),
          url: link?.href,
          available: inStock,
        };
      });
    });

    const loc = location || STORE_LOCATIONS[STORE][0] || 'Puerto Rico';
    return normalizeToStoreInfo(raw, STORE_NAMES[STORE], loc);
  }
}
