'use client';

import React, { useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Minus, Plus, ChevronRight, ChevronDown } from 'lucide-react';
import {
  removeFromCart,
  updateQuantity,
} from '@/features/cart/store/cartSlice';
import { restaurantsApi } from '@/shared/api/restaurants';
import Footer from '@/shared/components/Footer';
import ImageWithFallback from '@/shared/components/ImageWithFallback';
import type { RootState } from '@/app/store';
import type { CartItem, Restaurant } from '@/shared/types';
import Image from 'next/image';
import restaurantIcon from '@/assets/images/restaurant-icon.png';

// Configuration
const RESTAURANT_ICON = restaurantIcon;
const FOOD_PLACEHOLDER = '/images/food-placeholder.jpg';

// Utility functions
const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(price);
};

// Sub-components
interface LoadingStateProps {
  title?: string;
  message?: string;
}

const LoadingState = ({
  title = 'My Cart',
  message = 'Loading cart...',
}: LoadingStateProps) => (
  <div className='min-h-screen bg-gray-50 pt-20'>
    <div className='max-w-4xl mx-auto px-8 py-16'>
      <div className='text-center'>
        <h1 className='text-4xl font-extrabold text-gray-900 mb-8'>{title}</h1>
        <div className='bg-white rounded-2xl shadow-lg p-16'>
          <div className='flex justify-center items-center'>
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-red-600'></div>
            <span className='ml-4 text-lg text-gray-600'>{message}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

interface ErrorStateProps {
  onRetry?: () => void;
}

const ErrorState = ({ onRetry }: ErrorStateProps) => (
  <div className='min-h-screen bg-gray-50 pt-20'>
    <div className='max-w-4xl mx-auto px-8 py-16'>
      <div className='text-center'>
        <h1 className='text-4xl font-extrabold text-gray-900 mb-8'>My Cart</h1>
        <div className='bg-white rounded-2xl shadow-lg p-16'>
          <div className='text-red-600 text-lg mb-4'>
            Failed to load restaurant information
          </div>
          <button
            onClick={onRetry || (() => window.location.reload())}
            className='bg-red-600 text-white px-8 py-3 rounded-full font-bold hover:bg-red-700 transition-colors'
          >
            Retry
          </button>
        </div>
      </div>
    </div>
  </div>
);

interface EmptyCartStateProps {
  onStartShopping: () => void;
}

const EmptyCartState = ({ onStartShopping }: EmptyCartStateProps) => (
  <div className='min-h-screen bg-gray-50 pt-20'>
    <div className='max-w-4xl mx-auto px-8 py-16'>
      <div className='text-center'>
        <h1 className='text-4xl font-extrabold text-gray-900 mb-8'>My Cart</h1>
        <div className='bg-white rounded-2xl shadow-lg p-16'>
          <div className='text-gray-500 text-lg mb-4'>Your cart is empty</div>
          <div className='flex justify-center'>
            <button
              onClick={onStartShopping}
              className='bg-red-600 text-white px-8 py-3 rounded-full font-bold hover:bg-red-700 transition-colors'
            >
              Start Shopping
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
);

interface QuantityControlsProps {
  quantity: number;
  onDecrease: () => void;
  onIncrease: () => void;
  isMobile?: boolean;
}

const QuantityControls = ({
  quantity,
  onDecrease,
  onIncrease,
  isMobile = false,
}: QuantityControlsProps) => {
  const sizeClass = isMobile ? 'w-7 h-7 p-1.5' : 'w-10 h-10';
  const iconSizeClass = isMobile ? 'w-4 h-4' : 'w-6 h-6';

  return (
    <div className={`flex flex-row items-center gap-${isMobile ? '3' : '4'}`}>
      <button
        onClick={onDecrease}
        className={`flex flex-row justify-center items-center border border-[#D5D7DA] rounded-full hover:bg-gray-50 transition-colors ${sizeClass}`}
      >
        <Minus className={`${iconSizeClass} text-gray-900`} />
      </button>

      <span
        className={`font-nunito font-semibold ${
          isMobile ? 'text-sm min-w-[16px]' : 'text-lg min-w-[20px]'
        } leading-[30px] tracking-[-0.02em] text-gray-900 text-center`}
      >
        {quantity}
      </span>

      <button
        onClick={onIncrease}
        className={`flex flex-row items-center bg-[#C12116] rounded-full hover:bg-[#B01E14] transition-colors ${sizeClass}`}
      >
        <Plus className={`${iconSizeClass} text-white`} />
      </button>
    </div>
  );
};

interface CartItemCardProps {
  item: CartItem;
  onQuantityChange: (itemId: string, newQuantity: number) => void;
  isMobile?: boolean;
}

const CartItemCard = ({
  item,
  onQuantityChange,
  isMobile = false,
}: CartItemCardProps) => {
  const handleDecrease = () => onQuantityChange(item.id, item.quantity - 1);
  const handleIncrease = () => onQuantityChange(item.id, item.quantity + 1);

  return (
    <div
      className={`flex flex-row justify-between items-center w-full ${
        isMobile ? 'h-[74px]' : ''
      }`}
    >
      {/* Item Info */}
      <div
        className={
          isMobile
            ? 'flex flex-row items-center gap-4 flex-1'
            : 'flex flex-row items-center gap-6 flex-1'
        }
      >
        {/* Item Image */}
        <ImageWithFallback
          src={item.imageUrl || FOOD_PLACEHOLDER}
          alt={item.name}
          fill
          sizes='(max-width: 768px) 64px, 80px'
          containerClassName={
            isMobile
              ? 'w-16 h-16 rounded-xl shrink-0'
              : 'w-20 h-20 rounded-xl shrink-0'
          }
          className='object-cover rounded-xl'
          fallbackText='No Image'
          unoptimized
        />

        {/* Item Details */}
        <div className='flex flex-col items-start flex-1 min-w-0'>
          <div className='font-nunito font-medium text-sm leading-7 text-gray-900 w-full truncate'>
            {item.name}
          </div>
          <div className='font-nunito font-extrabold text-base leading-[30px] text-gray-900'>
            {formatPrice(item.price)}
          </div>
        </div>
      </div>

      {/* Quantity Controls */}
      <div className='flex flex-row justify-end items-center shrink-0'>
        <QuantityControls
          quantity={item.quantity}
          onDecrease={handleDecrease}
          onIncrease={handleIncrease}
          isMobile={isMobile}
        />
      </div>
    </div>
  );
};

interface RestaurantGroupProps {
  group: {
    restaurantId: string;
    restaurantName: string;
    restaurantLogo?: string;
    items: CartItem[];
    total: number;
  };
  onNavigateToRestaurant: (restaurantId: string) => void;
  onQuantityChange: (itemId: string, newQuantity: number) => void;
  onCheckout?: () => void;
  isMobile?: boolean;
}

interface RestaurantHeaderProps {
  group: {
    restaurantId: string;
    restaurantName: string;
    restaurantLogo?: string;
  };
  onNavigateToRestaurant: (restaurantId: string) => void;
  isMobile?: boolean;
}

const RestaurantHeader = ({
  group,
  onNavigateToRestaurant,
  isMobile = false,
}: RestaurantHeaderProps) => (
  <div
    className={`flex flex-row items-center gap-2 w-full ${
      isMobile
        ? 'h-8 cursor-pointer'
        : 'mb-5 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors'
    }`}
    onClick={() => onNavigateToRestaurant(group.restaurantId)}
  >
    <div className='w-8 h-8 shrink-0 relative'>
      <Image
        src={RESTAURANT_ICON}
        alt={group.restaurantName}
        fill
        sizes='32px'
        className='object-cover rounded'
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          const parent = target.parentElement;
          if (parent) {
            parent.innerHTML = `
                <div class="w-8 h-8 bg-orange-500 rounded flex items-center justify-center">
                  <span class="text-white text-xs font-bold">R</span>
                </div>
              `;
          }
        }}
      />
    </div>

    <div className='flex flex-row items-center gap-1 flex-1'>
      <span className='font-nunito font-bold text-base leading-[30px] tracking-[-0.02em] text-gray-900'>
        {group.restaurantName}
      </span>
      {isMobile ? (
        <ChevronDown className='w-5 h-5 text-gray-900 transform -rotate-90' />
      ) : (
        <ChevronRight className='w-6 h-6 text-gray-400' />
      )}
    </div>
  </div>
);

