/**
 * Custom Redux hooks with proper TypeScript typing
 * Use these throughout the app instead of plain useDispatch and useSelector
 */

import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import type { RootState, AppDispatch } from './store';

/**
 * Typed version of useDispatch hook
 * Provides autocomplete for dispatch actions
 */
export const useAppDispatch = (): AppDispatch => useDispatch<AppDispatch>();

/**
 * Typed version of useSelector hook
 * Provides autocomplete for state properties
 */
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
