/**
 * Filters Feature - Constants
 * Filter options and configurations
 */

export const SORT_OPTIONS = [
  { value: 'name-asc', label: 'Name (A-Z)' },
  { value: 'name-desc', label: 'Name (Z-A)' },
  { value: 'price-asc', label: 'Price (Low to High)' },
  { value: 'price-desc', label: 'Price (High to Low)' },
  { value: 'rating-desc', label: 'Rating (High to Low)' },
] as const;

export const PRICE_RANGES = [
  { min: 0, max: 50000, label: 'Under Rp 50,000' },
  { min: 50000, max: 100000, label: 'Rp 50,000 - Rp 100,000' },
  { min: 100000, max: 200000, label: 'Rp 100,000 - Rp 200,000' },
  { min: 200000, max: null, label: 'Above Rp 200,000' },
] as const;

export const RATING_OPTIONS = [
  { value: 4.5, label: '4.5+ stars' },
  { value: 4.0, label: '4.0+ stars' },
  { value: 3.5, label: '3.5+ stars' },
  { value: 3.0, label: '3.0+ stars' },
] as const;
