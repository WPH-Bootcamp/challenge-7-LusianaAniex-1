/**
 * React Query hooks for Menu data
 * Handles server state for menu items with caching and error handling
 */

import { useQuery, UseQueryResult } from '@tanstack/react-query';
import axiosInstance from '@/shared/api/axios';
import { MENU_API_ENDPOINTS, MENU_QUERY_KEYS } from '../constants';
import type { MenuItem } from '../types';
import type { ApiResponse } from '@/shared/types/api';

/**
 * Fetch all menu items from API
 */
async function fetchMenuItems(): Promise<MenuItem[]> {
  const response = await axiosInstance.get<ApiResponse<MenuItem[]>>(MENU_API_ENDPOINTS.MENU);
  return response.data.data;
}

/**
 * Fetch single menu item by ID
 */
async function fetchMenuItem(id: string): Promise<MenuItem> {
  const response = await axiosInstance.get<ApiResponse<MenuItem>>(`${MENU_API_ENDPOINTS.MENU}/${id}`);
  return response.data.data;
}

/**
 * Hook to fetch all menu items
 * Implements caching and automatic refetching
 */
export function useMenuQuery(): UseQueryResult<MenuItem[], Error> {
  return useQuery({
    queryKey: MENU_QUERY_KEYS.MENU,
    queryFn: fetchMenuItems,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook to fetch single menu item
 * @param id - Menu item ID
 */
export function useMenuItemQuery(id: string): UseQueryResult<MenuItem, Error> {
  return useQuery({
    queryKey: MENU_QUERY_KEYS.MENU_ITEM(id),
    queryFn: () => fetchMenuItem(id),
    enabled: !!id, // Only run query if ID is provided
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}
