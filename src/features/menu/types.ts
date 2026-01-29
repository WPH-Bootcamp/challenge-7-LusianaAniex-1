/**
 * Menu Feature - Type Definitions
 * Contains all types related to menu items and categories
 */

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  rating: number;
  image: string;
  available: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  icon?: string;
}
