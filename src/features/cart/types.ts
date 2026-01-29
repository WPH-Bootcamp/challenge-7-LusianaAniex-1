/**
 * Cart Feature - Type Definitions
 * Contains all types related to shopping cart
 */

import type { MenuItem } from '@/features/menu';

export interface CartItem {
  id: string;
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  restaurantId: string;
  restaurantName: string;
}

export interface Cart {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
}
export type CartState = {
  items: CartItem[];
  total: number;
};
