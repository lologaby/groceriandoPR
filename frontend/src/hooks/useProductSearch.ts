import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { productSearch } from '../api/client';
import { MIN_SEARCH_QUERY_LENGTH, STALE_TIME_PRODUCTS_MS } from '../constants/api';

export function useProductSearch() {
  const [query, setQuery] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const {
    data: products,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ['products', searchQuery],
    queryFn: () => productSearch(searchQuery),
    enabled: searchQuery.length >= MIN_SEARCH_QUERY_LENGTH,
    staleTime: STALE_TIME_PRODUCTS_MS,
  });

  const runSearch = () => {
    const q = query.trim();
    if (q.length >= MIN_SEARCH_QUERY_LENGTH) setSearchQuery(q);
  };

  return {
    query,
    setQuery,
    searchQuery,
    products: products ?? [],
    isLoading,
    isFetching,
    runSearch,
    minLength: MIN_SEARCH_QUERY_LENGTH,
  };
}
