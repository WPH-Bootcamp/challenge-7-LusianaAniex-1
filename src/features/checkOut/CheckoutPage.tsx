'use client';

import React, { useState, useMemo, useLayoutEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { Minus, Plus } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  clearCart,
  updateQuantity,
  removeFromCart,
} from '@/features/cart/store/cartSlice';
import { addOrder } from '@/features/orders/ordersSlice';
import { authApi } from '@/shared/api/auth';
import { ordersApi } from '@/shared/api/orders';
import { cartApi } from '@/shared/api/cart';
import Footer from '@/shared/components/Footer';
import type { RootState } from '@/app/store';
import type { CartItem } from '@/shared/types';
import Image from 'next/image';
import restaurantIcon from '@/assets/images/restaurant-icon.png';
import bniLogo from '@/assets/images/bni.svg';
import briLogo from '@/assets/images/bri.svg';
import bcaLogo from '@/assets/images/bca.svg';
import mandiriLogo from '@/assets/images/mandiri.svg';
import locationLogo from '@/assets/images/location-logo.png';

// Configuration
interface PaymentResponse {
  order_id: string;
  transaction_id?: string;
  transaction_status?: string;
}

interface MidtransSnapResponse {
  snapToken: string;
}

interface ApiError {
  response?: {
    data?: {
      message?: string;
      errors?: any;
    };
    status?: number;
  };
  message?: string;
  isAxiosError?: boolean;
  status?: number;
}

const PAYMENT_METHODS = [
  { id: 'bni', name: 'Bank Negara Indonesia', logo: bniLogo },
  { id: 'bri', name: 'Bank Rakyat Indonesia', logo: briLogo },
  { id: 'bca', name: 'Bank Central Asia', logo: bcaLogo },
  { id: 'mandiri', name: 'Mandiri', logo: mandiriLogo },
] as const;

const DELIVERY_FEE = 10000;
const SERVICE_FEE = 1000;

// Utility functions
const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(price);
};



// Sub-components
interface AddressCardProps {
  address?: string;
  phone?: string;
  isLoading: boolean;
  onEdit: () => void;
}

const AddressCard = ({
  address,
  phone,
  isLoading,
  onEdit,
}: AddressCardProps) => (
  <div className='bg-white rounded-2xl shadow-[0px_0px_20px_rgba(203,202,202,0.25)] p-4 w-full'>
    <div className='flex flex-col gap-3 w-full'>
      <div className='flex flex-col items-start gap-1 w-full'>
        <div className='flex flex-row items-center gap-2'>
          <div className='w-6 h-6 shrink-0 relative'>
            <Image
              src={locationLogo}
              alt='Location'
              fill
              sizes='24px'
              className='object-contain'
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent) {
                  parent.innerHTML = `
                    <div class="w-6 h-6 bg-red-600 rounded flex items-center justify-center">
                      <span class="text-white text-xs font-bold">L</span>
                    </div>
                  `;
                }
              }}
            />
          </div>
          <h3 className='font-nunito font-extrabold text-base leading-[30px] text-gray-900'>
            Delivery Address
          </h3>
        </div>

        <div className='w-full'>
          {isLoading ? (
            <div className='animate-pulse space-y-2'>
              <div className='h-4 bg-gray-200 rounded w-3/4'></div>
              <div className='h-4 bg-gray-200 rounded w-1/2'></div>
            </div>
          ) : address ? (
            <div className='space-y-1'>
              <p className='font-nunito font-medium text-sm leading-7 text-gray-900'>
                {address}
              </p>
              <p className='font-nunito font-medium text-sm leading-7 text-gray-900'>
                {phone || 'No phone number provided'}
              </p>
            </div>
          ) : (
            <div className='space-y-2'>
              <p className='font-nunito font-medium text-sm text-gray-500'>
                No delivery address provided
              </p>
              <p className='font-nunito text-xs text-gray-400'>
                Please add your address in your profile to continue with
                checkout
              </p>
              <button
                onClick={onEdit}
                className='text-red-600 text-xs font-medium hover:text-red-700 underline'
              >
                Add Address in Profile
              </button>
            </div>
          )}
        </div>
      </div>

      <button
        className='flex flex-row justify-center items-center px-2 py-2 gap-2 w-[120px] h-9 border border-[#D5D7DA] rounded-full hover:bg-gray-50 transition-colors self-start'
        onClick={onEdit}
      >
        <span className='font-nunito font-bold text-sm leading-7 tracking-[-0.02em] text-gray-900'>
          Change
        </span>
      </button>
    </div>
  </div>
);

