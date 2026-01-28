/**
 * Scraper Selectos PR - https://www.selectospr.com
 */

import type { StoreInfo } from '../types/index.js';
import { STORE_NAMES, STORE_LOCATIONS, type StoreId } from './config.js';
import { launchBrowser, runWithTimeout, setPageUserAgent, normalizeToStoreInfo } from './utils.js';

const STORE: StoreId = 'selectos';
const TIMEOUT_MS = 10_000;

export async function searchSelectos(query: string, location?: string): Promise<StoreInfo[]> {
  const browser = await launchBrowser();
  try {
    return await runWithTimeout(scrape(), TIMEOUT_MS, 'Selectos');
  } catch {
    return [];
  } finally {
    await browser.close().catch(() => {});
  }

  async function scrape(): Promise<StoreInfo[]> {
    const page = await browser.newPage();
    await setPageUserAgent(page);
    await page.setViewport({ width: 1280, height: 800 });

    const base = 'https://www.selectospr.com';
    const url = `${base}/buscar?query=${encodeURIComponent(query)}`;
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 15000 });

    await page
      .waitForSelector('.product-item, .product-card, [class*="product"]', { timeout: 5000 })
      .catch(() => {});

    const raw = await page.evaluate(() => {
      const items = document.querySelectorAll('.product-item, .product-card, [class*="product"]');
      return Array.from(items).map((item) => {
        const nameEl = item.querySelector('.name, .title, [class*="name"], [class*="title"], h3');
        const priceEl = item.querySelector('.price, [class*="price"]');
        const brandEl = item.querySelector('.brand, [class*="brand"]');
        const link = item.querySelector('a');
        const inStock =
          item.querySelector('.in-stock') !== null || !item.querySelector('.out-of-stock');
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
