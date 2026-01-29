import React from 'react';
import SearchBar from './SearchBar';
import bgMainpage from '@/assets/images/bg-mainpage.png';

interface HeroSectionProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({
  searchQuery,
  onSearchChange,
}) => {
  return (
    <div className='relative h-[648px] md:hero-height' style={{ zIndex: 1 }}>
      {/* Background Image */}
      <div
        className='absolute -top-16 md:-top-20 left-0 right-0 bottom-0 bg-cover bg-no-repeat'
        style={{
          backgroundImage: `url(${bgMainpage.src})`,
          backgroundPosition: 'center top 64px',
        }}
      />

      {/* Gradient Overlay */}
      <div
        className='absolute -top-16 md:-top-20 left-0 right-0 bottom-0 hero-gradient'
        style={{ zIndex: 2 }}
      />

      {/* Hero Content */}
      <div
        className='relative flex flex-col items-center justify-center h-full px-4'
        style={{ zIndex: 3 }}
      >
        <div className='text-center max-w-[349px] md:max-w-4xl'>
          <h1 className='text-[36px] md:text-display-2xl text-white mb-1 md:mb-2 leading-[44px] md:leading-tight font-nunito font-extrabold'>
            Explore Culinary Experiences
          </h1>
          <p className='text-[18px] md:text-display-xs text-white mb-6 md:mb-10 leading-[32px] md:leading-[36px] font-nunito font-bold tracking-[-0.03em]'>
            Search and refine your choice to discover the perfect restaurant.
          </p>

          {/* Search Bar */}
          <SearchBar
            searchQuery={searchQuery}
            onSearchChange={onSearchChange}
          />
        </div>
      </div>
    </div>
  );
};
export default HeroSection;
