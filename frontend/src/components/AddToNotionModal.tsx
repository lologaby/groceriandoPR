/**
 * Modal para agregar ítem a Notion (cantidad, notas, confirmar).
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useMutation } from '@tanstack/react-query';
import {
  X,
  Package,
  Store,
  DollarSign,
  Hash,
  StickyNote,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { addToNotion } from '../api/client';
import { NOTION_CONFIG_KEY, type NotionConfig, type PriceByStore } from '../types';
import type { ProductSearchResult } from '../types';
import type { StoreCheckResult, CheckStoresResponse } from '../types';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Badge } from './ui/Badge';
import { formatCurrency } from '../utils/formatCurrency';

const STORE_TO_KEY: Record<string, keyof PriceByStore> = {
  SuperMax: 'supermax',
  Econo: 'econo',
  Walmart: 'walmart',
  Pueblo: 'pueblo',
  Amigo: 'amigo',
  Selectos: 'selectos',
  Agranel: 'agranel',
  "Ralph's": 'ralphs',
};

function buildPriceByStore(results: StoreCheckResult[]): PriceByStore {
  const out: PriceByStore = {};
  for (const r of results) {
    const k = STORE_TO_KEY[r.storeName];
    if (!k) continue;
    out[k] = r.status === 'found' && r.price > 0 ? r.price : null;
  }
  return out;
}

interface AddToNotionModalProps {
  product: ProductSearchResult;
  store: StoreCheckResult;
  location: string;
  storeResults: CheckStoresResponse;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddToNotionModal({
  product,
  store,
  location,
  storeResults,
  onClose,
  onSuccess,
}: AddToNotionModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');

  function loadConfig(): NotionConfig | null {
    try {
      const raw = localStorage.getItem(NOTION_CONFIG_KEY);
      if (!raw) return null;
      const v = JSON.parse(raw) as NotionConfig;
      return v?.notionApiKey && v?.databaseId ? v : null;
    } catch {
      return null;
    }
  }
  const config = loadConfig();

  const addMutation = useMutation({
    mutationFn: async () => {
      if (!config) throw new Error('Configura Notion en la pestaña Notion.');
      const priceByStore = buildPriceByStore(storeResults.results);
      const availableAt = storeResults.results
        .filter((r) => r.status === 'found' && r.available && r.price > 0)
        .map((r) => r.storeName);
      return addToNotion(config.notionApiKey, config.databaseId, {
        productName: product.name,
        brand: product.brand,
        upc: product.upc,
        category: product.category || 'General',
        quantity,
        bestPrice: store.price,
        whereToBuy: store.storeName,
        location,
        priceByStore,
        availableAt,
        productUrl: store.url,
        notes: notes.trim() || undefined,
      });
    },
    onSuccess: () => {
      toast.success('Producto agregado a Notion', {
        description: `${product.name} - ${store.storeName}`,
        icon: <CheckCircle className="w-5 h-5" />,
      });
      onSuccess();
    },
    onError: (e: Error) => {
      toast.error('Error al agregar a Notion', {
        description: e.message || 'Por favor intenta nuevamente',
      });
    },
  });

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-notion-title"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md"
        >
          <Card className="p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2
                  id="add-notion-title"
                  className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-1"
                >
                  Agregar a Notion
                </h2>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Guarda este producto en tu lista
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={onClose} className="rounded-full">
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Product Summary */}
            <div className="mb-6 space-y-3">
              <div className="flex items-start gap-3 p-4 rounded-lg bg-neutral-100 dark:bg-neutral-800">
                <Package className="w-5 h-5 text-neutral-600 dark:text-neutral-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-neutral-900 dark:text-neutral-100">
                    {product.name}
                  </p>
                  {product.brand && (
                    <Badge variant="default" className="mt-1">
                      {product.brand}
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 rounded-lg bg-neutral-100 dark:bg-neutral-800">
                <Store className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
                <div>
                  <p className="font-medium text-neutral-900 dark:text-neutral-100">
                    {store.storeName}
                  </p>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">{location}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 rounded-lg bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-800">
                <DollarSign className="w-5 h-5 text-success-600 dark:text-success-400" />
                <p className="text-lg font-bold text-success-700 dark:text-success-300">
                  {formatCurrency(store.price)}
                </p>
              </div>
            </div>

            {/* Form */}
            <div className="space-y-4 mb-6">
              <Input
                type="number"
                label="Cantidad"
                min={1}
                max={99}
                value={quantity}
                onChange={(e) =>
                  setQuantity(Math.max(1, parseInt(String(e.target.value), 10) || 1))
                }
                leftIcon={<Hash className="w-5 h-5" />}
              />

              <Input
                type="text"
                label="Notas (opcional)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ej: variante sin azúcar, orgánico..."
                leftIcon={<StickyNote className="w-5 h-5" />}
              />
            </div>

            {/* Warning if not configured */}
            {!config && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 rounded-lg bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-800"
              >
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-warning-600 dark:text-warning-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-warning-900 dark:text-warning-100 mb-1">
                      Configuración requerida
                    </p>
                    <p className="text-xs text-warning-700 dark:text-warning-300">
                      Configura tu API Key y Database ID en la pestaña Notion
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <Button variant="ghost" onClick={onClose} className="flex-1">
                Cancelar
              </Button>
              <Button
                variant="primary"
                onClick={() => addMutation.mutate()}
                disabled={addMutation.isPending || !config}
                loading={addMutation.isPending}
                className="flex-1"
              >
                {addMutation.isPending ? 'Agregando...' : 'Agregar a Notion'}
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