interface CartItemCardProps {
  item: CartItem;
  onQuantityChange: (itemId: string, change: number) => void;
  onNavigateToRestaurant: (restaurantId: string) => void;
}

const CartItemCard = ({
  item,
  onQuantityChange,
  onNavigateToRestaurant,
}: CartItemCardProps) => (
  <div className='flex flex-row items-center w-full h-[84px] gap-4'>
    <div className='w-16 h-16 rounded-xl shrink-0 relative'>
      {item.imageUrl ? (
        <Image
          src={item.imageUrl}
          alt={item.name}
          fill
          sizes='64px'
          className='object-cover rounded-xl'
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const parent = target.parentElement;
            if (parent) {
              parent.innerHTML = `
                <div class="w-full h-full bg-gray-200 rounded-xl flex items-center justify-center">
                  <span class="text-gray-400 text-xs">No Image</span>
                </div>
              `;
            }
          }}
        />
      ) : (
        <div className='w-full h-full bg-gray-200 rounded-xl flex items-center justify-center'>
          <span className='text-gray-400 text-xs'>No Image</span>
        </div>
      )}
    </div>

    <div className='flex flex-col items-start flex-1 min-w-0'>
      <div className='font-nunito font-medium text-sm leading-7 text-gray-900 w-full truncate'>
        {item.name}
      </div>
      <div className='font-nunito font-extrabold text-base leading-[30px] text-gray-900'>
        {formatPrice(item.price)}
      </div>
    </div>

    <div className='flex flex-row items-center gap-3 md:gap-4 shrink-0'>
      <button
        onClick={() => onQuantityChange(item.id, -1)}
        className='flex flex-row justify-center items-center p-2 md:p-[6.5px] gap-1.5 md:gap-[6.5px] w-8 h-8 md:w-9 md:h-9 border border-[#D5D7DA] rounded-full hover:bg-gray-50 transition-colors touch-manipulation'
        type='button'
      >
        <Minus className='w-4 h-4 md:w-[19.5px] md:h-[19.5px] text-gray-900' />
      </button>

      <span className='font-nunito font-semibold text-sm md:text-base leading-[30px] tracking-[-0.02em] text-gray-900 min-w-[16px] md:min-w-[20px] text-center'>
        {item.quantity}
      </span>

      <button
        onClick={() => onQuantityChange(item.id, 1)}
        className='flex flex-row items-center p-2 md:p-[6.5px] gap-1.5 md:gap-[6.5px] w-8 h-8 md:w-9 md:h-9 bg-[#C12116] rounded-full hover:bg-[#B01E14] transition-colors touch-manipulation'
        type='button'
      >
        <Plus className='w-4 h-4 md:w-[19.5px] md:h-[19.5px] text-white' />
      </button>
    </div>
  </div>
);

interface RestaurantGroupProps {
  group: {
    restaurantId: string;
    restaurantName: string;
    items: CartItem[];
    total: number;
  };
  onQuantityChange: (itemId: string, change: number) => void;
  onNavigateToRestaurant: (restaurantId: string) => void;
}

