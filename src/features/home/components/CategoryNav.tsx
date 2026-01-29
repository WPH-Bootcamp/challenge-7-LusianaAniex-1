/**
 * Category Navigation Component
 * Horizontal scrollable category icons for filtering
 */

'use client';

import React from 'react';
import { useCategoriesQuery } from '@/features/menu';
import { setSelectedCategory } from '@/features/filters';
import { useAppDispatch, useAppSelector } from '@/shared/store/hooks';

// Category icons mapping
const CATEGORY_ICONS: Record<string, string> = {
  'Restaurant': '🏪',
  'Burger': '🍔',
  'Pizza': '🍕',
  'Donut': '🍩',
  'Noodles': '🍜',
  'Dessert': '🍰',
  'Drinks': '🥤',
  'Salad': '🥗',
};

 export function CategoryNav() {
  const dispatch = useAppDispatch();
  const { data: categories, isLoading } = useCategoriesQuery();
  const selectedCategory = useAppSelector((state) => state.filters.selectedCategory);

  const handleCategoryClick = (categoryId: string) => {
    // Toggle: if clicking the same category, clear it; otherwise set it
    dispatch(setSelectedCategory(selectedCategory === categoryId ? '' : categoryId));
  };

  if (isLoading) {
    return <div className="py-8 text-center text-gray-500">Loading categories...</div>;
  }

  return (
    <section className="py-8 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        {/* Scrollable Container */}
        <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
          {categories?.map((category) => {
            const isActive = selectedCategory === category.id;
            const icon = CATEGORY_ICONS[category.name] || '🍽️';

            return (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category.id)}
                className={`flex flex-col items-center gap-2 min-w-[80px] transition-all ${
                  isActive ? 'opacity-100' : 'opacity-60 hover:opacity-100'
                }`}
              >
                {/* Icon Circle */}
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl transition-all ${
                    isActive
                      ? 'bg-orange-100 ring-2 ring-orange-500'
                      : 'bg-gray-100 hover:bg-orange-50'
                  }`}
                >
                  {icon}
                </div>

                {/* Label */}
                <span
                  className={`text-sm font-medium ${
                    isActive ? 'text-orange-600' : 'text-gray-700'
                  }`}
                >
                  {category.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
