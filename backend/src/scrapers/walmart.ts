/**
 * Scraper Walmart PR - https://www.walmart.com (filtro PR)
 */

import type { StoreInfo } from '../types/index.js';
import { STORE_NAMES, STORE_LOCATIONS } from './config.js';
import { launchBrowser, runWithTimeout, setPageUserAgent } from './utils.js';

const STORE = 'walmart' as const;
const BASE = 'https://www.walmart.com/search';
const TIMEOUT_MS = 10_000;

interface RawItem {
  productName: string;
  price: number | null;
  rawPriceText: string;
  url: string;
  available: boolean;
}

export async function searchWalmart(query: string, location?: string): Promise<StoreInfo[]> {
  const browser = await launchBrowser();
  try {
    return await runWithTimeout(scrape(), TIMEOUT_MS, 'Walmart');
  } catch {
    return [];
  } finally {
    await browser.close().catch(() => {});
  }

  async function scrape(): Promise<StoreInfo[]> {
    const page = await browser.newPage();
    await setPageUserAgent(page);
    await page.setViewport({ width: 1280, height: 800 });

    const url = `${BASE}?q=${encodeURIComponent(query)}`;
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 20000 });

    await page
      .waitForSelector(
        '[data-item-id], [data-testid="list-view"], [class*="search-result"], [class*="ProductCard"], [data-automation-id="product-title"]',
        { timeout: 12000 }
      )
      .catch(() => {});

    const raw: RawItem[] = await page.evaluate(() => {
      const results: RawItem[] = [];
      const itemSelectors = [
        '[data-item-id]',
        '[data-testid="list-view"] > div',
        '[class*="ProductCard"]',
        '[class*="search-result"] li',
      ];
      const titleSelectors = [
        '[data-automation-id="product-title"]',
        '[data-testid="product-title"]',
        'a[class*="product-title"]',
        'a[href*="/ip/"]',
      ];
      const priceSelectors = [
        '[data-automation-id="product-price"]',
        '[data-testid="product-price"]',
        '[class*="price"]',
      ];

      let items: Element[] = [];
      for (const sel of itemSelectors) {
        const n = document.querySelectorAll(sel);
        if (n.length) {
          items = Array.from(n);
          break;
        }
      }

      for (const item of items) {
        let name = '';
        for (const sel of titleSelectors) {
          const el = item.querySelector(sel);
          const link = item.querySelector('a[href*="/ip/"]');
          if (el) name = (el.textContent ?? '').trim();
          if (!name && link)
            name = (link.getAttribute('aria-label') ?? link.textContent ?? '').trim();
          if (name && name.length > 1) break;
        }
        if (!name || name.length < 2) continue;

        let rawPrice = '';
        let price: number | null = null;
        for (const sel of priceSelectors) {
          const el = item.querySelector(sel);
          if (!el) continue;
          rawPrice = (el.textContent ?? '').trim();
          const m = rawPrice.replace(/,/g, '').match(/\$?\s*([\d.]+)/);
          if (m) {
            price = parseFloat(m[1]);
            break;
          }
        }

        const link = item.querySelector('a[href*="/ip/"]') as HTMLAnchorElement | null;
        let href = link?.href ?? '';
        if (href && !href.startsWith('http')) href = new URL(href, window.location.origin).href;

        const outOfStock = item.querySelector('.out-of-stock, [class*="OutOfStock"]');
        results.push({
          productName: name,
          price,
          rawPriceText: rawPrice,
          url: href,
          available: !outOfStock,
        });
      }
      return results;
    });

    const loc = location || STORE_LOCATIONS[STORE][0] || 'Puerto Rico';
    return raw
      .filter((s) => s.productName && (s.price != null || s.rawPriceText))
      .slice(0, 10)
      .map((s) => ({
        chain: STORE_NAMES[STORE],
        location: loc,
        price: s.price ?? 0,
        available: s.available,
        inStock: s.available,
        url: s.url,
        onSale: false,
        productName: s.productName,
        rawPriceText: s.rawPriceText,
      }));
  }
}