const RestaurantGroup = ({
  group,
  onQuantityChange,
  onNavigateToRestaurant,
}: RestaurantGroupProps) => (
  <div className='flex flex-col gap-3 w-full'>
    <div className='flex flex-row justify-between items-center w-full h-10'>
      <div className='flex flex-row items-center gap-2'>
        <div className='w-8 h-8 shrink-0 relative'>
          <Image
            src={restaurantIcon}
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
        <h3 className='font-nunito font-bold text-base leading-[30px] tracking-[-0.02em] text-gray-900'>
          {group.restaurantName}
        </h3>
      </div>

      <button
        className='flex flex-row justify-center items-center px-6 py-2 gap-2 h-9 border border-[#D5D7DA] rounded-full hover:bg-gray-50 transition-colors shrink-0'
        onClick={() => onNavigateToRestaurant(group.restaurantId)}
      >
        <span className='font-nunito font-bold text-sm leading-7 tracking-[-0.02em] text-gray-900'>
          Add item
        </span>
      </button>
    </div>

    <div className='flex flex-col gap-3 w-full'>
      {group.items.map((item) => (
        <CartItemCard
          key={item.id}
          item={item}
          onQuantityChange={onQuantityChange}
          onNavigateToRestaurant={onNavigateToRestaurant}
        />
      ))}
    </div>
  </div>
);

interface PaymentMethodCardProps {
  method: (typeof PAYMENT_METHODS)[number];
  isSelected: boolean;
  onSelect: (id: string) => void;
}

