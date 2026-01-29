/**
 * Redux Store Configuration
 * Combines all reducers and configures the Redux store
 */

import { configureStore } from '@reduxjs/toolkit';
import { cartReducer } from '@/features/cart';
import { filtersReducer } from '@/features/filters';
import { ordersReducer } from '@/features/orders';

/**
 * Configure Redux store with all slices
 */
export const store = configureStore({
  reducer: {
    cart: cartReducer,
    filters: filtersReducer,
    orders: ordersReducer,
  },
  devTools: process.env.NODE_ENV !== 'production', // Enable Redux DevTools in development
});

// Export types for TypeScript
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
