import { motion } from 'framer-motion';
import { Sparkles, Lightbulb, TrendingDown, DollarSign } from 'lucide-react';
import type { Recommendation, Alternative } from '../types';
import { Card } from './ui/Card';
import { formatCurrency } from '../utils/formatCurrency';

interface AlternativeSuggestionsProps {
  recommendations: Recommendation[];
  alternatives: Alternative[];
}

export function AlternativeSuggestions({
  recommendations,
  alternatives,
}: AlternativeSuggestionsProps) {
  if (recommendations.length === 0 && alternatives.length === 0) return null;

  return (
    <Card glass className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-lg text-neutral-900 dark:text-neutral-100">
            Recomendaciones Smart
          </h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">Te ayudamos a ahorrar</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div className="space-y-3">
            {recommendations.map((rec, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 rounded-lg bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800"
              >
                <div className="flex items-start gap-3">
                  <Lightbulb className="w-5 h-5 text-primary-600 dark:text-primary-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-primary-900 dark:text-primary-100">
                      {rec.message}
                    </p>
                    {rec.savings && (
                      <p className="text-xs text-primary-700 dark:text-primary-300 mt-1">
                        Ahorras {formatCurrency(rec.savings)}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Alternatives */}
        {alternatives.length > 0 && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: recommendations.length * 0.1 + 0.1 }}
            className="p-4 rounded-lg bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-800"
          >
            <div className="flex items-start gap-3 mb-3">
              <TrendingDown className="w-5 h-5 text-success-600 dark:text-success-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-success-900 dark:text-success-100">
                  Alternativas más baratas
                </p>
                <p className="text-xs text-success-700 dark:text-success-300 mt-0.5">
                  Productos similares a mejor precio
                </p>
              </div>
            </div>
            <div className="mt-3 space-y-2">
              {alternatives.map((alt, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: (recommendations.length + index) * 0.1 + 0.2 }}
                  className="flex items-center justify-between text-sm p-2 rounded-md bg-white/50 dark:bg-neutral-900/50"
                >
                  <div>
                    <p className="font-medium text-success-900 dark:text-success-100">{alt.name}</p>
                    <p className="text-xs text-success-700 dark:text-success-300">{alt.store}</p>
                  </div>
                  <div className="flex items-center gap-1 font-bold text-success-700 dark:text-success-300">
                    <DollarSign className="w-3 h-3" />
                    {alt.price.toFixed(2)}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </Card>
  );
}
