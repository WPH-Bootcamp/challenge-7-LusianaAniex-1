/**
 * Filters Feature - Type Definitions
 * Contains all types related to filtering and sorting
 */

export type SortOption = 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc' | 'rating-desc' | 'name' | 'price' | 'rating';

export interface FilterState {
  searchQuery: string;
  selectedCategory: string;
  sortBy: SortOption;
  sortOrder?: 'asc' | 'desc';
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
}
