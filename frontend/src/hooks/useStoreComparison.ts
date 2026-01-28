import { useQuery } from '@tanstack/react-query';
import { checkStores } from '../api/client';
import type { ProductSearchResult } from '../types';
import { STALE_TIME_CHECK_STORES_MS } from '../constants/api';

export function useStoreComparison(product: ProductSearchResult | null, location: string) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['check-stores', product?.upc, location],
    queryFn: () =>
      checkStores({
        productName: product!.name,
        upc: product!.upc,
        brand: product!.brand,
        userLocation: location,
        size: product!.size,
      }),
    enabled: !!product?.upc,
    staleTime: STALE_TIME_CHECK_STORES_MS,
  });

  return {
    data,
    isLoading,
    error,
    refetch,
  };
}
