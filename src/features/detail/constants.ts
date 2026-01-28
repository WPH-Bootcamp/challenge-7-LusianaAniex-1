/**
 * Display limits and pagination constants
 * Centralized configuration for list display limits
 */

export const DISPLAY_LIMITS = {
  MENUS_INITIAL: 8,
  REVIEWS_INITIAL: 6,
} as const;

export const GALLERY_CONFIG = {
  IMAGE_AUTO_ADVANCE_MS: 5000,
  DRAG_THRESHOLD_PX: 50,
} as const;

export const MENU_FILTERS = {
  ALL: 'all',
  FOOD: 'food',
  DRINK: 'drink',
} as const;

export type MenuFilterType = typeof MENU_FILTERS[keyof typeof MENU_FILTERS];
