/**
 * Scraper Pueblo - https://www.pueblosupermarkets.com
 */

import type { StoreInfo } from '../types/index.js';
import { STORE_NAMES, STORE_LOCATIONS, type StoreId } from './config.js';
import { launchBrowser, runWithTimeout, setPageUserAgent, normalizeToStoreInfo } from './utils.js';

const STORE: StoreId = 'pueblo';
const TIMEOUT_MS = 10_000;

export async function searchPueblo(query: string, location?: string): Promise<StoreInfo[]> {
  const browser = await launchBrowser();
  try {
    return await runWithTimeout(scrape(), TIMEOUT_MS, 'Pueblo');
  } catch {
    return [];
  } finally {
    await browser.close().catch(() => {});
  }

  async function scrape(): Promise<StoreInfo[]> {
    const page = await browser.newPage();
    await setPageUserAgent(page);
    await page.setViewport({ width: 1280, height: 800 });

    const base = 'https://www.pueblosupermarkets.com';
    const url = `${base}/search?q=${encodeURIComponent(query)}`;
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 15000 });

    await page
      .waitForSelector('.product-container, .product-item, [class*="product"]', { timeout: 5000 })
      .catch(() => {});

    const raw = await page.evaluate(() => {
      const items = document.querySelectorAll(
        '.product-container, .product-item, [class*="product"]'
      );
      return Array.from(items).map((item) => {
        const nameEl = item.querySelector('.product-name, h3, [class*="name"]');
        const priceEl = item.querySelector('.product-price, .price, [class*="price"]');
        const brandEl = item.querySelector('.product-brand, .brand, [class*="brand"]');
        const link = item.querySelector('a');
        return {
          name: nameEl?.textContent?.trim(),
          price: priceEl?.textContent?.trim(),
          brand: brandEl?.textContent?.trim(),
          url: link?.href,
          available: !item.querySelector('.unavailable, .out-of-stock'),
        };
      });
    });

    const loc = location || STORE_LOCATIONS[STORE][0] || 'Puerto Rico';
    return normalizeToStoreInfo(raw, STORE_NAMES[STORE], loc);
  }
}
