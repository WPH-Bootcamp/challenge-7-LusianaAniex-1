/**
 * Filters Feature - Barrel Export
 * Central export point for all filter-related functionality
 */

// Types
export type { SortOption, FilterState } from './types';

// Constants
export { SORT_OPTIONS, PRICE_RANGES, RATING_OPTIONS } from './constants';

// Redux
export {
  default as filtersReducer,
  setSearchQuery,
  setSelectedCategory,
  setSortBy,
  setSortOrder,
  setPriceRange,
  setLocation,
  setDistance,
  toggleDistance,
  setPriceMin,
  setPriceMax,
  setRating,
  toggleRating,
  clearFilters,
} from './store/filtersSlice';
