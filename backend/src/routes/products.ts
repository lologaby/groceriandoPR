/**
 * ACTUALIZADO - Enero 28, 2026
 * 
 * API de Productos - Ahora busca en base de datos local scrapeada
 * 
 * GET /api/products/search - Búsqueda en base de productos (UPCitemdb / local).
 * POST /api/products/check-stores - Busca en base de datos local (NO scraping en tiempo real).
 * GET /api/products/stats - Estadísticas de la base de datos.
 */

import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { searchProducts } from '../services/productDatabaseService.js';
import { getCache, setCache, productsKey, TTL_PRODUCTS } from '../lib/redis.js';
import { searchProductsInDatabase, findProductByUPC } from '../services/productSearchService.js';
import { getDatabaseStats } from '../services/productSearchService.js';

const router = Router();

const searchLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30, // Más permisivo porque ahora es solo búsqueda en DB
  message: { error: 'Demasiadas búsquedas. Espera un momento.' },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * GET /api/products/search
 * Búsqueda de productos en base externa (UPCitemdb) - Sin cambios
 */
router.get('/search', async (req, res, next) => {
  try {
    const q = (req.query.q as string)?.trim() ?? '';
    if (!q) {
      res.status(400).json({ error: 'Query "q" es requerido' });
      return;
    }

    const key = productsKey(q);
    const cached = await getCache<Awaited<ReturnType<typeof searchProducts>>>(key);
    if (cached) {
      return res.json({ products: cached, cached: true });
    }

    const products = await searchProducts(q);
    await setCache(key, products, TTL_PRODUCTS);
    res.json({ products, cached: false });
  } catch (e) {
    next(e);
  }
});

/**
 * POST /api/products/check-stores
 * NUEVO: Busca en base de datos local scrapeada (NO scraping en tiempo real)
 */
router.post('/check-stores', searchLimiter, async (req, res, next) => {
  try {
    const { productName, upc, brand, userLocation, size } = req.body as {
      productName?: string;
      upc?: string;
      brand?: string;
      userLocation?: string;
      size?: string;
    };

    if (!productName?.trim() && !upc?.trim()) {
      res.status(400).json({ error: 'productName o upc es requerido' });
      return;
    }

    const location = (userLocation ?? '').trim() || 'Puerto Rico';

    // Buscar en base de datos local
    let results;

    if (upc) {
      // Buscar por UPC (más preciso)
      results = await findProductByUPC(upc.trim(), location);
    } else if (productName) {
      // Buscar por nombre
      const searchResults = await searchProductsInDatabase({
        query: productName.trim(),
        locations: [location],
        maxResults: 50,
        inStockOnly: true,
      });

      // Convertir a formato StoreCheckResult
      results = searchResults.products.map((product) => ({
        storeName: product.storeName,
        location: product.location,
        price: product.price,
        available: product.available,
        inStock: product.inStock,
        url: product.storeUrl || '',
        productName: product.name,
        lastUpdated: product.lastScraped.toISOString(),
        status: product.inStock ? 'found' : 'error',
        message: product.inStock ? undefined : 'No disponible',
      }));
    } else {
      res.status(400).json({ error: 'productName o upc es requerido' });
      return;
    }

    // Calcular mejor precio
    const found = results.filter((r) => r.status === 'found' && r.available && r.price > 0);
    const bestPrice = found.length > 0 ? Math.min(...found.map((r) => r.price)) : null;

    res.json({
      productName: productName || results[0]?.productName,
      brand,
      upc,
      results,
      bestPrice,
      availableCount: found.length,
      source: 'database', // Indicar que viene de la base de datos
      cached: false, // No es cache, es base de datos
    });
  } catch (e) {
    next(e);
  }
});

/**
 * GET /api/products/stats
 * Estadísticas de la base de datos scrapeada
 */
router.get('/stats', async (_req, res, next) => {
  try {
    const stats = await getDatabaseStats();
    res.json(stats);
  } catch (e) {
    next(e);
  }
});

/**
 * GET /api/products/search-db
 * Búsqueda directa en base de datos local (sin pasar por UPCitemdb)
 */
router.get('/search-db', searchLimiter, async (req, res, next) => {
  try {
    const q = (req.query.q as string)?.trim() ?? '';
    const storeIds = req.query.stores ? String(req.query.stores).split(',') : undefined;
    const locations = req.query.locations ? String(req.query.locations).split(',') : undefined;
    const maxResults = req.query.limit ? Number(req.query.limit) : 50;

    if (!q) {
      res.status(400).json({ error: 'Query "q" es requerido' });
      return;
    }

    const results = await searchProductsInDatabase({
      query: q,
      storeIds,
      locations,
      maxResults,
      inStockOnly: true,
    });

    res.json({
      query: q,
      products: results.products,
      total: results.total,
      stores: results.stores,
      locations: results.locations,
      source: 'database',
    });
  } catch (e) {
    next(e);
  }
});

export default router;
