'use client';

import React, { useLayoutEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { Check } from 'lucide-react';
import Image from 'next/image';
import type { CartItem } from '@/shared/types';
import redLogo from '@/assets/images/red-logo.png';

// Types
interface OrderData {
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  serviceFee: number;
  total: number;
  paymentMethod: string;
  orderDate: string;
}

// Utility Functions
const formatCurrency = (price: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(price);
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Sub-components
const LoadingState = () => (
  <div className='min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4'>
    <div className='text-center'>
      <div className='w-16 h-16 bg-gray-200 rounded-full animate-pulse mx-auto mb-4'></div>
      <p className='text-gray-600'>Loading order details...</p>
    </div>
  </div>
);

interface HeaderProps {
  onLogoClick: () => void;
}

const Header = ({ onLogoClick }: HeaderProps) => (
  <div
    className='flex items-center gap-2 md:gap-4 mb-4 md:mb-7 cursor-pointer hover:opacity-80 transition-opacity'
    onClick={onLogoClick}
  >
    <div className='w-8 h-8 md:w-10 md:h-10 relative'>
      <Image
        src={redLogo}
        alt='Foody Logo'
        fill
        sizes='(max-width: 768px) 32px, 40px'
        className='object-contain'
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          const parent = target.parentElement;
          if (parent) {
            parent.innerHTML = `
              <div class="w-full h-full bg-black rounded-full flex items-center justify-center">
                <div class="w-4 h-4 md:w-6 md:h-6 bg-red-600 rounded-full"></div>
              </div>
            `;
          }
        }}
      />
    </div>
    <h1 className='text-xl md:text-2xl font-extrabold text-gray-900'>Foody</h1>
  </div>
);

interface DecorativeEllipsesProps {
  top: string;
  mobileTop?: string;
}

const DecorativeEllipses = ({ top, mobileTop }: DecorativeEllipsesProps) => (
  <div
    className={`absolute flex justify-between items-center w-[338px] md:w-[446px] h-4 md:h-5 -left-2 md:-left-[9px] z-10 ${mobileTop || top}`}
  >
    <div className='w-4 h-4 md:w-5 md:h-5 bg-[#F5F5F5] rounded-full'></div>
    <div className='w-4 h-4 md:w-5 md:h-5 bg-[#F5F5F5] rounded-full'></div>
  </div>
);

interface DashedLineProps {
  top: string;
  mobileTop?: string;
}

const DashedLine = ({ top, mobileTop }: DashedLineProps) => (
  <div
    className={`absolute w-[290px] md:w-[388px] h-px border-t border-dashed border-[#D5D7DA] z-10 left-4 md:left-5 ${mobileTop || top}`}
  ></div>
);

interface SuccessIconProps {
  title: string;
  message: string;
}

const SuccessIcon = ({ title, message }: SuccessIconProps) => (
  <div className='flex flex-col justify-center items-center w-[290px] md:w-[388px] h-[90px] md:h-[132px] gap-0.5 md:gap-0.5 z-0'>
    <div className='w-10 h-10 md:w-16 md:h-16 bg-[#44AB09] rounded-full flex items-center justify-center'>
      <Check
        className='w-5 h-5 md:w-8 md:h-8 text-white'
        style={{ strokeWidth: '3' }}
      />
    </div>

    <h2 className='w-[290px] md:w-[388px] h-[24px] md:h-[34px] font-nunito font-extrabold text-base md:text-xl leading-6 md:leading-[34px] text-gray-900 text-center'>
      {title}
    </h2>

    <p className='w-[290px] md:w-[388px] h-[20px] md:h-[30px] font-nunito font-normal text-xs md:text-base leading-5 md:leading-[30px] tracking-[-0.02em] text-gray-900 text-center'>
      {message}
    </p>
  </div>
);

interface PaymentDetailRowProps {
  label: string;
  value: string;
}

const PaymentDetailRow = ({ label, value }: PaymentDetailRowProps) => (
  <div className='flex justify-between items-center w-[290px] md:w-[388px] h-6 md:h-[30px] py-1 md:py-2 z-10'>
    <span className='font-nunito font-medium text-xs md:text-base leading-6 md:leading-[30px] tracking-[-0.03em] text-gray-900'>
      {label}
    </span>
    <span className='font-nunito font-bold text-xs md:text-base leading-6 md:leading-[30px] tracking-[-0.02em] text-gray-900'>
      {value}
    </span>
  </div>
);

interface TotalRowProps {
  total: string;
}

const TotalRow = ({ total }: TotalRowProps) => (
  <div className='absolute flex justify-between items-center w-[290px] md:w-[388px] h-7 md:h-8 gap-[100px] md:gap-[135px] z-10 left-3 md:left-5 top-[315px] md:top-[430px]'>
    <span className='w-[28px] md:w-[41px] h-7 md:h-8 font-nunito font-normal text-sm md:text-lg leading-7 md:leading-8 text-gray-900 text-left'>
      Total
    </span>
    <span className='h-7 md:h-8 font-nunito font-extrabold text-sm md:text-lg leading-7 md:leading-8 tracking-[-0.02em] text-gray-900 text-right'>
      {total}
    </span>
  </div>
);