const PaymentMethodCard = ({
  method,
  isSelected,
  onSelect,
}: PaymentMethodCardProps) => (
  <div
    className='flex items-center gap-3 cursor-pointer w-full h-10 p-2 rounded-lg hover:bg-gray-50 transition-colors'
    onClick={() => onSelect(method.id)}
  >
    <div className='w-10 h-10 border border-[#D5D7DA] rounded-lg flex items-center justify-center p-2 shrink-0'>
      <Image
        src={method.logo}
        alt={method.name}
        width={40}
        height={40}
        className='object-contain'
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          const parent = target.parentElement;
          if (parent) {
            parent.innerHTML = `
              <span class="text-xs font-bold ${
                method.id === 'bni' ? 'text-red-600' : 'text-blue-600'
              }">${method.id.toUpperCase()}</span>
            `;
          }
        }}
      />
    </div>
    <span className='font-nunito font-normal text-sm leading-7 tracking-[-0.02em] text-gray-900 flex-1'>
      {method.name}
    </span>
    <div
      className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
        isSelected ? 'bg-[#C12116]' : 'border-2 border-[#A4A7AE]'
      }`}
    >
      {isSelected && <div className='w-2 h-2 bg-white rounded-full'></div>}
    </div>
  </div>
);

interface PaymentSummaryProps {
  subtotal: number;
  deliveryFee: number;
  serviceFee: number;
  total: number;
  itemCount: number;
  onCheckout: () => void;
}

const PaymentSummary = ({
  subtotal,
  deliveryFee,
  serviceFee,
  total,
  itemCount,
  onCheckout,
}: PaymentSummaryProps) => (
  <div className='flex flex-col items-start px-4 gap-3 w-full'>
    <h3 className='font-nunito font-extrabold text-base leading-[30px] text-gray-900 w-full'>
      Payment Summary
    </h3>

    <div className='space-y-3 w-full'>
      <div className='flex justify-between items-center w-full h-7'>
        <span className='font-nunito font-medium text-sm leading-7 text-gray-900'>
          Price ({itemCount} items)
        </span>
        <span className='font-nunito font-bold text-sm leading-7 tracking-[-0.02em] text-gray-900'>
          {formatPrice(subtotal)}
        </span>
      </div>

      <div className='flex justify-between items-center w-full h-7'>
        <span className='font-nunito font-medium text-sm leading-7 text-gray-900'>
          Delivery Fee
        </span>
        <span className='font-nunito font-bold text-sm leading-7 tracking-[-0.02em] text-gray-900'>
          {formatPrice(deliveryFee)}
        </span>
      </div>

      <div className='flex justify-between items-center w-full h-7'>
        <span className='font-nunito font-medium text-sm leading-7 text-gray-900'>
          Service Fee
        </span>
        <span className='font-nunito font-bold text-sm leading-7 tracking-[-0.02em] text-gray-900'>
          {formatPrice(serviceFee)}
        </span>
      </div>

      <div className='flex justify-between items-center w-full h-8'>
        <span className='font-nunito font-normal text-base leading-[30px] tracking-[-0.02em] text-gray-900'>
          Total
        </span>
        <span className='font-nunito font-extrabold text-base leading-[30px] text-gray-900'>
          {formatPrice(total)}
        </span>
      </div>

      <button
        onClick={onCheckout}
        className='flex flex-row justify-center items-center px-2 py-2 gap-2 w-full h-11 bg-[#C12116] rounded-full hover:bg-[#B01E14] transition-colors'
      >
        <span className='font-nunito font-bold text-base leading-[30px] tracking-[-0.02em] text-[#FDFDFD]'>
          Buy
        </span>
      </button>
    </div>
  </div>
);

// Main Component
const CheckoutPage: React.FC = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const queryClient = useQueryClient();
  const cartItems = useSelector((state: RootState) => state.cart.items);

  // State
  const [selectedPayment, setSelectedPayment] = useState<string>('bni');
  const [isMounted, setIsMounted] = useState(false);
  const [snapResponse, setSnapResponse] = useState<MidtransSnapResponse | null>(null);
  const [paymentResponse, setPaymentResponse] = useState<PaymentResponse | null>(null);

  const handlePaymentSuccess = (response: PaymentResponse) => {
    setPaymentResponse(response);
    router.push('/success');
  };

  useLayoutEffect(() => {
    setIsMounted(true);
  }, []);

  // Fetch user profile
  const { data: userProfile, isLoading: isProfileLoading } = useQuery({
    queryKey: ['userProfile'],
    queryFn: () => authApi.getProfile(),
    select: (response) => ({
      ...response.data,
      address:
        typeof window !== 'undefined'
          ? localStorage.getItem('userAddress') || ''
          : '',
    }),
  });

  // Memoized calculations
  const groupedItems = useMemo(() => {
    return cartItems.reduce(
      (acc, item) => {
        const restaurantId = item.restaurantId;
        if (!acc[restaurantId]) {
          acc[restaurantId] = {
            restaurantId,
            restaurantName: item.restaurantName || 'Restaurant',
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
          items: CartItem[];
          total: number;
        }
      >
    );
  }, [cartItems]);

  const subtotal = useMemo(
    () =>
      cartItems.reduce((total, item) => total + item.price * item.quantity, 0),
    [cartItems]
  );

  const total = useMemo(
    () => subtotal + DELIVERY_FEE + SERVICE_FEE,
    [subtotal]
  );

  // Event handlers
  const handleQuantityChange = (itemId: string, change: number) => {
    const item = cartItems.find((item) => item.id === itemId);
    if (item) {
      const newQuantity = item.quantity + change;
      if (newQuantity <= 0) {
        dispatch(removeFromCart(itemId));
      } else {
        dispatch(updateQuantity({ id: itemId, quantity: newQuantity }));
      }
    }
  };

  const handleNavigateToRestaurant = (restaurantId: string) => {
    router.push(`/restaurants/${restaurantId}`);
  };

  const handleEditAddress = () => {
    router.push('/profile?tab=address');
  };

  const handleCheckout = async () => {
    try {
      // Check if user is authenticated
      const token =
        typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (!token) {
        alert('Please log in to place an order');
        return;
      }

      // Validate address
      const deliveryAddress = userProfile?.address || '';
      if (!deliveryAddress.trim()) {
        alert('Please provide a delivery address before placing your order.');
        return;
      }

      // Sync cart to server (optional step)
      try {
        await cartApi.clearCart();
        for (const item of cartItems) {
          await cartApi.addToCart({
            restaurantId: parseInt(item.restaurantId),
            menuId: parseInt(item.id),
            quantity: item.quantity,
          });
        }
      } catch (cartError) {
        console.warn('Cart sync failed:', cartError);
      }

      // Group cart items by restaurant
      const restaurantItems = cartItems.reduce(
        (acc, item) => {
          const restaurantId = parseInt(item.restaurantId);
          if (!acc[restaurantId]) {
            acc[restaurantId] = {
              restaurantId: restaurantId,
              items: [],
            };
          }
          acc[restaurantId].items.push({
            menuId: parseInt(item.id),
            quantity: item.quantity,
            notes: '',
          });
          return acc;
        },
        {} as Record<number, { restaurantId: number; items: { menuId: number; quantity: number; notes: string }[] }>
      );

      // Create order via API
      const apiOrderData = {
        paymentMethod: selectedPayment, // Send ID (e.g., 'bni'), not name
        deliveryAddress: deliveryAddress,
        notes: '',
        restaurants: Object.values(restaurantItems),
      };

      const response = await ordersApi.createOrder(apiOrderData);

      // Update local state if API call successful
      if (cartItems.length > 0 && response.success) {
        const firstItem = cartItems[0];
        dispatch(
          addOrder({
            restaurantId: firstItem.restaurantId,
            restaurantName: firstItem.restaurantName || 'Restaurant',
            items: cartItems.map((item) => ({
              id: item.id,
              menuItemId: item.id,
              name: item.name,
              price: item.price,
              quantity: item.quantity,
              restaurantId: item.restaurantId,
              imageUrl: item.imageUrl,
            })),
            totalAmount: total,
            status: 'preparing',
            deliveryAddress: deliveryAddress,
            customerName: userProfile?.name || 'Customer',
            customerPhone: userProfile?.phone || '',
            notes: '',
          })
        );
      }

      // Clear cart and cache
      dispatch(clearCart());
      queryClient.invalidateQueries({ queryKey: ['orders'] });

      // Navigate to success page
      router.push('/success');
    } catch (error: unknown) {
      // COMPLETE DEBUG LOGGING
      console.error('Error creating order (COMPLETE DEBUG):', {
        rawError: error,
        errorType: typeof error,
        errorKeys: Object.keys((error as object) || {}),
        errorString: String(error),
        errorJSON: JSON.stringify(error, null, 2),
        isAxiosError: (error as ApiError)?.isAxiosError,
        message: (error as Error)?.message,
        status: (error as ApiError)?.status,
        response: (error as ApiError)?.response,
      });

      // Network / Offline Check
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        alert('You are offline. Please check your internet connection.');
        return;
      }

      // Network / CORS Error (Status 0 or "Network Error")
      if (
        (error as ApiError)?.status === 0 ||
        (error as Error)?.message === 'Network Error' ||
        ((error as Error)?.message && (error as Error)?.message.includes('Failed to fetch'))
      ) {
        alert(
          'Unable to connect to server. This might be a connection issue or the server is unreachable.'
        );
        return;
      }

      // Authentication Error
      if ((error as ApiError)?.status === 401) {
        alert('Session expired. Please log in again.');
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return;
      }

      // Bad Request
      if ((error as ApiError)?.status === 400) {
        const serverMessage =
          (error as ApiError)?.response?.data?.message ||
          (error as Error)?.message ||
          'Invalid order information.';
        const validationErrors = (error as ApiError)?.response?.data?.errors;

        console.error('Validation errors:', validationErrors);

        if (Array.isArray(validationErrors)) {
          const errorList = validationErrors
            .map((err: { property: string; constraints: Record<string, string> }) => {
              const constraints = err.constraints
                ? Object.values(err.constraints).join(', ')
                : 'Invalid value';
              return `${err.property}: ${constraints}`;
            })
            .join('\n');
          alert(`Please check:\n${errorList}`);
        } else if (
          validationErrors &&
          typeof validationErrors === 'object' &&
          Object.keys(validationErrors).length > 0
        ) {
          const errorList = Object.entries(validationErrors)
            .map(([field, message]) => `${field}: ${message}`)
            .join('\n');
          alert(`Please check:\n${errorList}`);
        } else {
          alert(`Validation Error: ${serverMessage}`);
        }
        return;
      }

      // Generic Error
      const msg = (error as Error)?.message || 'An unexpected error occurred.';
      alert(`Checkout failed: ${msg}. Please try again.`);
    }
  };

  // Prevent hydration mismatch
  if (!isMounted) {
    return null;
  }

  // Empty cart state
  if (cartItems.length === 0) {
    return (
      <div className='min-h-screen bg-gray-50 pt-20'>
        <div className='max-w-6xl mx-auto px-8 py-16'>
          <div className='text-center'>
            <h1 className='text-4xl font-extrabold text-gray-900 mb-8'>
              Checkout
            </h1>
            <div className='bg-white rounded-2xl shadow-lg p-16'>
              <div className='text-gray-500 text-lg mb-4'>
                Your cart is empty
              </div>
              <button
                onClick={() => router.push('/')}
                className='bg-red-600 text-white px-8 py-3 rounded-full font-bold hover:bg-red-700 transition-colors'
              >
                Start Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50 pt-20'>
      <div className='max-w-6xl mx-auto px-4 md:px-8 py-4 md:py-16'>
        {/* Page Title */}
        <h1 className='text-2xl md:text-4xl font-extrabold text-gray-900 mb-4 md:mb-8 font-nunito'>
          Checkout
        </h1>

        {/* Main Content */}
        <div className='flex flex-col md:flex-row gap-4 md:gap-5'>
          {/* Left Column - Order Details */}
          <div className='flex-1 space-y-4 md:space-y-5'>
            <AddressCard
              address={userProfile?.address}
              phone={userProfile?.phone}
              isLoading={isProfileLoading}
              onEdit={handleEditAddress}
            />

            {/* My Cart List */}
            <div className='bg-white rounded-2xl shadow-[0px_0px_20px_rgba(203,202,202,0.25)] p-4 w-full'>
              {Object.values(groupedItems).map((group) => (
                <RestaurantGroup
                  key={group.restaurantId}
                  group={group}
                  onQuantityChange={handleQuantityChange}
                  onNavigateToRestaurant={handleNavigateToRestaurant}
                />
              ))}
            </div>
          </div>

          {/* Right Column - Payment & Summary */}
          <div className='w-full md:w-96'>
            <div className='relative bg-white rounded-2xl shadow-[0px_0px_20px_rgba(203,202,202,0.25)] w-full'>
              {/* Decorative Ellipses */}
              <div
                className='absolute w-5 h-5 bg-gray-100 rounded-full -left-2.5'
                style={{ top: '51%', zIndex: 3 }}
              ></div>
              <div
                className='absolute w-5 h-5 bg-gray-100 rounded-full -right-2.5'
                style={{ top: '51%', zIndex: 3 }}
              ></div>

              <div className='flex flex-col items-end py-4 gap-4 w-full'>
                {/* Payment Method Section */}
                <div className='flex flex-col items-start px-4 w-full'>
                  <h3 className='font-nunito font-extrabold text-base leading-[30px] text-gray-900 w-full mb-4'>
                    Payment Method
                  </h3>

                  <div className='flex flex-col space-y-3 w-full'>
                    {PAYMENT_METHODS.map((method, index) => (
                      <React.Fragment key={method.id}>
                        <PaymentMethodCard
                          method={method}
                          isSelected={selectedPayment === method.id}
                          onSelect={setSelectedPayment}
                        />
                        {index < PAYMENT_METHODS.length - 1 && (
                          <div className='w-full h-px bg-[#E9EAEB]'></div>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                {/* Dashed Line Separator */}
                <div className='w-full h-px border-t border-dashed border-[#D5D7DA]'></div>

                {/* Payment Summary Section */}
                <PaymentSummary
                  subtotal={subtotal}
                  deliveryFee={DELIVERY_FEE}
                  serviceFee={SERVICE_FEE}
                  total={total}
                  itemCount={cartItems.length}
                  onCheckout={handleCheckout}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default CheckoutPage;
