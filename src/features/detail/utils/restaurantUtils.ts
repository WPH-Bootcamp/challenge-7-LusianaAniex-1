/**
 * Restaurant Data Utils
 * Helper functions for restaurant data processing
 */

import type { Restaurant } from '../../../shared/types';

/**
 * Get available images from restaurant data
 * Returns array of images with fallback
 */
export function getRestaurantImages(restaurant: Restaurant | undefined): string[] {
  if (!restaurant) {
    return ['/src/assets/images/restaurant-placeholder.jpg'];
  }

  const images: string[] = [];
  
  // Add all available images
  if (restaurant.images?.[0]) images.push(restaurant.images[0]);
  if (restaurant.images?.[1]) images.push(restaurant.images[1]);
  if (restaurant.images?.[2]) images.push(restaurant.images[2]);
  if (restaurant.images?.[3]) images.push(restaurant.images[3]);
  if (restaurant.logo) images.push(restaurant.logo);

  // If no images, add placeholder
  if (images.length === 0) {
    images.push('/src/assets/images/restaurant-placeholder.jpg');
  }

  return images;
}

/**
 * Map API menu data to MenuItem format and apply category filter
 */
export function mapAndFilterMenus(
  menus: Record<string, unknown>[],
  restaurantId: string,
  filterType: string
) {
  const mapped = menus.map((menu) => ({
    id: String(menu.id),
    name: String(menu.foodName || menu.name),
    price: Number(menu.price),
    category: String(
      menu.type === 'side' || menu.type === 'dessert' ? 'food' : menu.type
    ),
    restaurantId,
    image: String(menu.image || ''),
  }));

  // Apply filter
  if (filterType === 'all') return mapped;
  return mapped.filter((menu) => menu.category === filterType);
}
