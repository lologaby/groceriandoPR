import { motion } from 'framer-motion';
import { ArrowRight, Store } from 'lucide-react';
import type { ProductSearchResult } from '../types';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';

const PLACEHOLDER_IMG = '/placeholder-product.svg';

interface ProductCardProps {
  product: ProductSearchResult;
  onSelect: (product: ProductSearchResult) => void;
}

export function ProductCard({ product, onSelect }: ProductCardProps) {
  return (
    <Card
      hover
      role="button"
      tabIndex={0}
      onClick={() => onSelect(product)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(product);
        }
      }}
      className="p-6 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
      aria-label={`${product.name}${product.brand ? `, ${product.brand}` : ''}. Ver dónde comprar`}
    >
      <div className="flex gap-6">
        {/* Product Image */}
        <div className="relative">
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl bg-neutral-100 dark:bg-neutral-800 p-2 flex items-center justify-center overflow-hidden"
          >
            <img
              src={product.images?.[0] || PLACEHOLDER_IMG}
              alt={product.name}
              className="w-full h-full object-contain"
              onError={(e) => {
                const el = e.target as HTMLImageElement;
                if (!el.dataset.fallback) {
                  el.dataset.fallback = '1';
                  el.src = PLACEHOLDER_IMG;
                }
              }}
            />
          </motion.div>
        </div>

        {/* Product Info */}
        <div className="flex-1 min-w-0 flex flex-col">
          <div className="flex-1">
            <h3 className="font-semibold text-lg md:text-xl text-neutral-900 dark:text-neutral-100 mb-1 line-clamp-2">
              {product.name}
            </h3>

            {product.brand && (
              <Badge variant="default" className="mb-2">
                {product.brand}
              </Badge>
            )}

            <p className="text-sm text-neutral-500 dark:text-neutral-400">UPC: {product.upc}</p>
          </div>

          {/* Action Button */}
          <div className="mt-4">
            <Button
              variant="primary"
              size="md"
              icon={<Store className="w-4 h-4" />}
              onClick={(e) => {
                e.stopPropagation();
                onSelect(product);
              }}
              className="w-full sm:w-auto"
            >
              Ver dónde comprar
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
