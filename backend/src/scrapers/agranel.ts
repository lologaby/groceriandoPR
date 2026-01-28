/**
 * Scraper Agranel PR - https://www.agranelpr.com
 */

import type { StoreInfo } from '../types/index.js';
import { STORE_NAMES, STORE_LOCATIONS, type StoreId } from './config.js';
import { launchBrowser, runWithTimeout, setPageUserAgent, normalizeToStoreInfo } from './utils.js';

const STORE: StoreId = 'agranel';
const TIMEOUT_MS = 10_000;

export async function searchAgranel(query: string, location?: string): Promise<StoreInfo[]> {
  const browser = await launchBrowser();
  try {
    return await runWithTimeout(scrape(), TIMEOUT_MS, 'Agranel');
  } catch {
    return [];
  } finally {
    await browser.close().catch(() => {});
  }

  async function scrape(): Promise<StoreInfo[]> {
    const page = await browser.newPage();
    await setPageUserAgent(page);
    await page.setViewport({ width: 1280, height: 800 });

    const base = 'https://www.agranelpr.com';
    const url = `${base}/productos?buscar=${encodeURIComponent(query)}`;
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 15000 });

    await page
      .waitForSelector('.producto, .item-producto, [class*="producto"]', { timeout: 5000 })
      .catch(() => {});

    const raw = await page.evaluate(() => {
      const items = document.querySelectorAll('.producto, .item-producto, [class*="producto"]');
      return Array.from(items).map((item) => {
        const nameEl = item.querySelector(
          '.nombre, .titulo, [class*="nombre"], [class*="titulo"], h3'
        );
        const priceEl = item.querySelector('.precio, [class*="precio"]');
        const brandEl = item.querySelector('.marca, [class*="marca"]');
        const link = item.querySelector('a');
        return {
          name: nameEl?.textContent?.trim(),
          price: priceEl?.textContent?.trim(),
          brand: brandEl?.textContent?.trim(),
          url: link?.href,
          available: !item.querySelector('.agotado'),
        };
      });
    });

    const loc = location || STORE_LOCATIONS[STORE][0] || 'Puerto Rico';
    return normalizeToStoreInfo(raw, STORE_NAMES[STORE], loc);
  }
}
