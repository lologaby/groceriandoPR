import { motion } from 'framer-motion';
import { Loader2, Lock, Info } from 'lucide-react';
import { STORES_TIER_1, STORES_MEMBERSHIP } from '../constants/stores';
import { Card } from './ui/Card';

export function StoreLoadingIndicator() {
  return (
    <Card
      glass
      className="p-6"
      role="status"
      aria-live="polite"
      aria-label="Buscando en supermercados de Puerto Rico"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          >
            <Loader2 className="w-8 h-8 text-primary-600 dark:text-primary-400" />
          </motion.div>
        </div>
        <div>
          <h3 className="font-semibold text-lg text-neutral-900 dark:text-neutral-100">
            Buscando en supermercados
          </h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Esto tomará solo unos segundos
          </p>
        </div>
      </div>

      {/* Progress bars */}
      <div className="space-y-3">
        {STORES_TIER_1.map((store, index) => (
          <motion.div
            key={store}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center gap-3"
          >
            <div className="w-5 h-5 rounded-full border-2 border-primary-500 border-t-transparent animate-spin" />
            <span className="text-sm text-neutral-700 dark:text-neutral-300">{store}</span>
          </motion.div>
        ))}
      </div>

      {/* Info Cards */}
      <div className="mt-6 space-y-3">
        {/* Membership stores */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex items-start gap-2 p-3 rounded-lg bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-800"
        >
          <Lock className="w-4 h-4 text-warning-600 dark:text-warning-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-warning-900 dark:text-warning-100">
              Requieren membresía
            </p>
            <p className="text-xs text-warning-700 dark:text-warning-300 mt-0.5">
              {STORES_MEMBERSHIP.join(', ')}
            </p>
          </div>
        </motion.div>

        {/* No e-commerce */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="flex items-start gap-2 p-3 rounded-lg bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700"
        >
          <Info className="w-4 h-4 text-neutral-600 dark:text-neutral-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
              Sin tienda online
            </p>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-0.5">
              Pueblo, Amigo, Agranel, Ralph's - Verifica en tienda
            </p>
          </div>
        </motion.div>
      </div>
    </Card>
  );
}
