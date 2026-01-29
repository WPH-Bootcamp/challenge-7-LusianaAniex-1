import React, { useState, useLayoutEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Star } from 'lucide-react';
import { Card } from '@/shared/ui/card';
import type { Restaurant } from '@/shared/types';
import { getRestaurantDistance, formatDistance } from '@/shared/utils/distance';
import { useGeolocation } from '@/shared/hooks/useGeolocation';
import restaurantPlaceholder from '@/assets/images/restaurant-placeholder.jpg';

interface RestaurantCardProps {
  restaurant: Restaurant;
  onClick?: () => void;
  userLocation?: { latitude: number; longitude: number } | null;
}

const RestaurantCard: React.FC<RestaurantCardProps> = ({
  restaurant,
  onClick,
  userLocation: propUserLocation,
}) => {
  const router = useRouter();
  const [imgSrc, setImgSrc] = useState<string | typeof restaurantPlaceholder>(
    restaurant.images?.[0] || restaurant.logo || restaurantPlaceholder
  );

  useLayoutEffect(() => {
    const newSrc =
      restaurant.images?.[0] || restaurant.logo || restaurantPlaceholder;
    if (imgSrc !== newSrc) {
      setImgSrc(newSrc);
    }
  }, [restaurant, imgSrc]);

  // Use geolocation hook to get user's current location
  const { latitude, longitude } = useGeolocation();

  // Use prop location if provided, otherwise use geolocation hook
  const userLocation =
    propUserLocation ||
    (latitude && longitude ? { latitude, longitude } : null);

  const distance = getRestaurantDistance(restaurant, userLocation);

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      router.push(`/restaurants/${restaurant.id}`);
    }
  };

  const handleError = () => {
    if (imgSrc === restaurant.images?.[0] && restaurant.logo) {
      setImgSrc(restaurant.logo);
    } else {
      setImgSrc(restaurantPlaceholder);
    }
  };

  return (
    <Card
      className='flex flex-row items-center p-3 md:p-4 gap-2 md:gap-3 w-full md:w-[370px] h-[114px] md:h-[152px] bg-white shadow-[0px_0px_20px_rgba(203,202,202,0.25)] rounded-2xl flex-none order-0 grow-0 cursor-pointer transition-all duration-200 border-none hover:shadow-[0px_0px_25px_rgba(203,202,202,0.35)]'
      onClick={handleClick}
    >
      {/* Restaurant Image - Rectangle 3 */}
      <div className='relative w-[90px] h-[90px] md:w-[120px] md:h-[120px] rounded-xl flex-none order-0 grow-0 overflow-hidden bg-gray-100'>
        <Image
          src={imgSrc}
          alt={restaurant.name}
          fill
          className='object-cover'
          onError={handleError}
          sizes='(max-width: 768px) 90px, 120px'
          unoptimized
        />
      </div>

      {/* Restaurant Info - Frame 2 */}
      <div className='flex flex-col items-start p-0 gap-0.5 w-[239px] md:w-[206px] h-[90px] md:h-[96px] flex-none order-1 flex-grow'>
        {/* Restaurant Name - Burger King */}
        <div className='w-[239px] md:w-[206px] h-[30px] md:h-[32px] font-nunito font-extrabold text-base md:text-lg leading-[30px] md:leading-8 tracking-[-0.02em] text-gray-900 flex-none order-0 self-stretch grow-0'>
          {restaurant.name}
        </div>

        {/* Rating - Frame 1 */}
        <div className='flex flex-row items-center p-0 gap-1 w-[239px] md:w-[206px] h-[28px] md:h-[30px] flex-none order-1 self-stretch grow-0'>
          {/* Star */}
          <div className='w-6 h-6 flex-none order-0 grow-0 flex items-center justify-center'>
            <Star className='w-6 h-6 text-[#FFAB0D] fill-[#FFAB0D]' />
          </div>
          {/* Rating Number - 4.9 */}
          <div className='w-[21px] h-[28px] md:h-[30px] font-nunito font-medium text-sm md:text-base leading-7 md:leading-[30px] text-center tracking-[-0.03em] text-gray-900 flex-none order-1 grow-0'>
            {restaurant.star?.toFixed(1) || 'N/A'}
          </div>
        </div>

        {/* Location and Distance - Frame 7 */}
        <div className='flex flex-row items-center p-0 gap-1.5 min-w-[239px] md:min-w-[206px] h-[28px] md:h-[30px] flex-none order-2 self-stretch grow-0'>
          {/* Location - Jakarta Selatan */}
          <div className='w-[92px] md:w-[105px] h-[28px] md:h-[30px] font-nunito font-normal text-sm md:text-base leading-7 md:leading-[30px] tracking-[-0.02em] text-gray-900 flex-none order-0 grow-0'>
            {restaurant.place}
          </div>
          {/* Separator - Ellipse 1 */}
          <div className='w-0.5 h-0.5 bg-[#0A0D12] rounded-full flex-none order-1 grow-0' />
          {/* Distance - 2.4 km */}
          <div className='min-w-[42px] md:min-w-[48px] h-[28px] md:h-[30px] font-nunito font-normal text-sm md:text-base leading-7 md:leading-[30px] tracking-[-0.02em] text-gray-900 flex-none order-2 grow-0 whitespace-nowrap'>
            {formatDistance(distance)}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default RestaurantCard;
