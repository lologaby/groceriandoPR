import { Store, MapPin, Plus, ExternalLink, Trophy, Lock, TrendingDown } from 'lucide-react';
import { formatCurrency } from '../utils/formatCurrency';
import type { StoreCheckResult } from '../types';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';

interface StoreCardProps {
  store: StoreCheckResult;
  bestPrice: number | null;
  onAddToList: (store: StoreCheckResult) => void;
}

export function StoreCard({ store, bestPrice, onAddToList }: StoreCardProps) {
  const isBest = bestPrice != null && store.price > 0 && store.price === bestPrice;
  const priceDifference =
    bestPrice != null && store.price !== bestPrice ? store.price - bestPrice : 0;

  return (
    <Card hover className={`p-6 ${isBest ? 'ring-2 ring-success-500 dark:ring-success-400' : ''}`}>
      {/* Best Price Badge */}
      {isBest && (
        <Badge variant="success" className="mb-4">
          <Trophy className="w-4 h-4" />
          Mejor Precio
        </Badge>
      )}

      <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-6">
        {/* Store Info */}
        <div className="flex items-start gap-3 flex-1">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-800 dark:to-neutral-700 flex items-center justify-center flex-shrink-0">
            <Store className="w-6 h-6 text-neutral-600 dark:text-neutral-400" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h3 className="font-semibold text-lg text-neutral-900 dark:text-neutral-100">
                {store.storeName}
              </h3>
              {store.requiresMembership && (
                <Badge variant="warning">
                  <Lock className="w-3 h-3" />
                  Membresía
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
              <MapPin className="w-4 h-4 flex-shrink-0" />
              <span>{store.location}</span>
            </div>
          </div>
        </div>

        {/* Price Info */}
        {store.status === 'found' && store.price > 0 && (
          <div className="text-right">
            <div className="text-3xl font-bold text-primary-600 dark:text-primary-400">
              {formatCurrency(store.price)}
            </div>
            {!isBest && priceDifference > 0 && (
              <div className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                +{formatCurrency(priceDifference)}
              </div>
            )}
            {isBest && (
              <div className="flex items-center gap-1 text-sm text-success-600 dark:text-success-400 mt-1">
                <TrendingDown className="w-4 h-4" />
                Ahorro máximo
              </div>
            )}
          </div>
        )}
      </div>

      {/* Stock Status */}
      {store.status === 'found' && (
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 rounded-full bg-success-500 animate-pulse" />
          <span className="text-sm text-success-600 dark:text-success-400 font-medium">
            En stock
          </span>
        </div>
      )}

      {/* Actions */}
      {store.status === 'found' && (
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="primary"
            className="flex-1"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => onAddToList(store)}
          >
            Agregar a lista
          </Button>
          {store.url && (
            <Button
              variant="ghost"
              icon={<ExternalLink className="w-4 h-4" />}
              onClick={() => window.open(store.url, '_blank')}
            >
              Ver en tienda
            </Button>
          )}
        </div>
      )}
    </Card>
  );
}
