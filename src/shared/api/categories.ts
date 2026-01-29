import type { Category } from '@/shared/types';
import allRestaurantLogo from '@/assets/images/allrestaurant-logo.png';
import locationLogo from '@/assets/images/location-logo.png';
import discountLogo from '@/assets/images/discount-logo.png';
import bestsellerLogo from '@/assets/images/bestseller-logo.png';
import deliveryLogo from '@/assets/images/delivery-logo.png';
import lunchLogo from '@/assets/images/lunch-logo.png';

export const categoriesApi = {
  getCategories: async (): Promise<Category[]> => {
    // Use predefined categories since the API doesn't have a categories endpoint
    // This avoids the 404 error in console while maintaining the same functionality
    return [
      {
        id: 'all',
        name: 'All Restaurant',
        icon: allRestaurantLogo.src,
        filter: null,
      },
      {
        id: 'nearby',
        name: 'Nearby',
        icon: locationLogo.src,
        filter: 'nearby',
      },
      {
        id: 'discount',
        name: 'Discount',
        icon: discountLogo.src,
        filter: 'discount',
      },
      {
        id: 'bestseller',
        name: 'Best Seller',
        icon: bestsellerLogo.src,
        filter: 'bestseller',
      },
      {
        id: 'delivery',
        name: 'Delivery',
        icon: deliveryLogo.src,
        filter: 'delivery',
      },
      {
        id: 'lunch',
        name: 'Lunch',
        icon: lunchLogo.src,
        filter: 'lunch',
      },
    ];

    // Note: If the API adds a categories endpoint in the future, uncomment this:
    // try {
    //   const response = await apiClient.get<ApiResponse<Category[]>>('/api/categories');
    //   return response.data.data;
    // } catch {
    //   // Return predefined categories as fallback
    //   return [...]; // categories array above
    // }
  },
};
