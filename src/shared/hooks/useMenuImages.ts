import { useState, useLayoutEffect } from 'react';
import { restaurantsApi } from '@/shared/api/restaurants';

interface MenuImage {
  [menuId: string]: string;
}

interface OrderData {
  data?: {
    orders?: Array<{
      restaurants?: Array<{
        restaurantId: number;
        items?: Array<{
          menuId: number;
        }>;
      }>;
    }>;
  };
}

export const useMenuImages = (ordersData: OrderData | undefined) => {
  const [menuImages, setMenuImages] = useState<MenuImage>({});
  const [isLoading, setIsLoading] = useState(false);

  // Function to fetch menu images for a restaurant
  const fetchMenuImages = async (restaurantId: string, menuIds: string[]) => {
    try {
      const menuData = await restaurantsApi.getRestaurantMenus(restaurantId);
      const newMenuImages: MenuImage = {};

      menuData.forEach((menu: { id: string; image?: string }) => {
        if (menuIds.includes(menu.id.toString()) && menu.image) {
          newMenuImages[menu.id.toString()] = menu.image;
        }
      });

      setMenuImages((prev) => ({ ...prev, ...newMenuImages }));
    } catch (error) {
      console.error('Error fetching menu images:', error);
    }
  };

  // Fetch menu images when orders data changes
  useLayoutEffect(() => {
    if (ordersData?.data?.orders) {
      setIsLoading(true);
      const restaurantMenuMap = new Map<string, string[]>();

      ordersData.data.orders.forEach((order) => {
        if (!order || !order.restaurants) return;

        order.restaurants.forEach((restaurant) => {
          // Explicit null checks and type safety
          if (!restaurant) return;

          const restaurantIdProp = restaurant.restaurantId;
          // Handle valid 0 ID but reject null/undefined
          if (restaurantIdProp === null || restaurantIdProp === undefined)
            return;

          const restaurantId = String(restaurantIdProp);

          const menuIds =
            restaurant.items
              ?.filter(
                (item) =>
                  item && item.menuId !== null && item.menuId !== undefined
              )
              ?.map((item) => String(item.menuId)) || [];

          if (restaurantId && menuIds.length > 0) {
            if (!restaurantMenuMap.has(restaurantId)) {
              restaurantMenuMap.set(restaurantId, []);
            }
            restaurantMenuMap.get(restaurantId)?.push(...menuIds);
          }
        });
      });

      // Fetch images for each restaurant
      const fetchPromises = Array.from(restaurantMenuMap.entries()).map(
        ([restaurantId, menuIds]) => {
          const uniqueMenuIds = [...new Set(menuIds)];
          return fetchMenuImages(restaurantId, uniqueMenuIds);
        }
      );

      Promise.all(fetchPromises).finally(() => {
        setIsLoading(false);
      });
    }
  }, [ordersData]);

  return {
    menuImages,
    isLoading,
    fetchMenuImages,
  };
};
