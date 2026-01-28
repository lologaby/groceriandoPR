/**
 * Servicio de integración con Notion para la lista de compras.
 * Crea/actualiza páginas en la base "🛒 Lista de Compras" con precios y tiendas.
 */

import { Client } from '@notionhq/client';
import type { NotionAddItemPayload, PriceByStore } from '../types/index.js';

const PROP_NAMES = {
  product: 'Producto',
  brand: 'Marca',
  upc: 'UPC',
  category: 'Categoría',
  quantity: 'Cantidad',
  bestPrice: 'Mejor Precio',
  whereToBuy: 'Dónde Comprar',
  location: 'Ubicación',
  walmart: 'Precio Walmart',
  econo: 'Precio Econo',
  supermax: 'Precio SuperMax',
  freshmart: 'Precio Freshmart',
  amigo: 'Precio Amigo',
  pueblo: 'Precio Pueblo',
  selectos: 'Precio Selectos',
  agranel: 'Precio Agranel',
  ralphs: "Precio Ralph's",
  availableAt: 'Disponible en',
  link: 'Link Producto',
  updated: 'Última Actualización',
  purchased: '✅ Comprado',
  notes: 'Notas',
} as const;

export class NotionShoppingListService {
  private notion: Client;
  private databaseId: string;

  constructor(apiKey: string, databaseId: string) {
    if (!apiKey?.trim()) {
      throw new Error('Notion API Key es requerido.');
    }
    this.notion = new Client({ auth: apiKey });
    this.databaseId = databaseId;
  }

  private ensureDatabase(): void {
    if (!this.databaseId?.trim()) {
      throw new Error('Database ID es requerido para esta operación.');
    }
  }

  /**
   * Agrega un producto a la base de datos de Notion.
   */
  async addProduct(data: NotionAddItemPayload) {
    this.ensureDatabase();
    const priceByStore = data.priceByStore ?? {};

    const category = data.category || 'General';
    const properties: Record<string, unknown> = {
      [PROP_NAMES.product]: {
        title: [{ text: { content: data.productName } }],
      },
      [PROP_NAMES.brand]: {
        rich_text: [{ text: { content: data.brand ?? '' } }],
      },
      [PROP_NAMES.upc]: {
        rich_text: [{ text: { content: data.upc ?? '' } }],
      },
      [PROP_NAMES.category]: {
        select: { name: category },
      },
      [PROP_NAMES.quantity]: {
        number: data.quantity,
      },
      [PROP_NAMES.bestPrice]: {
        number: data.bestPrice,
      },
      [PROP_NAMES.whereToBuy]: {
        select: { name: data.whereToBuy },
      },
      [PROP_NAMES.location]: {
        select: { name: data.location },
      },
      [PROP_NAMES.walmart]: {
        number: priceByStore.walmart ?? null,
      },
      [PROP_NAMES.econo]: {
        number: priceByStore.econo ?? null,
      },
      [PROP_NAMES.supermax]: {
        number: priceByStore.supermax ?? null,
      },
      [PROP_NAMES.freshmart]: {
        number: priceByStore.freshmart ?? null,
      },
      [PROP_NAMES.amigo]: {
        number: priceByStore.amigo ?? null,
      },
      [PROP_NAMES.pueblo]: {
        number: priceByStore.pueblo ?? null,
      },
      [PROP_NAMES.selectos]: {
        number: priceByStore.selectos ?? null,
      },
      [PROP_NAMES.agranel]: {
        number: priceByStore.agranel ?? null,
      },
      [PROP_NAMES.ralphs]: {
        number: priceByStore.ralphs ?? null,
      },
      [PROP_NAMES.availableAt]: {
        multi_select: (data.availableAt ?? []).map((name) => ({ name })),
      },
      [PROP_NAMES.link]: {
        url: data.productUrl || null,
      },
      [PROP_NAMES.updated]: {
        date: { start: new Date().toISOString().slice(0, 10) },
      },
      [PROP_NAMES.purchased]: {
        checkbox: false,
      },
      [PROP_NAMES.notes]: {
        rich_text: [{ text: { content: data.notes ?? '' } }],
      },
    };

    const response = await this.notion.pages.create({
      parent: { database_id: this.databaseId },
      properties: properties as Parameters<Client['pages']['create']>[0]['properties'],
    });

    return response;
  }

  /**
   * Actualiza precios de un ítem existente (por page ID).
   */
  async updateProductPrices(
    pageId: string,
    updates: {
      bestPrice?: number;
      priceByStore?: PriceByStore;
      whereToBuy?: string;
      productUrl?: string;
      availableAt?: string[];
    }
  ) {
    const props: Record<string, unknown> = {};
    const p = updates.priceByStore;

    if (updates.bestPrice != null) {
      props[PROP_NAMES.bestPrice] = { number: updates.bestPrice };
    }
    if (p) {
      if (p.walmart != null) props[PROP_NAMES.walmart] = { number: p.walmart };
      if (p.econo != null) props[PROP_NAMES.econo] = { number: p.econo };
      if (p.supermax != null) props[PROP_NAMES.supermax] = { number: p.supermax };
      if (p.freshmart != null) props[PROP_NAMES.freshmart] = { number: p.freshmart };
      if (p.amigo != null) props[PROP_NAMES.amigo] = { number: p.amigo };
      if (p.pueblo != null) props[PROP_NAMES.pueblo] = { number: p.pueblo };
      if (p.selectos != null) props[PROP_NAMES.selectos] = { number: p.selectos };
      if (p.agranel != null) props[PROP_NAMES.agranel] = { number: p.agranel };
      if (p.ralphs != null) props[PROP_NAMES.ralphs] = { number: p.ralphs };
    }
    if (updates.whereToBuy != null) {
      props[PROP_NAMES.whereToBuy] = { select: { name: updates.whereToBuy } };
    }
    if (updates.productUrl != null) {
      props[PROP_NAMES.link] = { url: updates.productUrl };
    }
    if (updates.availableAt != null) {
      props[PROP_NAMES.availableAt] = {
        multi_select: updates.availableAt.map((name) => ({ name })),
      };
    }
    props[PROP_NAMES.updated] = { date: { start: new Date().toISOString().slice(0, 10) } };

    if (Object.keys(props).length === 0) {
      return null;
    }

    return this.notion.pages.update({
      page_id: pageId,
      properties: props as Parameters<Client['pages']['update']>[0]['properties'],
    });
  }

  /**
   * Obtiene los ítems no comprados de la lista.
   */
  async getShoppingList() {
    this.ensureDatabase();
    const response = await this.notion.databases.query({
      database_id: this.databaseId,
      filter: {
        property: PROP_NAMES.purchased,
        checkbox: { equals: false },
      },
      sorts: [{ timestamp: 'last_edited_time', direction: 'descending' }],
    });
    return response.results;
  }

  /**
   * Marca un ítem como comprado.
   */
  async markAsPurchased(pageId: string) {
    return this.notion.pages.update({
      page_id: pageId,
      properties: {
        [PROP_NAMES.purchased]: { checkbox: true },
      } as Parameters<Client['pages']['update']>[0]['properties'],
    });
  }
}
