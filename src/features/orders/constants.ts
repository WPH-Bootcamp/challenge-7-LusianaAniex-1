/**
 * Orders Feature - Constants
 * API endpoints and query keys for orders
 */

// API Endpoints
export const ORDERS_API_ENDPOINTS = {
  ORDERS: '/api/orders',
} as const;

// Query Keys
export const ORDERS_QUERY_KEYS = {
  ORDERS: ['orders'] as const,
  ORDER: (id: string) => ['orders', id] as const,
} as const;
