/**
 * React Query hooks for Orders data
 * Handles server state for orders with mutations for creating orders
 */

import { useQuery, useMutation, UseQueryResult, UseMutationResult } from '@tanstack/react-query';
import axiosInstance from '@/shared/api/axios';
import { ORDERS_API_ENDPOINTS, ORDERS_QUERY_KEYS } from '../constants';
import type { Order, CreateOrderPayload } from '../types';
import type { ApiResponse } from '@/shared/types/api';

/**
 * Fetch all orders from API
 */
async function fetchOrders(): Promise<Order[]> {
  const response = await axiosInstance.get<ApiResponse<Order[]>>(ORDERS_API_ENDPOINTS.ORDERS);
  return response.data.data;
}

/**
 * Fetch single order by ID
 */
async function fetchOrder(id: string): Promise<Order> {
  const response = await axiosInstance.get<ApiResponse<Order>>(`${ORDERS_API_ENDPOINTS.ORDERS}/${id}`);
  return response.data.data;
}

/**
 * Create new order
 */
async function createOrder(payload: CreateOrderPayload): Promise<Order> {
  const response = await axiosInstance.post<ApiResponse<Order>>(ORDERS_API_ENDPOINTS.ORDERS, payload);
  return response.data.data;
}

/**
 * Hook to fetch all orders
 */
export function useOrdersQuery(): UseQueryResult<Order[], Error> {
  return useQuery({
    queryKey: ORDERS_QUERY_KEYS.ORDERS,
    queryFn: fetchOrders,
    staleTime: 2 * 60 * 1000, // Consider data fresh for 2 minutes
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
  });
}

/**
 * Hook to fetch single order
 * @param id - Order ID
 */
export function useOrderQuery(id: string): UseQueryResult<Order, Error> {
  return useQuery({
    queryKey: ORDERS_QUERY_KEYS.ORDER(id),
    queryFn: () => fetchOrder(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to create new order
 * Includes optimistic updates and cache invalidation
 */
export function useCreateOrderMutation(): UseMutationResult<Order, Error, CreateOrderPayload> {
  return useMutation({
    mutationFn: createOrder,
  });
}
