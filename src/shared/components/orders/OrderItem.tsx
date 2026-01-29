import React, { useState } from 'react';
import Image from 'next/image';
import restaurantIcon from '../../../assets/images/restaurant-icon.png';
import { OrderUI } from './types';

// Helper component for Order Image with fallback
const OrderImage = ({ src, alt }: { src: string; alt: string }) => {
  const [error, setError] = useState(false);

  if (error) return null;

  return (
    <Image
      src={src}
      alt={alt}
      fill
      className='object-cover rounded-xl relative z-20'
      onError={() => setError(true)}
      sizes="(max-width: 768px) 64px, 80px"
      unoptimized
    />
  );
};

interface OrderItemProps {
  order: OrderUI;
  onRestaurantClick: (id: number) => void;
  onReviewClick: (order: OrderUI) => void;
  hasReviewed: boolean;
  formatCurrency: (price: number) => string;
}

export const OrderItem: React.FC<OrderItemProps> = ({
  order,
  onRestaurantClick,
  onReviewClick,
  hasReviewed,
  formatCurrency,
}) => {
  return (
    <div className='flex flex-col items-start p-4 md:p-5 gap-4 w-full md:w-[95%] h-auto md:h-[268px] bg-white shadow-[0px_0px_20px_rgba(203,202,202,0.25)] rounded-2xl mx-auto'>
      {/* Restaurant Header */}
      <div className='flex flex-row items-center p-0 gap-2 w-auto h-8'>
        <div className='relative w-8 h-8 bg-transparent rounded-lg flex items-center justify-center overflow-hidden'>
          <Image
            src={restaurantIcon}
            alt={order.restaurantName}
            fill
            className='object-cover rounded-lg'
          />
        </div>
        <span
          onClick={() => onRestaurantClick(order.restaurantId)}
          className='text-base md:text-lg font-bold text-gray-900 font-nunito leading-8 tracking-[-0.03em] cursor-pointer transition-colors hover:text-[#C12116]'
        >
          {order.restaurantName}
        </span>
      </div>

      {/* Order Items */}
      <div className='flex flex-col md:flex-row justify-between items-start md:items-center p-0 gap-5 w-full min-h-[88px]'>
        <div className='flex flex-row items-center p-0 gap-4 flex-1 min-h-[80px] w-full md:w-auto'>
          {/* Item Image */}
          <div className='w-16 h-16 md:w-20 md:h-20 bg-[#F3F4F6] rounded-xl flex items-center justify-center overflow-hidden flex-none'>
            <div className='w-full h-full bg-linear-to-br from-[#F3F4F6] to-[#E5E7EB] rounded-xl flex items-center justify-center text-lg md:text-2xl font-bold text-[#6B7280] relative overflow-hidden'>
              <span className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10'>
                {order.items[0]?.name?.charAt(0).toUpperCase() || '?'}
              </span>
              {order.items[0]?.image && (
                <OrderImage
                  src={order.items[0].image}
                  alt={order.items[0]?.name || 'Food Item'}
                />
              )}
            </div>
          </div>

          {/* Item Info */}
          <div className='flex flex-col items-start p-0 flex-1 min-h-[60px] justify-center'>
            <span className='text-sm md:text-base font-medium text-gray-900 font-nunito leading-7 tracking-[-0.03em] mb-1'>
              {order.items[0]?.name || 'Food Item'}
            </span>
            <span className='text-sm md:text-base font-extrabold text-gray-900 font-nunito leading-7'>
              {order.items[0]?.quantity || 1} x{' '}
              {formatCurrency(order.items[0]?.price || 0)}
            </span>
          </div>
        </div>
      </div>

      <div className='w-full h-px border border-[#D5D7DA]' />

      {/* Total and Action */}
      <div className='flex flex-col md:flex-row justify-between items-start md:items-center p-0 gap-5 w-full min-h-[60px]'>
        <div className='flex flex-col items-start p-0 flex-1 min-h-[60px] justify-center'>
          <span className='text-sm md:text-base font-medium text-gray-900 font-nunito leading-7 tracking-[-0.03em] mb-1'>
            Total
          </span>
          <span className='text-base md:text-xl font-extrabold text-gray-900 font-nunito leading-8'>
            {formatCurrency(order.total)}
          </span>
        </div>

        {/* Action Button */}
        {order.isLocalOrder ? (
          <button
            disabled
            className='flex flex-row justify-center items-center p-2 gap-2 w-full md:w-[240px] h-12 bg-[#A4A7AE] rounded-full border-none cursor-not-allowed'
            title='Reviews are only available for completed orders'
          >
            <span className='text-base font-bold text-[#FDFDFD] font-nunito leading-7 tracking-[-0.02em]'>
              Review Unavailable
            </span>
          </button>
        ) : hasReviewed ? (
          <button
            disabled
            className='flex flex-row justify-center items-center p-2 gap-2 w-full md:w-[240px] h-12 bg-[#A4A7AE] rounded-full border-none cursor-not-allowed'
            title='You have already reviewed this order'
          >
            <span className='text-base font-bold text-[#FDFDFD] font-nunito leading-7 tracking-[-0.02em]'>
              Already Reviewed
            </span>
          </button>
        ) : (
          <button
            onClick={() => onReviewClick(order)}
            className='flex flex-row justify-center items-center p-2 gap-2 w-full md:w-[240px] h-12 bg-[#C12116] rounded-full border-none cursor-pointer hover:bg-[#B01E14] transition-colors'
          >
            <span className='text-base font-bold text-[#FDFDFD] font-nunito leading-7 tracking-[-0.02em]'>
              Give Review
            </span>
          </button>
        )}
      </div>
    </div>
  );
};
