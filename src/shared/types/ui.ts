import { CartItem } from './api';

/**
 * Global UI Visibility State
 * Used for toggling drawers, modals, and menus
 */
export interface UIState {
  isCartOpen: boolean;
  isFilterOpen: boolean;
  isMobileMenuOpen: boolean;
}

/**
 * Search and Filtering State
 */
export type FilterState = {
  searchQuery: string;
  selectedCategory: string;
  sortBy: 'name' | 'price' | 'rating';
  sortOrder: 'asc' | 'desc';
  priceRange: {
    min: number;
    max: number;
  };
  location?: string;
  // CategoryPage specific filters
  distance: string[];
  priceMin: string;
  priceMax: string;
  rating: string[];
};

/**
 * Cart and Checkout State
 */
export type CartState = {
  items: CartItem[];
  total: number;
};