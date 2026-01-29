/**
 * Menu Feature - Constants
 * API endpoints and query keys for menu and categories
 */

// API Endpoints
export const MENU_API_ENDPOINTS = {
  MENU: '/api/menu',
  CATEGORIES: '/api/categories',
} as const;

// Query Keys
export const MENU_QUERY_KEYS = {
  MENU: ['menu'] as const,
  MENU_ITEM: (id: string) => ['menu', id] as const,
  CATEGORIES: ['categories'] as const,
} as const;
