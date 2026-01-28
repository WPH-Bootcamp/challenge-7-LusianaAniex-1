import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { categoriesApi } from '@/shared/api/categories';
import type { Category } from '@/shared/types';

export function useCategoriesQuery(): UseQueryResult<Category[], Error> {
  return useQuery({
    queryKey: ['categories'],
    queryFn: categoriesApi.getCategories,
    staleTime: 10 * 60 * 1000, // 10 minutes - categories don't change often
    retry: false, // Don't retry on failure to prevent loops
  });
}
