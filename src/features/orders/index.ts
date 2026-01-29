/**
 * Orders Feature - Barrel Export
 * Central export point for all order-related functionality
 */

// Types
export type { OrderItem, Order, CreateOrderPayload } from './types';

// Hooks
export { useOrdersQuery, useOrderQuery, useCreateOrderMutation } from './hooks/useOrdersQuery';

// Redux
export { default as ordersReducer, addOrder, updateOrderStatus, setCurrentOrder, setLoading, setError, clearCurrentOrder } from './ordersSlice';

// Constants
export { ORDERS_API_ENDPOINTS, ORDERS_QUERY_KEYS } from './constants';

