/**
 * Recomendaciones inteligentes: mejor precio, mejor precio unitario, cercanía.
 */

import type { StoreCheckResult, BestDeal, Recommendation, Alternative } from '../types/index.js';
import { calculateUnitPrice } from '../utils/calculateUnitPrice.js';

export interface RecommendationInput {
  productName: string;
  brand?: string;
  size?: string;
  storeResults: StoreCheckResult[];
  userLocation: string;
}

export interface RecommendationOutput {
  bestDeal: BestDeal | null;
  recommendations: Recommendation[];
  alternatives: Alternative[];
}

export function getRecommendations(input: RecommendationInput): RecommendationOutput {
  const { productName, size, storeResults, userLocation } = input;
  const found = storeResults.filter((r) => r.status === 'found' && r.available && r.price > 0);
  const recommendations: Recommendation[] = [];
  let bestDeal: BestDeal | null = null;

  if (found.length === 0) {
    return { bestDeal: null, recommendations: [], alternatives: [] };
  }

  const bestSingle = found.reduce((a, b) => (a.price <= b.price ? a : b));
  bestDeal = {
    store: bestSingle.storeName,
    location: bestSingle.location,
    price: bestSingle.price,
  };

  recommendations.push({
    type: 'best_single_price',
    message: `Para 1 unidad: ${bestSingle.storeName} ($${bestSingle.price.toFixed(2)})`,
    store: bestSingle.storeName,
  });

  const sizeSrc = size ?? productName;
  const unitInfo = calculateUnitPrice(bestSingle.price, sizeSrc);
  if (unitInfo) {
    bestDeal.unitPrice = unitInfo.pricePerUnit;
    bestDeal.unit = unitInfo.unit;
    const byUnit = found
      .map((r) => {
        const u = calculateUnitPrice(r.price, sizeSrc);
        return u ? { ...r, ...u } : null;
      })
      .filter((x): x is NonNullable<typeof x> => x != null)
      .sort((a, b) => a.pricePerUnit - b.pricePerUnit);
    if (byUnit.length > 0) {
      const bestUnit = byUnit[0];
      recommendations.push({
        type: 'best_unit_price',
        message: `Mejor precio por ${bestUnit.unit}: ${bestUnit.storeName} ($${bestUnit.pricePerUnit.toFixed(2)}/${bestUnit.unit})`,
        store: bestUnit.storeName,
      });
    }
  }

  const nearby = found.filter(
    (r) =>
      r.location.toLowerCase().includes(userLocation.toLowerCase()) ||
      userLocation.toLowerCase().includes(r.location.toLowerCase())
  );
  if (nearby.length > 0) {
    recommendations.push({
      type: 'nearby',
      message: `${nearby.length} opción(es) cerca de ${userLocation}`,
    });
  }

  return {
    bestDeal,
    recommendations,
    alternatives: [], // Placeholder: requiere DB de productos similares
  };
}
