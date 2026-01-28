/**
 * Providers Component
 * Wraps the application with Redux and React Query providers
 */

'use client';

import React, { useState, type ReactNode } from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { store } from '@/app/store';
import { AuthProvider } from '@/shared/context/AuthContext';

interface ProvidersProps {
  children: ReactNode;
}

/**
 * Providers wrapper component
 * Initializes QueryClient and wraps children with all necessary providers
 */
export function Providers({ children }: ProvidersProps): React.JSX.Element {
  // Create QueryClient instance with configuration
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Default options for all queries
            staleTime: 60 * 1000, // 1 minute
            gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)
            refetchOnWindowFocus: false,
            retry: 1,
          },
          mutations: {
            // Default options for all mutations
            retry: false,
          },
        },
      })
  );

  return (
    <ReduxProvider store={store}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          {children}
          {/* Show React Query DevTools only in development */}
          {process.env.NODE_ENV === 'development' && (
            <ReactQueryDevtools initialIsOpen={false} />
          )}
        </AuthProvider>
      </QueryClientProvider>
    </ReduxProvider>
  );
}
