import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { ArrowLeft, MapPin, CheckCircle, Store, Info, Lock } from 'lucide-react';
import { useStoreComparison } from '../hooks/useStoreComparison';
import { LOCATIONS } from '../constants/stores';
import { formatCurrency } from '../utils/formatCurrency';
import { StoreCard } from './StoreCard';
import { StoreLoadingIndicator } from './StoreLoadingIndicator';
import { AlternativeSuggestions } from './AlternativeSuggestions';
import { AddToNotionModal } from './AddToNotionModal';
import type { ProductSearchResult, StoreCheckResult } from '../types';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export function StoreComparison() {
  const { state } = useLocation() as { state?: { product: ProductSearchResult } };
  const navigate = useNavigate();
  const product = state?.product;

  useEffect(() => {
    if (!product) navigate('/', { replace: true });
  }, [product, navigate]);

  const [location, setLocation] = useState<string>(LOCATIONS[0]);
  const [modal, setModal] = useState<{ store: StoreCheckResult } | null>(null);

  const { data, isLoading, error, refetch } = useStoreComparison(product ?? null, location);

  useEffect(() => {
    if (error) {
      toast.error('Error al buscar en tiendas', {
        description: (error as Error)?.message ?? 'Por favor intenta nuevamente',
      });
    }
  }, [error]);

  if (!product) return null;

  const available =
    data?.results?.filter((r) => r.status === 'found' && r.available && r.price > 0) ?? [];
  const bestPrice = data?.bestPrice ?? null;
  const noEcommerce = data?.results?.filter((r) => r.status === 'no_ecommerce') ?? [];
  const recommendations = data?.recommendations ?? [];
  const alternatives = data?.alternatives ?? [];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back Button */}
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
        <Button
          variant="ghost"
          icon={<ArrowLeft className="w-4 h-4" />}
          onClick={() => navigate('/')}
          className="mb-6"
        >
          Volver a búsqueda
        </Button>
      </motion.div>

      {/* Product Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="p-6 mb-6">
          <div className="flex items-start gap-4">
            {product.images?.[0] && (
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-20 h-20 object-contain rounded-lg bg-neutral-100 dark:bg-neutral-800 p-2"
              />
            )}
            <div className="flex-1">
              <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
                {product.name}
              </h2>
              {product.brand && <Badge variant="primary">{product.brand}</Badge>}
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2">
                UPC: {product.upc}
              </p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Location Selector */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-6"
      >
        <Card glass className="p-4">
          <label className="flex items-center gap-3">
            <MapPin className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Ubicación:
            </span>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="flex-1 px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              aria-label="Seleccionar ubicación"
            >
              {LOCATIONS.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </label>
        </Card>
      </motion.div>

      {/* Loading State */}
      {isLoading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <StoreLoadingIndicator />
        </motion.div>
      )}

      {/* Error State */}
      {!isLoading && error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-6"
        >
          <Card className="p-6 border-warning-200 dark:border-warning-800 bg-warning-50 dark:bg-warning-900/20">
            <div className="flex items-start gap-3 mb-4">
              <Info className="w-5 h-5 text-warning-600 dark:text-warning-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-warning-900 dark:text-warning-100 mb-2">
                  No pudimos buscar en algunos supermercados
                </p>
                <p className="text-sm text-warning-700 dark:text-warning-300">
                  {(error as Error)?.message}
                </p>
              </div>
            </div>
            <Button variant="primary" onClick={() => refetch()}>
              Reintentar
            </Button>
          </Card>
        </motion.div>
      )}

      {/* Results */}
      {!isLoading && data && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-6"
        >
          {/* Summary Card */}
          {available.length > 0 && (
            <motion.div variants={itemVariants}>
              <Card className="p-6 bg-success-50 dark:bg-success-900/20 border-success-200 dark:border-success-800">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-success-600 dark:text-success-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-success-900 dark:text-success-100 text-lg">
                      Disponible en {available.length}{' '}
                      {available.length === 1 ? 'supermercado' : 'supermercados'}
                    </p>
                    {bestPrice != null && (
                      <p className="text-sm text-success-700 dark:text-success-300 mt-1">
                        Mejor precio: {formatCurrency(bestPrice)}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Recommendations */}
          {(recommendations.length > 0 || alternatives.length > 0) && (
            <motion.div variants={itemVariants}>
              <AlternativeSuggestions
                recommendations={recommendations}
                alternatives={alternatives}
              />
            </motion.div>
          )}

          {/* Available Stores */}
          {available.map((store) => (
            <motion.div key={store.storeName} variants={itemVariants}>
              <StoreCard
                store={store}
                bestPrice={bestPrice}
                onAddToList={(s) => setModal({ store: s })}
              />
            </motion.div>
          ))}

          {/* No E-commerce Stores */}
          {noEcommerce.map((store) => (
            <motion.div key={store.storeName} variants={itemVariants}>
              <Card className="p-4 bg-neutral-50 dark:bg-neutral-900">
                <div className="flex items-start gap-3">
                  <Store className="w-5 h-5 text-neutral-600 dark:text-neutral-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
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
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      {store.message}
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Add to Notion Modal */}
      {modal && data && (
        <AddToNotionModal
          product={product}
          store={modal.store}
          location={location}
          storeResults={data}
          onClose={() => setModal(null)}
          onSuccess={() => {
            const storeName = modal.store.storeName;
            const price = modal.store.price;
            setModal(null);
            toast.success('Producto agregado a Notion', {
              description: `${storeName} - ${formatCurrency(price)}`,
            });
          }}
        />
      )}
    </div>
  );
}
