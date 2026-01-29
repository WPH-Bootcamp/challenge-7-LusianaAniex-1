import React, { useState } from 'react';
import Image, { StaticImageData } from 'next/image';
import type { Category } from '@/shared/types';

interface CategorySectionProps {
  categories: Category[];
  selectedCategory: string | null;
  isLoading: boolean;
  error: Error | null;
  onCategoryClick: (category: { name: string; filter?: string | null }) => void;
}

const CategoryIcon = ({
  icon,
  name,
}: {
  icon: string | StaticImageData;
  name: string;
}) => {
  const [error, setError] = useState(false);

  if (error) return null;

  return (
    <div className='relative w-12 h-12 md:w-16 md:h-16'>
      <Image
        src={icon}
        alt={name}
        fill
        className='object-contain'
        onError={() => setError(true)}
        sizes="(max-width: 768px) 48px, 64px"
        unoptimized
      />
    </div>
  );
};

const CategorySection: React.FC<CategorySectionProps> = ({
  categories,
  selectedCategory,
  isLoading,
  error,
  onCategoryClick,
}) => {
  if (isLoading) {
    return (
      <div id='categories-section' className='py-16 px-4 md:px-30'>
        <div className='max-w-[393px] md:max-w-6xl mx-auto'>
          <div className='flex justify-center items-center py-8'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500'></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div id='categories-section' className='py-16 px-4 md:px-30'>
        <div className='max-w-[393px] md:max-w-6xl mx-auto'>
          <div className='text-center py-8'>
            <p className='text-red-600'>Failed to load categories</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id='categories-section' className='py-16 px-4 md:px-30'>
      <div className='max-w-[393px] md:max-w-6xl mx-auto'>
        <div className='flex flex-wrap justify-center gap-5 md:gap-8'>
          {categories.map((category, index) => {
            const isActive = selectedCategory === category.filter;

            return (
              <div
                key={category.id || index}
                className='flex flex-col items-center gap-1 md:gap-2 cursor-pointer hover:opacity-80 transition-opacity w-[106px] md:w-auto'
                onClick={() => onCategoryClick(category)}
              >
                <div
                  className={`w-[106px] h-[100px] md:w-40 md:h-25 rounded-2xl shadow-[0px_0px_20px_rgba(203,202,202,0.25)] flex items-center justify-center overflow-hidden transition-colors p-2 ${
                    isActive
                      ? 'bg-orange-100 border-2 border-orange-500'
                      : 'bg-white'
                  }`}
                >
                  <CategoryIcon icon={category.icon || ''} name={category.name} />
                </div>
                <span
                  className={`text-sm md:text-lg-bold font-bold text-center leading-7 tracking-[-0.02em] font-nunito ${
                    isActive ? 'text-orange-600' : 'text-gray-900'
                  }`}
                >
                  {category.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CategorySection;
