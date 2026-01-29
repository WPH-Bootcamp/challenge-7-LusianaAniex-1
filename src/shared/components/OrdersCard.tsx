import { useState, useRef } from 'react';
import { Search } from 'lucide-react';
import { useSelector } from 'react-redux';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { ordersApi } from '@/shared/api/orders';
import {
  useCreateReviewMutation,
  useMyReviewsQuery,
} from '@/shared/api/queries/reviews';
import { useMenuImages } from '@/shared/hooks/useMenuImages';
import { useAuth } from '@/shared/hooks/useAuth';
import ReviewModal from './ReviewModal';
import { OrdersFilter } from '@/shared/components/orders/OrdersFilter';
import { OrdersList } from '@/shared/components/orders/OrdersList';
import { STATUS_FILTERS } from '@/shared/constants/orders';
import { getPlaceholderImage } from '@/shared/utils/placeholders';
import type { RootState } from '@/shared/store/store';
import type { Order } from '@/features/orders/ordersSlice';
import type { Review } from '@/shared/types';
import type { OrderUI } from '@/shared/components/orders/types';

const OrdersCard = () => {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [statusFilter, setStatusFilter] = useState<string>('done');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isReviewModalOpen, setIsReviewModalOpen] = useState<boolean>(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderUI | null>(null);

  // Get orders from Redux store (contains actual checkout data with images)
  const reduxOrders = useSelector((state: RootState) => state.orders.orders);

  // Fetch orders from API
  const {
    data: ordersData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['orders', statusFilter],
    queryFn: () =>
      ordersApi.getMyOrders(statusFilter === 'done' ? undefined : statusFilter),
    staleTime: 30000, // 30 seconds
    enabled: isAuthenticated, // Only fetch when user is authenticated
    retry: (failureCount, error) => {
      // Don't retry on 401 errors to prevent loops
      const axiosError = error as { response?: { status?: number } };
      if (axiosError?.response?.status === 401) {
        return false;
      }
      return failureCount < 2;
    },
  });

  // Use the menu images hook
  const { menuImages } = useMenuImages(ordersData);

  // Review mutation
  const createReviewMutation = useCreateReviewMutation();

  // Fetch user's reviews to check which orders have been reviewed
  const { data: myReviewsData } = useMyReviewsQuery(
    { page: 1, limit: 100 },
    { enabled: isAuthenticated }
  );

  // Helper function to check if order has already been reviewed
  const hasReviewedOrder = (transactionId: string) => {
    if (!transactionId || !myReviewsData?.reviews) return false;
    return myReviewsData.reviews.some(
      (review: Review) => review.transactionId === transactionId
    );
  };

  // Navigation handler
  const handleRestaurantClick = (restaurantId: number) => {
    router.push(`/restaurants/${restaurantId}`);
  };

  // Modal handlers
  const handleOpenReviewModal = (order: OrderUI) => {
    setSelectedOrder(order);
    setIsReviewModalOpen(true);
  };

  const handleCloseReviewModal = () => {
    setIsReviewModalOpen(false);
    setSelectedOrder(null);
  };

  const handleSubmitReview = async (rating: number, comment: string) => {
    if (!selectedOrder || !selectedOrder.restaurantId) {
      console.error('Missing order data:', { selectedOrder });
      alert('Unable to submit review: Missing order information');
      return;
    }

    try {
      // Ensure we have a valid transaction ID
      const transactionId = selectedOrder.transactionId || selectedOrder.id;

      if (!transactionId) {
        console.error('Missing transaction ID:', { selectedOrder });
        alert('Unable to submit review: Missing transaction ID');
        return;
      }

      const reviewData = {
        transactionId: transactionId,
        restaurantId: selectedOrder.restaurantId,
        star: rating,
        comment: comment,
      };

      console.log('Submitting review:', reviewData); // Debug log
      await createReviewMutation.mutateAsync(reviewData);
      handleCloseReviewModal();
    } catch (error) {
      console.error('Review submission error full object:', error);

      // Safe error parsing
      let errorMessage = 'Unknown error occurred';
      let status: number | undefined;

      // Type checking for error response
      const err = error as { response?: { data?: { message?: string }; status?: number }; message?: string };
      
      if (err?.response?.data?.message) {
        errorMessage = err.response.data.message;
        status = err.response.status;
      } else if (err?.message) {
        errorMessage = err.message;
      }

      console.error('Parsed Review Error:', { errorMessage, status });

      if (
        status === 409 ||
        errorMessage.toLowerCase().includes('already reviewed')
      ) {
        alert('You have already reviewed this restaurant for this order!');
      } else if (
        status === 400 &&
        (errorMessage.toLowerCase().includes('only review restaurants') ||
          errorMessage.toLowerCase().includes('transaction not found'))
      ) {
        alert('You can only review restaurants you have ordered from!');
      } else if (status === 401) {
        alert('Please log in to submit a review');
      } else if (
        status === 404 ||
        errorMessage.toLowerCase().includes('transaction not found') ||
        errorMessage.toLowerCase().includes('does not belong to you')
      ) {
        alert(
          'This order was not found or does not belong to you. Please try refreshing the page.'
        );
      } else {
        alert(`Failed to submit review: ${errorMessage}`);
      }
    }
  };

  // Prioritize API orders over Redux orders for reviews (API orders have valid transaction IDs)
  const mappedOrders: OrderUI[] =
    ordersData?.data.orders.map((apiOrder) => {
      const firstRestaurant = apiOrder.restaurants[0];
      
      interface ApiRestaurant {
        restaurantId?: number;
        id?: number;
        restaurant?: { id: number };
      }

      // Check for restaurantId (API spec), id (flat), or restaurant.id (nested structure)
      const rawId = 
        firstRestaurant?.restaurantId || 
        (firstRestaurant as ApiRestaurant)?.id || 
        (firstRestaurant as ApiRestaurant)?.restaurant?.id;
      
      const restaurantId = Number(rawId) || 0;

      if (!restaurantId) {
        console.warn('Missing restaurantId in order. Restaurants array:', apiOrder.restaurants);
      }
      return {
        id: apiOrder.id.toString(),
        transactionId: apiOrder.transactionId, // Use actual transaction ID from API
        restaurantName: firstRestaurant?.restaurantName || 'Restaurant',
        restaurantId: restaurantId, // Convert to number, default to 1 if not available
        restaurantLogo: '', // API doesn't provide logo in this structure
        status: apiOrder.status,
        items:
          firstRestaurant?.items.map((item) => {
            return {
              id: item.menuId.toString(),
              name: item.menuName,
              quantity: item.quantity,
              price: item.price,
              image:
                (item as { image?: string }).image ||
                menuImages[item.menuId.toString()] ||
                getPlaceholderImage(item.menuName), // Use util function
            };
          }) || [],
        total: apiOrder.pricing.totalPrice,
        orderDate: apiOrder.createdAt,
      };
    }) || [];

  // If no API orders but have Redux orders, map them but mark them as non-reviewable
  const fallbackReduxOrders: OrderUI[] =
    mappedOrders.length === 0 && reduxOrders.length > 0
      ? reduxOrders.map((order: Order) => {
          const restaurantId = Number(order.restaurantId) || 1;
          return {
            id: order.id,
            transactionId: undefined, // No valid transaction ID for local orders
            restaurantName: order.restaurantName || 'Restaurant',
            restaurantId: restaurantId,
            restaurantLogo: '',
            status: order.status || 'done',
            items: order.items.map((item) => ({
              id: item.id,
              name: item.name,
              quantity: item.quantity,
              price: item.price,
              image:
                item.imageUrl ||
                getPlaceholderImage(item.name),
            })),
            total: order.totalAmount,
            orderDate: order.orderDate || new Date().toISOString(),
            isLocalOrder: true, // Flag to indicate this is a local order
          };
        })
      : [];

  // Combine API orders with fallback Redux orders
  const allMappedOrders = [...mappedOrders, ...fallbackReduxOrders];

  // Filter orders by search
  const filteredOrders = allMappedOrders.filter((order) => {
    const matchesSearch =
      order.restaurantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.items.some((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    return matchesSearch;
  });

  // Format currency
  const formatCurrency = (price: number): string => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <>
      {/* My Orders Title */}
      <h1 className='text-2xl md:text-3xl font-extrabold text-gray-900 mb-4 md:mb-6 leading-9 md:leading-tight font-nunito'>
        My Orders
      </h1>

      {/* Main Orders Container */}
      <div className='bg-white rounded-2xl shadow-[0px_0px_20px_rgba(203,202,202,0.25)] p-4 md:p-6 w-[361px] md:w-full h-auto md:h-[734px] flex flex-col items-start gap-5 md:gap-5'>
        {/* Search Bar */}
        <div className='flex flex-row items-center px-4 py-2 gap-1.5 w-full max-w-[329px] md:max-w-[598px] h-11 bg-white border border-[#D5D7DA] rounded-full'>
          <Search className='w-5 h-5 text-gray-500' />
          <input
            type='text'
            placeholder='Search'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className='w-full h-7 font-nunito font-normal text-sm leading-7 tracking-[-0.02em] text-[#535862] border-none outline-none bg-transparent'
          />
        </div>

        {/* Status Filters */}
        <OrdersFilter 
          currentFilter={statusFilter} 
          onFilterChange={setStatusFilter} 
        />

        {/* Orders List */}
        <OrdersList
          orders={filteredOrders}
          isLoading={isLoading}
          error={error}
          onRestaurantClick={handleRestaurantClick}
          onReviewClick={handleOpenReviewModal}
          hasReviewedOrder={hasReviewedOrder}
          formatCurrency={formatCurrency}
        />
      </div>

      {/* Review Modal */}
      <ReviewModal
        isOpen={isReviewModalOpen}
        onClose={handleCloseReviewModal}
        onSubmit={handleSubmitReview}
      />
    </>
  );
};

export default OrdersCard;
