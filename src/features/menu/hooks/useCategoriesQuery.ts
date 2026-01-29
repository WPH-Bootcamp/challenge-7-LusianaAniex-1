/**
 * React Query hooks for Categories data
 * Handles server state for categories with caching
 */

import { useQuery, UseQueryResult } from '@tanstack/react-query';
import axiosInstance from '@/shared/api/axios';
import { MENU_API_ENDPOINTS, MENU_QUERY_KEYS } from '../constants';
import type { Category } from '../types';
import type { ApiResponse } from '@/shared/types/api';

/**
 * Fetch all categories from API
 */
async function fetchCategories(): Promise<Category[]> {
  const response = await axiosInstance.get<ApiResponse<Category[]>>(MENU_API_ENDPOINTS.CATEGORIES);
  return response.data.data;
}

/**
 * Hook to fetch all categories
 * Implements caching with longer stale time since categories rarely change
 */
export function useCategoriesQuery(): UseQueryResult<Category[], Error> {
  return useQuery({
    queryKey: MENU_QUERY_KEYS.CATEGORIES,
    queryFn: fetchCategories,
    staleTime: 15 * 60 * 1000, // Consider data fresh for 15 minutes
    gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
    refetchOnWindowFocus: false,
  });
}
