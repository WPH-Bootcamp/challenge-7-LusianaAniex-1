'use client';

import React, { useMemo, useLayoutEffect, useState, useCallback } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Star, ListFilter } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useGeolocation } from '../../shared/hooks/useGeolocation';
import {
  getRestaurantDistance,
  formatDistance,
} from '../../shared/utils/distance';
import { restaurantsApi } from '../../shared/api/restaurants';
import RestaurantCard from '../../shared/components/RestaurantCard';
import ImageWithFallback from '../../shared/components/ImageWithFallback';
import Footer from '../../shared/components/Footer';
import {
  toggleDistance,
  setPriceMin,
  setPriceMax,
  toggleRating,
  clearFilters,
} from '../../features/filters/store/filtersSlice';
import type { RootState } from '../../app/store';
import type { Restaurant } from '../../shared/types/index';

// ============ CONFIGURATION ============
const DISTANCE_OPTIONS = [
  { key: 'nearby', label: 'Nearby' },
  { key: '1km', label: 'Within 1 km' },
  { key: '3km', label: 'Within 3 km' },
  { key: '5km', label: 'Within 5 km' },
] as const;

const RATING_OPTIONS = [5, 4, 3, 2, 1] as const;

const CATEGORY_TITLES: Record<string, string> = {
  all: 'All Restaurants',
  nearby: 'Nearby Restaurants',
  discount: 'Restaurants with Discounts',
  bestseller: 'Best Seller Restaurants',
  delivery: 'Delivery Restaurants',
  lunch: 'Lunch Restaurants',
};

// ============ UI COMPONENTS ============
interface FilterCheckboxProps {
  checked: boolean;
  onChange: () => void;
  label: string;
  icon?: React.ReactNode;
}

const FilterCheckbox = ({
  checked,
  onChange,
  label,
  icon,
}: FilterCheckboxProps) => (
  <div className='flex items-center gap-2 cursor-pointer' onClick={onChange}>
    <div
      className={`w-5 h-5 rounded-md border-2 flex items-center justify-center ${
        checked ? 'bg-red-600 border-red-600' : 'border-gray-400'
      }`}
    >
      {checked && <div className='w-2 h-2 bg-white rounded-sm'></div>}
    </div>
    {icon && <div className='flex items-center gap-1'>{icon}</div>}
    <span className='text-base text-gray-900'>{label}</span>
  </div>
);

