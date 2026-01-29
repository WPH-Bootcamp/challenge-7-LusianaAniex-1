/**
 * Menu Card Component
 * Displays individual menu item with image, name, price, rating
 */

'use client';

import React from 'react';
import Image from 'next/image';
import type { MenuItem } from '../types';
import { formatCurrency } from '@/shared/lib/utils';
import { addToCart } from '@/features/cart';
import { useAppDispatch } from '@/shared/store/hooks';

interface MenuCardProps {
  item: MenuItem;
  restaurantId: string;
  restaurantName: string;
}

export function MenuCard({ item, restaurantId, restaurantName }: MenuCardProps) {
  const dispatch = useAppDispatch();

  const handleAddToCart = () => {
    dispatch(addToCart({
      id: item.id,
      menuItemId: item.id,
      name: item.name,
      price: item.price,
      quantity: 1,
      imageUrl: item.image,
      restaurantId,
      restaurantName,
    }));
  };

  return (
    <div className="group bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer">
      {/* Image Container */}
      <div className="relative h-48 w-full overflow-hidden bg-gray-100">
        <Image
          src={item.image}
          alt={item.name}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-300"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          unoptimized
        />
        
        {/* Orange Badge - KING style from mockup */}
        <div className="absolute top-3 left-3 bg-orange-600 text-white px-3 py-1.5 rounded-md font-bold text-xs">
          KING
        </div>
        
        {/* Rating Badge */}
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1">
          <span className="text-yellow-500">⭐</span>
          <span className="text-sm font-semibold text-gray-800">{item.rating}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Item Name */}
        <h3 className="font-bold text-lg text-gray-900 mb-1 line-clamp-1">
          {item.name}
        </h3>

        {/* Restaurant Name */}
        <p className="text-sm text-gray-500 mb-2 flex items-center gap-1">
          <span>🍴</span>
          <span className="line-clamp-1">{restaurantName}</span>
        </p>

        {/* Category & Price Row */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
            {item.category}
          </span>
          <span className="text-lg font-bold text-orange-600">
            {formatCurrency(item.price)}
          </span>
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}
