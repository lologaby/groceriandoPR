/**
 * Rutas de integración con Notion: agregar ítem, listar, marcar comprado.
 */

import { Router } from 'express';
import { NotionShoppingListService } from '../services/notionShoppingListService.js';
import type { NotionAddItemPayload, NotionCredentials } from '../types/index.js';

const router = Router();

function getCredentials(body: unknown, query: unknown): NotionCredentials | null {
  const fromBody = (body as Record<string, unknown>) ?? {};
  const fromQuery = (query as Record<string, unknown>) ?? {};
  const notionApiKey = (fromBody.notionApiKey ?? fromQuery.notionApiKey) as string | undefined;
  const databaseId = (fromBody.databaseId ?? fromQuery.databaseId) as string | undefined;
  if (notionApiKey && databaseId) {
    return { notionApiKey, databaseId };
  }
  return null;
}

router.post('/add-item', async (req, res, next) => {
  try {
    const creds = getCredentials(req.body, req.query);
    if (!creds) {
      res.status(400).json({
        error: 'notionApiKey y databaseId son requeridos (body o query)',
      });
      return;
    }

    const productData = req.body?.productData as NotionAddItemPayload | undefined;
    if (!productData || !productData.productName) {
      res.status(400).json({
        error: 'productData con productName es requerido',
      });
      return;
    }

    const notion = new NotionShoppingListService(creds.notionApiKey, creds.databaseId);
    const result = await notion.addProduct(productData);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

router.get('/list', async (req, res, next) => {
  try {
    const creds = getCredentials(req.body, req.query);
    if (!creds) {
      res.status(400).json({
        error: 'notionApiKey y databaseId son requeridos (query)',
      });
      return;
    }

    const notion = new NotionShoppingListService(creds.notionApiKey, creds.databaseId);
    const list = await notion.getShoppingList();
    res.json(list);
  } catch (e) {
    next(e);
  }
});

router.patch('/mark-purchased/:pageId', async (req, res, next) => {
  try {
    const pageId = req.params.pageId;
    const creds = getCredentials(req.body, req.query);
    if (!creds?.notionApiKey) {
      res.status(400).json({
        error: 'notionApiKey es requerido (body o query)',
      });
      return;
    }

    const notion = new NotionShoppingListService(creds.notionApiKey, req.body?.databaseId ?? '');
    await notion.markAsPurchased(pageId);
    res.json({ success: true });
  } catch (e) {
    next(e);
  }
});

export default router;
