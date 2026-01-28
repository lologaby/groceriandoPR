import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, PackageSearch } from 'lucide-react';
import { useProductSearch } from '../hooks/useProductSearch';
import { ProductCard } from './ProductCard';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Spinner } from './ui/Spinner';
import { EmptyState } from './ui/EmptyState';
import { ProductCardSkeleton } from './ui/Skeleton';

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

export function ProductSearch() {
  const navigate = useNavigate();
  const { query, setQuery, searchQuery, products, isLoading, isFetching, runSearch, minLength } =
    useProductSearch();

  const handleProductClick = (product: import('../types').ProductSearchResult) => {
    navigate('/product/check', { state: { product } });
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-bold mb-4 gradient-text"
        >
          Encuentra tus productos
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-lg md:text-xl text-neutral-600 dark:text-neutral-400"
        >
          Compara precios en todos los supermercados de Puerto Rico
        </motion.p>
      </div>

      {/* Search Input */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-12"
      >
        <Card glass className="p-2">
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && runSearch()}
              placeholder="Busca jamón, leche, arroz, o cualquier producto..."
              leftIcon={<Search className="w-5 h-5" />}
              className="border-0 focus:ring-0 text-base sm:text-lg bg-transparent"
              aria-label="Buscar productos"
            />
            <Button
              onClick={runSearch}
              disabled={query.length < minLength}
              size="lg"
              className="whitespace-nowrap"
            >
              Buscar
            </Button>
          </div>
        </Card>

        {query.length > 0 && query.length < minLength && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-neutral-500 dark:text-neutral-400 mt-2 text-center"
          >
            Escribe al menos {minLength} caracteres para buscar
          </motion.p>
        )}
      </motion.div>

      {/* Loading State */}
      {searchQuery.length >= minLength && (isLoading || isFetching) && (
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-3 py-8">
            <Spinner size="lg" />
            <div>
              <p className="text-lg font-medium text-neutral-900 dark:text-neutral-100">
                Buscando productos...
              </p>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Esto tomará solo un momento
              </p>
            </div>
          </div>
          {[1, 2, 3].map((i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Results */}
      {searchQuery.length >= minLength && products && !isLoading && (
        <>
          {products.length > 0 ? (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="space-y-4"
            >
              <motion.div
                variants={itemVariants}
                className="p-4 rounded-lg bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800"
              >
                <p className="font-medium text-primary-900 dark:text-primary-100">
                  ✨ Encontramos {products.length} producto{products.length !== 1 ? 's' : ''}
                </p>
                <p className="text-sm text-primary-700 dark:text-primary-300 mt-1">
                  Selecciona uno para ver precios en supermercados de PR
                </p>
              </motion.div>

              {products.map((product) => (
                <motion.div key={product.upc} variants={itemVariants}>
                  <ProductCard product={product} onSelect={handleProductClick} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <EmptyState
              icon={PackageSearch}
              title="No encontramos productos"
              description="Intenta con otro término de búsqueda o verifica la ortografía"
              action={{
                label: 'Limpiar búsqueda',
                onClick: () => setQuery(''),
              }}
            />
          )}
        </>
      )}
    </div>
  );
}