const RestaurantGroup = ({
  group,
  onNavigateToRestaurant,
  onQuantityChange,
  onCheckout,
  isMobile = false,
}: RestaurantGroupProps) => {
  if (isMobile) {
    return (
      <div className='flex flex-col items-start p-4 gap-3 w-full bg-white rounded-2xl shadow-[0px_0px_20px_rgba(203,202,202,0.25)]'>
        <RestaurantHeader
          group={group}
          onNavigateToRestaurant={onNavigateToRestaurant}
          isMobile={isMobile}
        />

        <div className='flex flex-col items-start px-0 gap-3 w-full'>
          {group.items.map((item) => (
            <CartItemCard
              key={item.id}
              item={item}
              onQuantityChange={onQuantityChange}
              isMobile={true}
            />
          ))}

          <div className='w-full h-0 border-t border-dashed border-[#D5D7DA]'></div>

          <div className='flex flex-col items-start gap-3 w-full'>
            <div className='flex flex-col items-start w-full'>
              <div className='font-nunito font-medium text-sm leading-7 text-gray-900 mb-1'>
                Total
              </div>
              <div className='font-nunito font-extrabold text-lg leading-8 tracking-[-0.02em] text-gray-900'>
                {formatPrice(group.total)}
              </div>
            </div>

            <button
              onClick={onCheckout}
              className='flex flex-row justify-center items-center p-2 gap-2 w-full h-11 bg-[#C12116] rounded-full hover:bg-[#B01E14] transition-colors'
            >
              <span className='font-nunito font-bold text-sm leading-7 tracking-[-0.02em] text-[#FDFDFD]'>
                Checkout
              </span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='bg-white rounded-2xl shadow-lg p-5'>
      <RestaurantHeader
        group={group}
        onNavigateToRestaurant={onNavigateToRestaurant}
        isMobile={isMobile}
      />

      <div className='space-y-5'>
        {group.items.map((item) => (
          <CartItemCard
            key={item.id}
            item={item}
            onQuantityChange={onQuantityChange}
            isMobile={false}
          />
        ))}
      </div>

      <div className='border-t border-dashed border-gray-300 my-5'></div>

      <div className='flex items-center justify-between'>
        <div>
          <p className='text-base font-medium text-gray-900 mb-1'>Total</p>
          <p className='text-xl font-extrabold text-gray-900'>
            {formatPrice(group.total)}
          </p>
        </div>
        <button
          onClick={onCheckout}
          className='bg-red-600 text-white px-6 py-3 rounded-full font-bold hover:bg-red-700 transition-colors'
        >
          Checkout
        </button>
      </div>
    </div>
  );
};

// Main Component
const MyCartPage: React.FC = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const [isMounted, setIsMounted] = React.useState(false);

  // Prevent hydration mismatch by only rendering cart-dependent UI after mount
  React.useLayoutEffect(() => {
    setIsMounted(true);
  }, []);

  // Get unique restaurant IDs from cart items
  const restaurantIds = useMemo(
    () => [...new Set(cartItems.map((item) => item.restaurantId))],
    [cartItems]
  );

  // Fetch restaurant data
  const {
    data: restaurants = [],
    isLoading: restaurantsLoading,
    error: restaurantsError,
  } = useQuery({
    queryKey: ['restaurants', restaurantIds],
    queryFn: async () => {
      const restaurantPromises = restaurantIds.map((id) =>
        restaurantsApi.getRestaurantById(id).catch(() => null)
      );
      const results = await Promise.all(restaurantPromises);
      return results.filter(Boolean) as Restaurant[];
    },
    enabled: restaurantIds.length > 0,
    staleTime: 5 * 60 * 1000,
  });

  // Create restaurant map
  const restaurantMap = useMemo(
    () =>
      restaurants.reduce(
        (acc, restaurant) => {
          acc[restaurant.id.toString()] = restaurant;
          return acc;
        },
        {} as Record<string, Restaurant>
      ),
    [restaurants]
  );

  // Group cart items by restaurant
  const groupedItems = useMemo(
    () =>
      cartItems.reduce(
        (acc, item) => {
          const restaurantId = item.restaurantId;
          const restaurant = restaurantMap[restaurantId];

          if (!acc[restaurantId]) {
            acc[restaurantId] = {
              restaurantId,
              restaurantName:
                restaurant?.name || item.restaurantName || 'Restaurant Name',
              restaurantLogo: restaurant?.logo,
              items: [],
              total: 0,
            };
          }
          acc[restaurantId].items.push(item);
          acc[restaurantId].total += item.price * item.quantity;
          return acc;
        },
        {} as Record<
          string,
          {
            restaurantId: string;
            restaurantName: string;
            restaurantLogo?: string;
            items: CartItem[];
            total: number;
          }
        >
      ),
    [cartItems, restaurantMap]
  );

  // Event handlers
  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      dispatch(removeFromCart(itemId));
    } else {
      dispatch(updateQuantity({ id: itemId, quantity: newQuantity }));
    }
  };

  const handleNavigateToRestaurant = (restaurantId: string) => {
    router.push(`/restaurants/${restaurantId}`);
  };

  const handleCheckout = () => {
    router.push('/checkout');
  };

  const handleStartShopping = () => {
    router.push('/');
  };

  // Show loading during SSR and initial mount
  if (!isMounted) {
    return <LoadingState />;
  }

  // Loading state
  if (restaurantsLoading && cartItems.length > 0) {
    return <LoadingState />;
  }

  // Error state
  if (restaurantsError && cartItems.length > 0) {
    return <ErrorState onRetry={() => window.location.reload()} />;
  }

  // Empty cart state
  if (cartItems.length === 0) {
    return <EmptyCartState onStartShopping={handleStartShopping} />;
  }

  return (
    <div className='min-h-screen bg-gray-50 pt-20'>
      <div className='max-w-4xl mx-auto px-4 md:px-8 py-4 md:py-16'>
        {/* Mobile Layout */}
        <div className='md:hidden flex flex-col items-start px-0 gap-4 w-full max-w-[361px] mx-auto'>
          <h1 className='font-nunito font-extrabold text-2xl leading-9 text-gray-900 w-full'>
            My Cart
          </h1>

          <div className='flex flex-col items-start px-0 gap-5 w-full'>
            {Object.values(groupedItems).map((group) => (
              <RestaurantGroup
                key={group.restaurantId}
                group={group}
                onNavigateToRestaurant={handleNavigateToRestaurant}
                onQuantityChange={handleQuantityChange}
                onCheckout={handleCheckout}
                isMobile={true}
              />
            ))}
          </div>
        </div>

        {/* Desktop Layout */}
        <div className='hidden md:block'>
          <h1 className='text-4xl font-extrabold text-gray-900 mb-8'>
            My Cart
          </h1>

          <div className='space-y-6'>
            {Object.values(groupedItems).map((group) => (
              <RestaurantGroup
                key={group.restaurantId}
                group={group}
                onNavigateToRestaurant={handleNavigateToRestaurant}
                onQuantityChange={handleQuantityChange}
                onCheckout={handleCheckout}
                isMobile={false}
              />
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default MyCartPage;