const PriceInput = ({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) => (
  <div className='border border-gray-300 rounded-lg p-2'>
    <div className='flex items-center gap-2'>
      <div className='w-10 h-10 bg-gray-100 rounded flex items-center justify-center'>
        <span className='text-base font-bold text-gray-900'>Rp</span>
      </div>
      <input
        type='number'
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className='flex-1 text-base text-gray-500 outline-none'
      />
    </div>
  </div>
);

// ============ STATE COMPONENTS ============
const LoadingState = ({ withFilters = false }: { withFilters?: boolean }) => (
  <div className='flex justify-center items-center py-16 w-full'>
    <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-red-600'></div>
    {withFilters && <p className='ml-4 text-gray-600'>Applying filters...</p>}
  </div>
);

const ErrorState = () => (
  <div className='text-center py-16 w-full'>
    <p className='text-red-600 text-lg'>Failed to load restaurants</p>
  </div>
);

const EmptyState = () => (
  <div className='text-center py-16 w-full'>
    <p className='text-gray-600 text-lg'>No restaurants found</p>
  </div>
);

// ============ MAIN COMPONENT ============
const CategoryPage: React.FC = () => {
  // ========== HOOKS ==========
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const { latitude, longitude } = useGeolocation();

  // ========== STATE ==========
  const category =
    params?.category && typeof params.category === 'string'
      ? params.category
      : 'all';
  const filters = useSelector((state: RootState) => state.filters);
  const urlFilter = searchParams?.get('filter') || null;

  const [allRestaurants, setAllRestaurants] = useState<Restaurant[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // ========== COMPUTED VALUES ==========
  const hasActiveFilters = useMemo(
    () =>
      filters.distance.length > 0 ||
      !!filters.priceMin ||
      !!filters.priceMax ||
      filters.rating.length > 0,
    [filters]
  );

  // ========== DATA FETCHING ==========
  const {
    data: restaurantsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['restaurants', category, currentPage, latitude, longitude],
    queryFn: async () => {
      const result = await restaurantsApi.getRestaurants({
        page: currentPage,
        limit: 10,
        location:
          latitude && longitude ? `${latitude},${longitude}` : undefined,
      });
      return {
        restaurants: result,
        hasMore: result.length === 10,
      };
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    enabled: hasMore && !hasActiveFilters,
  });

  const { data: filterResults, isLoading: isFilterLoading } = useQuery({
    queryKey: ['restaurants-filter', category, filters, latitude, longitude],
    queryFn: async () => {
      const allFilterResults: Restaurant[] = [];
      for (let page = 1; page <= 5; page++) {
        try {
          const result = await restaurantsApi.getRestaurants({
            page,
            limit: 12,
            location:
              latitude && longitude ? `${latitude},${longitude}` : undefined,
          });
          if (result.length === 0) break;
          allFilterResults.push(...result);
          if (result.length < 12) break;
        } catch {
          break;
        }
      }
      return allFilterResults;
    },
    enabled: hasActiveFilters && !!category,
    staleTime: 10 * 60 * 1000,
  });

  // ========== EFFECTS ==========
  // Scroll to top and reset on category change
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
    setAllRestaurants([]);
    setCurrentPage(1);
    setHasMore(true);
    setIsInitialLoading(true);
  }, [category]);

  // Auto-apply filters from URL
  useLayoutEffect(() => {
    if (urlFilter && category === 'all') {
      dispatch(clearFilters());
      switch (urlFilter) {
        case 'nearby':
          dispatch(toggleDistance('1km'));
          break;
        case 'discount':
          dispatch(setPriceMax('50000'));
          break;
        case 'bestseller':
          dispatch(toggleRating('4'));
          break;
      }
    }
  }, [urlFilter, category, dispatch]);

  // Update restaurants when data arrives
  useLayoutEffect(() => {
    if (hasActiveFilters && filterResults && Array.isArray(filterResults)) {
      setAllRestaurants(filterResults);
      setHasMore(false);
      setIsLoadingMore(false);
      setIsInitialLoading(false);
    } else if (restaurantsData && !hasActiveFilters) {
      if (currentPage === 1) {
        setAllRestaurants(restaurantsData.restaurants);
      } else {
        setAllRestaurants((prev) => {
          const existingIds = new Set(prev.map((r) => r.id));
          const newRestaurants = restaurantsData.restaurants.filter(
            (r) => !existingIds.has(r.id)
          );
          return [...prev, ...newRestaurants];
        });
      }
      setHasMore(restaurantsData.hasMore);
      setIsLoadingMore(false);
      setIsInitialLoading(false);
    }
  }, [restaurantsData, filterResults, currentPage, hasActiveFilters]);

  // ========== FILTERING LOGIC ==========
  const filteredRestaurants = useMemo(() => {
    let filtered = allRestaurants;

    // Apply distance filters
    if (filters.distance.length > 0 && latitude && longitude) {
      filtered = filtered.filter((restaurant) => {
        if (!restaurant.coordinates?.lat || !restaurant.coordinates?.long)
          return false;
        const distance = getRestaurantDistance(restaurant, {
          latitude,
          longitude,
        });
        if (distance === null) return false;

        return filters.distance.some((d) => {
          switch (d) {
            case 'nearby':
            case '1km':
              return distance <= 1;
            case '3km':
              return distance <= 3;
            case '5km':
              return distance <= 5;
            default:
              return true;
          }
        });
      });
    }

    // Apply price filters
    if (filters.priceMin) {
      const minPrice = parseFloat(filters.priceMin);
      filtered = filtered.filter((restaurant) => {
        const restaurantMinPrice = restaurant.priceRange?.min;
        return restaurantMinPrice && restaurantMinPrice >= minPrice;
      });
    }
    if (filters.priceMax) {
      const maxPrice = parseFloat(filters.priceMax);
      filtered = filtered.filter((restaurant) => {
        const restaurantMaxPrice = restaurant.priceRange?.max;
        return restaurantMaxPrice && restaurantMaxPrice <= maxPrice;
      });
    }

    // Apply rating filters
    if (filters.rating.length > 0) {
      filtered = filtered.filter((restaurant) =>
        filters.rating.some((r) => {
          const rating = parseFloat(r);
          const restaurantRating = restaurant.star;
          if (!restaurantRating) return false;

          if (rating === 5) return restaurantRating >= 5.0;
          if (rating === 4)
            return restaurantRating >= 4.0 && restaurantRating < 5.0;
          if (rating === 3)
            return restaurantRating >= 3.0 && restaurantRating < 4.0;
          if (rating === 2)
            return restaurantRating >= 2.0 && restaurantRating < 3.0;
          if (rating === 1)
            return restaurantRating >= 1.0 && restaurantRating < 2.0;
          return false;
        })
      );
    }

    return filtered;
  }, [allRestaurants, filters, latitude, longitude]);

  // ========== HANDLERS ==========
  const loadMore = useCallback(() => {
    if (!isLoadingMore && hasMore && !isLoading) {
      setIsLoadingMore(true);
      setCurrentPage((prev) => prev + 1);
    }
  }, [isLoadingMore, hasMore, isLoading]);

  useLayoutEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 1000
      ) {
        loadMore();
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadMore]);

  const handleDistanceToggle = (distance: string) =>
    dispatch(toggleDistance(distance));
  const handlePriceMinChange = (value: string) => dispatch(setPriceMin(value));
  const handlePriceMaxChange = (value: string) => dispatch(setPriceMax(value));
  const handleRatingToggle = (rating: string) => dispatch(toggleRating(rating));
  const handleClearFilters = () => dispatch(clearFilters());
  const handleRestaurantClick = (restaurantId: string) =>
    router.push(`/restaurants/${restaurantId}`);

  const getCategoryTitle = () => CATEGORY_TITLES[category] || 'All Restaurants';

  // ========== NESTED COMPONENTS ==========
  const MobileRestaurantCard = ({ restaurant }: { restaurant: Restaurant }) => {
    const userLocation = latitude && longitude ? { latitude, longitude } : null;
    const distance = userLocation
      ? getRestaurantDistance(restaurant, userLocation)
      : null;

    return (
      <div
        className='flex flex-row items-center p-3 gap-2 w-full h-[114px] bg-white rounded-2xl shadow-[0px_0px_20px_rgba(203,202,202,0.25)] cursor-pointer hover:shadow-[0px_0px_25px_rgba(203,202,202,0.35)] transition-shadow'
        onClick={() => handleRestaurantClick(restaurant.id.toString())}
      >
        <ImageWithFallback
          src={restaurant.logo || '/images/restaurant-placeholder.jpg'}
          alt={restaurant.name}
          fill
          sizes='90px'
          containerClassName='w-[90px] h-[90px] rounded-xl shrink-0'
          className='object-cover rounded-xl'
          fallbackText='No Logo'
          unoptimized
        />

        <div className='flex flex-col items-start px-0 gap-0.5 flex-1 h-[90px]'>
          <h3 className='font-nunito font-extrabold text-base leading-[30px] text-gray-900 w-full h-[30px]'>
            {restaurant.name}
          </h3>

          <div className='flex flex-row items-center px-0 gap-1 w-full h-7'>
            <Star className='w-6 h-6 text-[#FFAB0D] fill-current' />
            <span className='font-nunito font-medium text-sm leading-7 text-center text-gray-900 w-[21px] h-7'>
              {restaurant.star?.toFixed(1) || 'N/A'}
            </span>
          </div>

          <div className='flex flex-row items-center px-0 gap-1.5 w-full h-7'>
            <span className='font-nunito font-normal text-sm leading-7 tracking-[-0.02em] text-gray-900 shrink-0'>
              {restaurant.place}
            </span>
            <div className='w-0.5 h-0.5 bg-[#0A0D12] rounded-full shrink-0'></div>
            <span className='font-nunito font-normal text-sm leading-7 tracking-[-0.02em] text-gray-900 shrink-0 whitespace-nowrap'>
              {distance ? formatDistance(distance) : 'N/A'}
            </span>
          </div>
        </div>
      </div>
    );
  };

  // ========== RENDER HELPERS ==========
  const showLoading = isInitialLoading || (hasActiveFilters && isFilterLoading);
  const showError = !!error;
  const showEmpty = filteredRestaurants.length === 0 && !showLoading;

  const renderFilterSection = (isMobile = false) => (
    <>
      {/* Distance Filter */}
      <div>
        <h3
          className={
            isMobile
              ? 'font-extrabold text-gray-900 mb-3 text-base'
              : 'font-extrabold text-gray-900 mb-4 text-lg'
          }
        >
          Distance
        </h3>
        <div className={isMobile ? 'space-y-2' : 'space-y-3'}>
          {DISTANCE_OPTIONS.map(({ key, label }) => (
            <div
              key={key}
              className={
                isMobile
                  ? 'flex items-center gap-2 py-1'
                  : 'flex items-center gap-2'
              }
            >
              <FilterCheckbox
                checked={filters.distance.includes(key)}
                onChange={() => handleDistanceToggle(key)}
                label={label}
              />
            </div>
          ))}
        </div>
      </div>

      <div
        className={
          isMobile
            ? 'border-t border-gray-300 my-3'
            : 'border-t border-gray-300 my-6'
        }
      ></div>

      {/* Price Filter */}
      <div>
        <h3
          className={
            isMobile
              ? 'font-extrabold text-gray-900 mb-3 text-base'
              : 'font-extrabold text-gray-900 mb-4 text-lg'
          }
        >
          Price
        </h3>
        <div className='space-y-3'>
          <PriceInput
            value={filters.priceMin}
            onChange={handlePriceMinChange}
            placeholder='Minimum Price'
          />
          <PriceInput
            value={filters.priceMax}
            onChange={handlePriceMaxChange}
            placeholder='Maximum Price'
          />
        </div>
      </div>

      <div
        className={
          isMobile
            ? 'border-t border-gray-300 my-3'
            : 'border-t border-gray-300 my-6'
        }
      ></div>

      {/* Rating Filter */}
      <div>
        <h3
          className={
            isMobile
              ? 'font-extrabold text-gray-900 mb-3 text-base'
              : 'font-extrabold text-gray-900 mb-4 text-lg'
          }
        >
          Rating
        </h3>
        <div className={isMobile ? 'space-y-2' : 'space-y-3'}>
          {RATING_OPTIONS.map((rating) => (
            <div
              key={rating}
              className={
                isMobile
                  ? 'flex items-center gap-2 py-1'
                  : 'flex items-center gap-2 p-2'
              }
            >
              <FilterCheckbox
                checked={filters.rating.includes(rating.toString())}
                onChange={() => handleRatingToggle(rating.toString())}
                label={`${rating}`}
                icon={
                  <Star
                    className={
                      isMobile
                        ? 'w-5 h-5 text-yellow-400 fill-current'
                        : 'w-6 h-6 text-yellow-400 fill-current'
                    }
                  />
                }
              />
            </div>
          ))}
        </div>
      </div>
    </>
  );

  // ========== MAIN RENDER ==========
  return (
    <div className='min-h-screen bg-white pt-20'>
      <div className='max-w-7xl mx-auto px-4 md:px-30 py-4 md:py-8'>
        {/* Mobile Layout */}
        <div className='md:hidden flex flex-col items-start px-0 gap-4 w-full max-w-[361px] mx-auto'>
          <h1 className='font-nunito font-extrabold text-2xl leading-9 text-gray-900 w-full'>
            {getCategoryTitle()}
          </h1>

          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className='flex flex-row justify-between items-center bg-white rounded-xl shadow-[0px_0px_20px_rgba(203,202,202,0.25)] cursor-pointer hover:bg-gray-50 transition-colors w-[361px] h-[52px] p-3'
          >
            <div className='font-nunito font-extrabold text-sm leading-7 text-gray-900'>
              Filter
            </div>
            <ListFilter className='w-5 h-5 text-gray-900' />
          </button>

          <div className='flex flex-col items-start px-0 gap-4 w-full'>
            {showLoading ? (
              <LoadingState withFilters={hasActiveFilters && isFilterLoading} />
            ) : showError ? (
              <ErrorState />
            ) : showEmpty ? (
              <EmptyState />
            ) : (
              <>
                {filteredRestaurants.map((restaurant, index) => (
                  <MobileRestaurantCard
                    key={`${restaurant.id}-${index}`}
                    restaurant={restaurant}
                  />
                ))}

                {isLoadingMore && (
                  <div className='flex justify-center items-center py-8 w-full'>
                    <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-red-600'></div>
                    <span className='ml-3 text-gray-600'>
                      Loading more restaurants...
                    </span>
                  </div>
                )}

                {!hasMore && allRestaurants.length > 0 && (
                  <div className='text-center py-8 w-full'>
                    <p className='text-gray-500 text-sm'>
                      You've reached the end of the list
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Desktop Layout */}
        <div className='hidden md:block'>
          <h1 className='text-3xl font-extrabold text-gray-900 mb-8'>
            {getCategoryTitle()}
          </h1>

          <div className='flex gap-10'>
            {/* Left Sidebar - Filters */}
            <div className='w-64 bg-white rounded-xl shadow-lg p-4'>
              <div className='flex items-center justify-between mb-6'>
                <h2 className='text-lg font-extrabold text-gray-900'>FILTER</h2>
                <button
                  onClick={handleClearFilters}
                  className='text-sm text-red-600 hover:text-red-700 font-medium'
                >
                  Clear All
                </button>
              </div>

              {renderFilterSection(false)}
            </div>

            {/* Right Content - Restaurant Grid */}
            <div className='flex-1'>
              {showLoading ? (
                <LoadingState
                  withFilters={hasActiveFilters && isFilterLoading}
                />
              ) : showError ? (
                <ErrorState />
              ) : showEmpty ? (
                <EmptyState />
              ) : (
                <>
                  <div className='grid grid-cols-2 gap-5'>
                    {filteredRestaurants.map((restaurant, index) => {
                      const userLocation =
                        latitude && longitude ? { latitude, longitude } : null;
                      return (
                        <RestaurantCard
                          key={`${restaurant.id}-${index}`}
                          restaurant={restaurant}
                          userLocation={userLocation}
                        />
                      );
                    })}
                  </div>

                  {isLoadingMore && (
                    <div className='flex justify-center items-center py-8'>
                      <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-red-600'></div>
                      <span className='ml-3 text-gray-600'>
                        Loading more restaurants...
                      </span>
                    </div>
                  )}

                  {!hasMore && allRestaurants.length > 0 && (
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
        </div>
      </div>

      <Footer />

      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <div
          className='fixed inset-0 bg-black bg-opacity-50 z-999999 md:hidden'
          onClick={() => setIsMobileSidebarOpen(false)}
        >
          <div
            className='fixed left-0 top-0 h-full w-72 bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-999999'
            onClick={(e) => e.stopPropagation()}
          >
            <div className='flex items-center p-4 border-b border-gray-200'>
              <h2 className='text-lg font-extrabold text-gray-900'>FILTER</h2>
            </div>

            <button
              onClick={() => setIsMobileSidebarOpen(false)}
              className='absolute flex flex-row justify-center items-center bg-white rounded-full shadow-lg z-999999 left-[306px] top-4 p-2 w-8 h-8'
            >
              <svg
                className='w-4 h-4'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M6 18L18 6M6 6l12 12'
                />
              </svg>
            </button>

            <div className='p-4 space-y-4 overflow-y-auto h-full'>
              <div className='flex justify-end mb-3'>
                <button
                  onClick={handleClearFilters}
                  className='text-sm text-red-600 hover:text-red-700 font-medium'
                >
                  Clear All
                </button>
              </div>

              {renderFilterSection(true)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryPage;
