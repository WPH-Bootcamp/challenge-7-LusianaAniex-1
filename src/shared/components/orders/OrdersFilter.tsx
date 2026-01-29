import React, { useRef, useState } from 'react';
import { STATUS_FILTERS } from '@/shared/constants/orders';

interface OrdersFilterProps {
  currentFilter: string;
  onFilterChange: (filter: string) => void;
}

export const OrdersFilter: React.FC<OrdersFilterProps> = ({
  currentFilter,
  onFilterChange,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // Mouse handlers for drag scrolling
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Scroll speed multiplier
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!scrollContainerRef.current) return;
    setIsDragging(true);
    setStartX(e.touches[0].pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !scrollContainerRef.current) return;
    const x = e.touches[0].pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  return (
    <div
      ref={scrollContainerRef}
      className={`flex flex-row items-center p-0 gap-3 w-full max-w-[329px] md:max-w-[620px] h-16 md:h-44 overflow-hidden ${
        isDragging ? 'cursor-grabbing' : 'cursor-grab'
      }`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ userSelect: 'none',scrollbarWidth: 'none', msOverflowStyle: 'none' }}
    >
      <span className='text-base md:text-lg font-bold text-gray-900 font-nunito leading-8 tracking-[-0.03em] flex-none'>
        Status
      </span>

      {STATUS_FILTERS.map((filter) => (
        <button
          key={filter.key}
          onClick={() => {
            if (!isDragging) {
              onFilterChange(filter.key);
            }
          }}
          className={`flex flex-row justify-center items-center px-4 py-2 gap-2 h-8 md:h-10 min-w-fit whitespace-nowrap rounded-full transition-all duration-200 shrink-0 ${
            isDragging ? 'cursor-grabbing' : 'cursor-pointer'
          } ${
            currentFilter === filter.key
              ? 'bg-[#FFECEC] border border-[#C12116]'
              : 'bg-white border border-[#D5D7DA] hover:bg-[#F9FAFB]'
          }`}
        >
          <span
            className={`font-nunito text-sm md:text-base leading-tight tracking-[-0.02em] flex items-center justify-center whitespace-nowrap text-center ${
              currentFilter === filter.key
                ? 'font-bold text-[#C12116]'
                : 'font-semibold text-gray-900'
            }`}
          >
            {filter.label}
          </span>
        </button>
      ))}
    </div>
  );
};
