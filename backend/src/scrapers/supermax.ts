/**
 * Scraper SuperMax PR - https://www.supermaxonline.com (tienda online)
 */

import type { StoreInfo } from '../types/index.js';
import { STORE_NAMES, STORE_LOCATIONS, type StoreId } from './config.js';
import { launchBrowser, runWithTimeout, setPageUserAgent, normalizeToStoreInfo } from './utils.js';

const STORE: StoreId = 'supermax';
const TIMEOUT_MS = 10_000;

export async function searchSuperMax(query: string, location?: string): Promise<StoreInfo[]> {
  const browser = await launchBrowser();
  try {
    return await runWithTimeout(scrape(), TIMEOUT_MS, 'SuperMax');
  } catch {
    return [];
  } finally {
    await browser.close().catch(() => {});
  }

  async function scrape(): Promise<StoreInfo[]> {
    const page = await browser.newPage();
    await setPageUserAgent(page);
    await page.setViewport({ width: 1280, height: 800 });

    const base = 'https://www.supermaxonline.com';
    const url = `${base}/search?q=${encodeURIComponent(query)}`;
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 15000 });

    await page
      .waitForSelector(
        '.product-item, [class*="product-item"], .product-name, [class*="product"]',
        { timeout: 5000 }
      )
      .catch(() => {});

    const raw = await page.evaluate(() => {
      const items = document.querySelectorAll(
        '.product-item, [class*="product-item"], [class*="product"]'
      );
      return Array.from(items).map((item) => {
        const nameEl = item.querySelector('.product-name, [class*="product-name"], .name, h3, a');
        const priceEl = item.querySelector('.product-price, [class*="price"]');
        const brandEl = item.querySelector('.product-brand, [class*="brand"]');
        const link = item.querySelector('a');
        return {
          name: nameEl?.textContent?.trim(),
          price: priceEl?.textContent?.trim(),
          brand: brandEl?.textContent?.trim(),
          url: link?.href,
          available:
            !item.classList.contains('out-of-stock') && !item.querySelector('.out-of-stock'),
        };
      });
    });

    const loc = location || STORE_LOCATIONS[STORE][0] || 'Puerto Rico';
    return normalizeToStoreInfo(raw, STORE_NAMES[STORE], loc);
  }
}
