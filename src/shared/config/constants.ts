/**
 * Shared Configuration - Application Constants
 * Global constants used across the application
 */

// ==================== API Configuration ====================

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

// ==================== Routes ====================

export const ROUTES = {
  HOME: '/',
  CART: '/cart',
  CHECKOUT: '/checkout',
  ORDERS: '/orders',
  ORDER_DETAIL: (id: string) => `/orders/${id}`,
} as const;

// ==================== UI Constants ====================

export const ITEMS_PER_PAGE = 12;
export const DEBOUNCE_DELAY = 300; // ms for search input
export const TOAST_DURATION = 3000; // ms

// ==================== Validation ====================

export const VALIDATION = {
  MIN_NAME_LENGTH: 3,
  MAX_NAME_LENGTH: 50,
  PHONE_PATTERN: /^(\+62|62|0)[0-9]{9,12}$/,
  MIN_ADDRESS_LENGTH: 10,
  MAX_ADDRESS_LENGTH: 200,
} as const;