interface SeeOrdersButtonProps {
  onClick: () => void;
}

const SeeOrdersButton = ({ onClick }: SeeOrdersButtonProps) => (
  <button
    onClick={onClick}
    className='absolute flex justify-center items-center w-[290px] md:w-[388px] h-10 md:h-12 px-2 py-2 gap-2 bg-[#C12116] rounded-full hover:opacity-90 transition-opacity z-10 left-3 md:left-5 top-[345px] md:top-[470px]'
  >
    <span className='w-[80px] md:w-[106px] h-6 md:h-[30px] font-nunito font-bold text-xs md:text-base leading-6 md:leading-[30px] tracking-[-0.02em] text-[#FDFDFD]'>
      See My Orders
    </span>
  </button>
);

// Main Component
const PaymentSuccessPage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Get order data from localStorage
  useLayoutEffect(() => {
    const fetchOrderData = async () => {
      try {
        // Try to get from localStorage (fallback for page refresh)
        const storedData = localStorage.getItem('lastOrderData');
        if (storedData) {
          const parsedData = JSON.parse(storedData) as OrderData;
          setOrderData(parsedData);
        } else {
          // Try to get order ID from URL and fetch from API if needed
          const orderId = searchParams?.get('orderId');
          if (orderId) {
            // TODO: Fetch order details from API using orderId
            // For now, we'll keep localStorage approach
          }
        }
      } catch (error) {
        console.error('Error loading order data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrderData();
  }, [searchParams]);

  // Calculate item count
  const itemCount =
    orderData?.items.reduce((total, item) => total + item.quantity, 0) || 0;

  // Event handlers
  const handleSeeOrders = () => {
    // Clear stored order data
    localStorage.removeItem('lastOrderData');

    // Invalidate orders cache to ensure fresh data
    queryClient.invalidateQueries({ queryKey: ['orders'] });

    // Navigate to orders tab
    router.push('/profile?tab=orders');
  };

  const handleLogoClick = () => {
    router.push('/');
  };

  // Cleanup on unmount
  useLayoutEffect(() => {
    // Only clear if navigating away from success page
    const handleBeforeUnload = () => {
      localStorage.removeItem('lastOrderData');
    };

    // Listen for page navigation
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Return cleanup function directly
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // Loading state
  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <div className='min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 md:px-8'>
      <Header onLogoClick={handleLogoClick} />

      <div className='flex flex-col items-center'>
        {/* Success Card */}
        <div
          className='bg-white rounded-2xl relative w-[320px] h-[400px] md:w-[428px] md:h-[546px] p-3 md:p-5 shadow-[0px_0px_20px_rgba(203,202,202,0.25)] flex flex-col items-center gap-2 md:gap-4'
          style={{ isolation: 'isolate' }}
        >
          {/* Decorative Ellipses */}
          <DecorativeEllipses
            top='top-[110px] md:top-[158px]'
            mobileTop='top-[158px]'
          />
          <DecorativeEllipses
            top='top-[290px] md:top-[404px]'
            mobileTop='top-[404px]'
          />

          {/* Success Icon and Message */}
          <SuccessIcon
            title='Payment Success'
            message='Your payment has been successfully processed.'
          />

          {/* Dashed Lines */}
          <DashedLine
            top='top-[118px] md:top-[168px]'
            mobileTop='top-[168px]'
          />
          <DashedLine
            top='top-[296px] md:top-[412px]'
            mobileTop='top-[412px]'
          />

          {/* Payment Details */}
          <div className='absolute flex flex-col w-[290px] md:w-[388px] gap-2 md:gap-4 left-4 md:left-5 top-[207px] md:top-[288px] -translate-y-1/2 z-10'>
            <PaymentDetailRow
              label='Date'
              value={orderData ? formatDate(orderData.orderDate) : 'N/A'}
            />
            <PaymentDetailRow
              label='Payment Method'
              value={orderData?.paymentMethod || 'Bank Nasional Indonesia'}
            />
            <PaymentDetailRow
              label={`Price (${itemCount} items)`}
              value={orderData ? formatCurrency(orderData.subtotal) : 'Rp0'}
            />
            <PaymentDetailRow
              label='Delivery Fee'
              value={
                orderData ? formatCurrency(orderData.deliveryFee) : 'Rp10.000'
              }
            />
            <PaymentDetailRow
              label='Service Fee'
              value={
                orderData ? formatCurrency(orderData.serviceFee) : 'Rp1.000'
              }
            />
          </div>

          {/* Total */}
          <TotalRow
            total={orderData ? formatCurrency(orderData.total) : 'Rp0'}
          />

          {/* See My Orders Button */}
          <SeeOrdersButton onClick={handleSeeOrders} />
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
