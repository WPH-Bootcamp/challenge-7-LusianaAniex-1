'use client';

import React, { useState, useMemo, useLayoutEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import AuthModal from '@/shared/components/AuthModal';
import Footer from '@/shared/components/Footer';
import { useQuery } from '@tanstack/react-query';
import { restaurantsApi } from '@/shared/api/restaurants';
import { useCategoriesQuery } from '@/shared/api/queries/categories';
import { useGeolocation } from '@/shared/hooks/useGeolocation';
import { getRestaurantDistance } from '@/shared/utils/distance';
import type { Restaurant } from '@/shared/types';

// Import new components
import HeroSection from './components/HeroSection';
import CategorySection from './components/CategorySection';
import RecommendedSection from './components/RecommendedSection';

const HomePage: React.FC = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [originalMode] = useState<'login' | 'register'>('login');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const router = useRouter();

  // Pagination state
  const [allRestaurants, setAllRestaurants] = useState<Restaurant[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileDisplayCount, setMobileDisplayCount] = useState(5);

  // Get user's location for distance calculation
  const { latitude, longitude, error: locationError } = useGeolocation();

  // Only fetch restaurants when we have location or after a timeout
  const [shouldFetch, setShouldFetch] = useState(false);

  useLayoutEffect(() => {
    // Start fetching after 100ms regardless of location status
    const timer = setTimeout(() => {
      setShouldFetch(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Detect mobile screen size
  useLayoutEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Search restaurants - load multiple pages for comprehensive search
  const { data: searchResults, isLoading: isSearching } = useQuery({
    queryKey: ['restaurants-search', searchQuery, latitude, longitude],
    queryFn: async () => {
      if (!searchQuery.trim()) return [];

      const allSearchResults: Restaurant[] = [];

      // Load multiple pages to get more restaurants for search
      for (let page = 1; page <= 5; page++) {
        try {
          const result = await restaurantsApi.getRestaurants({
            page: page,
            limit: 12, // Use same limit as normal pagination
            location:
              latitude && longitude ? `${latitude},${longitude}` : undefined,
          });

          if (result.length === 0) break; // No more results

          allSearchResults.push(...result);

          // If we got less than 12, we've reached the end
          if (result.length < 12) break;
        } catch {
          break; // Stop on error
        }
      }

      return allSearchResults;
    },
    enabled: !!searchQuery.trim() && shouldFetch,
    staleTime: 5 * 60 * 1000, // 5 minutes cache for search results
  });

  // Fetch restaurants with pagination
  const {
    data: restaurantsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['restaurants', currentPage, latitude, longitude],
    queryFn: async () => {
      // Use getRestaurants with pagination parameters and location
      const result = await restaurantsApi.getRestaurants({
        page: currentPage,
        limit: 12,
        location:
          latitude && longitude ? `${latitude},${longitude}` : undefined,
      });
      return {
        restaurants: result,
        hasMore: result.length === 12, // Assume more if we got exactly 12
      };
    },
    staleTime: 10 * 60 * 1000, // 10 minutes - increased cache time
    gcTime: 15 * 60 * 1000, // 15 minutes - keep in cache longer
    enabled: hasMore && shouldFetch,
  });

  // Update restaurants when new data arrives
  useLayoutEffect(() => {
    if (restaurantsData) {
      if (currentPage === 1) {
        // First page - replace all restaurants
        setAllRestaurants(restaurantsData.restaurants);
        setMobileDisplayCount(5); // Reset mobile display count
      } else {
        // Subsequent pages - append to existing restaurants, avoiding duplicates
        setAllRestaurants((prev) => {
          const existingIds = new Set(prev.map((r) => r.id));
          const newRestaurants = restaurantsData.restaurants.filter(
            (r) => !existingIds.has(r.id)
          );

          // If no new restaurants, it might be because the API returned duplicates
          // In this case, we should still update hasMore to false to stop pagination
          if (newRestaurants.length === 0) {
            // Set hasMore to false to stop pagination
            setHasMore(false);
          }

          return [...prev, ...newRestaurants];
        });
      }
      setHasMore(restaurantsData.hasMore);

      setIsLoadingMore(false);
      setIsInitialLoading(false);
    }
  }, [restaurantsData, currentPage]);

  // Load more restaurants
  const loadMore = useCallback(() => {
    if (!isLoadingMore && hasMore && !isLoading) {
      setIsLoadingMore(true);
      setCurrentPage((prev) => prev + 1);

      // On mobile, increase the display count to show more restaurants
      if (isMobile) {
        setMobileDisplayCount((prev) => prev + 5);
      }
    }
  }, [isLoadingMore, hasMore, isLoading, isMobile]);

  // Fetch categories from API
  const {
    data: categories = [],
    isLoading: categoriesLoading,
    error: categoriesError,
  } = useCategoriesQuery();

  const handleAuthModalClose = () => {
    setIsAuthModalOpen(false);
    setAuthMode(originalMode);
  };

  const handleModeChange = (mode: 'login' | 'register') => {
    setAuthMode(mode);
  };

  const handleAllRestaurantClick = () => {
    router.push('/category/all');
  };

  const handleCategoryClick = (category: {
    name: string;
    filter?: string | null;
  }) => {
    if (category.name === 'All Restaurant') {
      router.push('/category/all');
    } else if (category.filter) {
      // Navigate to /category/all with filter parameter
      const searchParams = new URLSearchParams();
      searchParams.set('filter', category.filter);
      router.push(`/category/all?${searchParams.toString()}`);
    } else {
      setSelectedCategory(category.filter || null);
    }
  };

  const handleFooterCategoryClick = (filter: string) => {
    if (filter === 'all') {
      router.push('/category/all');
    } else {
      router.push(`/category/${filter}`);
    }
  };

  const scrollToCategories = () => {
    const categoriesSection = document.getElementById('categories-section');
    if (categoriesSection) {
      categoriesSection.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  };

  // Filter restaurants based on search query and category
  const filteredRestaurants = useMemo(() => {
    // When searching, use search results; otherwise use paginated restaurants
    if (searchQuery.trim()) {
      if (searchResults && searchResults.length > 0) {
        // Use search results and apply search filter
        return searchResults.filter(
          (restaurant) =>
            restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            restaurant.place.toLowerCase().includes(searchQuery.toLowerCase())
        );
      } else if (!isSearching) {
        // Fallback: search in loaded restaurants if search API didn't return results
        return allRestaurants.filter(
          (restaurant) =>
            restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            restaurant.place.toLowerCase().includes(searchQuery.toLowerCase())
        );
      } else {
        // Still searching, return empty array
        return [];
      }
    }

    // No search query - use normal pagination logic
    let filtered = allRestaurants;

    // Apply category filter (only if a specific category is selected)
    // If selectedCategory is null (All Restaurant), show all restaurants without filtering
    if (selectedCategory) {
      filtered = filtered.filter((restaurant) => {
        switch (selectedCategory) {
          case 'nearby': {
            // Filter by distance - use calculated distance
            const distance = getRestaurantDistance(
              restaurant,
              latitude && longitude ? { latitude, longitude } : null
            );
            if (distance !== null) {
              return distance <= 5; // Within 5km
            }
            // If no distance data available, show restaurant (fallback)
            return true;
          }
          case 'discount':
            // Filter by price range (assuming lower price range indicates discounts)
            return (
              restaurant.priceRange &&
              restaurant.priceRange.min <= 20 &&
              restaurant.priceRange.max <= 50
            );
          case 'bestseller':
            // Filter by high rating (4.5+ stars)
            return restaurant.star && restaurant.star >= 4.5;
          case 'delivery':
            // Filter by delivery availability (assuming all restaurants have delivery)
            return true; // All restaurants have delivery in this case
          case 'lunch':
            // Filter by meal type (this would need more specific data)
            return true; // For now, show all restaurants
          default:
            return true;
        }
      });
    }

    return filtered;
  }, [
    allRestaurants,
    searchResults,
    searchQuery,
    selectedCategory,
    latitude,
    longitude,
    isSearching,
  ]);

  return (
    <div className='font-nunito'>
      {/* Hero Section with Search */}
      <HeroSection searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      {/* Categories Section */}
      <CategorySection
        categories={categories}
        selectedCategory={selectedCategory}
        isLoading={categoriesLoading}
        error={categoriesError}
        onCategoryClick={handleCategoryClick}
      />

      {/* Recommended Restaurants Section */}
      <RecommendedSection
        restaurants={filteredRestaurants}
        categories={categories}
        selectedCategory={selectedCategory}
        searchQuery={searchQuery}
        isInitialLoading={isInitialLoading}
        isSearching={isSearching}
        isLoadingMore={isLoadingMore}
        hasMore={hasMore}
        error={error}
        locationError={locationError ? new Error(locationError) : null}
        userLocation={latitude && longitude ? { latitude, longitude } : null}
        isMobile={isMobile}
        mobileDisplayCount={mobileDisplayCount}
        onAllRestaurantClick={handleAllRestaurantClick}
        onClearFilter={() => setSelectedCategory(null)}
        onLoadMore={loadMore}
      />

      {/* Footer */}
      <Footer
        onCategoryClick={handleFooterCategoryClick}
        onScrollToCategories={scrollToCategories}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={handleAuthModalClose}
        initialMode={authMode}
        onModeChange={handleModeChange}
      />
    </div>
  );
};

export default HomePage;
