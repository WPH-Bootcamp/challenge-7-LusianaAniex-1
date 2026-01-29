import React from 'react';
import { OrderUI } from './types';
import { OrderItem } from './OrderItem';

interface OrdersListProps {
  orders: OrderUI[];
  isLoading: boolean;
  error: unknown;
  onRestaurantClick: (id: number) => void;
  onReviewClick: (order: OrderUI) => void;
  hasReviewedOrder: (transactionId: string) => boolean;
  formatCurrency: (price: number) => string;
}

export const OrdersList: React.FC<OrdersListProps> = ({
  orders,
  isLoading,
  error,
  onRestaurantClick,
  onReviewClick,
  hasReviewedOrder,
  formatCurrency,
}) => {
  if (isLoading) {
    return (
      <div className='flex flex-col items-center justify-center p-10 w-full h-[200px] bg-white rounded-2xl shadow-[0px_0px_20px_rgba(203,202,202,0.25)]'>
        <span className='font-nunito font-semibold text-lg leading-7 text-[#717680] text-center'>
          Loading orders...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex flex-col items-center justify-center p-10 w-full h-[200px] bg-white rounded-2xl shadow-[0px_0px_20px_rgba(203,202,202,0.25)]'>
        <span className='font-nunito font-semibold text-lg leading-7 text-[#717680] text-center'>
          Error loading orders
        </span>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center p-10 w-full h-[200px] bg-white rounded-2xl shadow-[0px_0px_20px_rgba(203,202,202,0.25)]'>
        <span className='font-nunito font-semibold text-lg leading-7 text-[#717680] text-center'>
          No orders found
        </span>
      </div>
    );
  }

  return (
    <div className='flex flex-col items-start p-0 gap-4 w-full h-auto max-h-[400px] md:max-h-[600px] overflow-y-auto'>
      {orders.map((order, index) => (
        <div
          key={order.id}
          style={{
            marginTop: index === 0 ? '20px' : '0px',
            marginBottom: index === orders.length - 1 ? '20px' : '0px',
          }}
          className='w-full'
        >
          <OrderItem
            order={order}
            onRestaurantClick={onRestaurantClick}
            onReviewClick={onReviewClick}
            hasReviewed={hasReviewedOrder(order.transactionId || '')}
            formatCurrency={formatCurrency}
          />
        </div>
      ))}
    </div>
  );
};
