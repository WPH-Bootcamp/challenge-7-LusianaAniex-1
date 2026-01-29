import React from 'react';
import RestaurantCard from '@/shared/components/RestaurantCard';
import ShowMoreButton from '@/shared/components/ShowMoreButton';
import type { Restaurant, Category } from '@/shared/types';

interface RecommendedSectionProps {
  restaurants: Restaurant[];
  categories: Category[];
  selectedCategory: string | null;
  searchQuery: string;
  isInitialLoading: boolean;
  isSearching: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  error: Error | null;
  locationError: Error | null;
  userLocation: { latitude: number; longitude: number } | null;
  isMobile: boolean;
  mobileDisplayCount: number;
  onAllRestaurantClick: () => void;
  onClearFilter: () => void;
  onLoadMore: () => void;
}

const RecommendedSection: React.FC<RecommendedSectionProps> = ({
  restaurants,
  categories,
  selectedCategory,
  searchQuery,
  isInitialLoading,
  isSearching,
  isLoadingMore,
  hasMore,
  error,
  locationError,
  userLocation,
  isMobile,
  mobileDisplayCount,
  onAllRestaurantClick,
  onClearFilter,
  onLoadMore,
}) => {
  return (
    <div className='py-16 px-4 md:px-30 bg-gray-50'>
      <div className='max-w-[393px] md:max-w-6xl mx-auto'>
        {/* Section Header */}
        <div className='flex justify-between items-center mb-4 md:mb-8'>
          <div className='flex items-center gap-4'>
            <h2 className='text-2xl md:text-display-md text-gray-900 font-nunito font-extrabold leading-9 md:leading-[42px]'>
              Recommended
            </h2>
            {selectedCategory && (
              <div className='hidden md:flex items-center gap-2'>
                <span className='text-sm text-gray-600'>
                  Filtered by:{' '}
                  {
                    categories.find((cat) => cat.filter === selectedCategory)
                      ?.name
                  }
                </span>
                <button
                  onClick={onClearFilter}
                  className='text-sm text-red-600 hover:text-red-700 underline'
                >
                  Clear Filter
                </button>
              </div>
            )}
            {selectedCategory === 'nearby' && locationError && (
              <div className='hidden md:flex items-center gap-2'>
                <span className='text-sm text-orange-600'>
                  Location unavailable - showing all restaurants
                </span>
              </div>
            )}
          </div>
          <button
            onClick={onAllRestaurantClick}
            className='text-base md:text-lg-bold text-[#C12116] hover:text-red-700 font-nunito font-extrabold leading-[30px] md:leading-normal'
          >
            See All
          </button>
        </div>

        {/* Loading State */}
        {(isInitialLoading || (searchQuery.trim() && isSearching)) && (
          <div className='flex justify-center items-center py-16'>
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500'></div>
            {searchQuery.trim() && isSearching && (
              <p className='ml-4 text-gray-600'>Searching restaurants...</p>
            )}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className='text-center py-16'>
            <p className='text-red-600 text-lg'>
              Failed to load restaurants. Please try again later.
            </p>
          </div>
        )}

        {/* No Results */}
        {!isInitialLoading &&
          !error &&
          !(searchQuery.trim() && isSearching) &&
          restaurants.length === 0 && (
            <div className='text-center py-16'>
              <p className='text-gray-600 text-lg'>
                {searchQuery
                  ? 'No restaurants found matching your search.'
                  : 'No recommended restaurants available.'}
              </p>
            </div>
          )}

        {/* Restaurant Grid */}
        {!isInitialLoading &&
          !error &&
          !(searchQuery.trim() && isSearching) &&
          restaurants.length > 0 && (
            <>
              <div className='flex flex-col gap-4 md:grid md:grid-cols-3 md:gap-5 mb-8'>
                {restaurants
                  .slice(
                    0,
                    searchQuery.trim()
                      ? restaurants.length // Show all search results
                      : isMobile
                        ? mobileDisplayCount
                        : restaurants.length
                  )
                  .map((restaurant, index) => (
                    <RestaurantCard
                      key={`${restaurant.id}-${index}`}
                      restaurant={restaurant}
                      userLocation={userLocation}
                    />
                  ))}
              </div>

              {/* Show More Button - Only show when not searching */}
              {!searchQuery.trim() && (
                <ShowMoreButton
                  isExpanded={false}
                  onToggle={onLoadMore}
                  showButton={
                    hasMore &&
                    restaurants.length > 0 &&
                    (!isMobile || mobileDisplayCount < restaurants.length)
                  }
                  expandedText='Show More'
                  collapsedText='Show More'
                  disabled={isLoadingMore}
                  className='py-8'
                />
              )}

              {/* End of results indicator - Only show when not searching */}
              {!searchQuery.trim() && !hasMore && restaurants.length > 0 && (
                <div className='text-center py-8'>
                  <p className='text-gray-500 text-sm'>
                    You've reached the end of the list
                  </p>
                </div>
              )}
            </>
          )}
      </div>
    </div>
  );
};

export default RecommendedSection;
