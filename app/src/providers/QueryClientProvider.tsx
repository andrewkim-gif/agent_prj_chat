"use client"

import { QueryClient, QueryClientProvider as TanstackQueryProvider } from '@tanstack/react-query'
import { useState } from 'react'

interface QueryClientProviderProps {
  children: React.ReactNode
}

export function QueryClientProvider({ children }: QueryClientProviderProps) {
  // Create a stable QueryClient instance
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Default stale time for all queries
            staleTime: 5 * 60 * 1000, // 5 minutes
            // Default cache time
            gcTime: 10 * 60 * 1000, // 10 minutes (renamed from cacheTime)
            // Retry configuration
            retry: (failureCount, error) => {
              // Don't retry on 4xx errors
              if (error && typeof error === 'object' && 'status' in error) {
                const status = (error as any).status
                if (status >= 400 && status < 500) return false
              }
              // Retry up to 3 times for other errors
              return failureCount < 3
            },
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
            // Don't refetch on window focus by default (can be overridden per query)
            refetchOnWindowFocus: false,
            // Don't refetch on reconnect by default
            refetchOnReconnect: true,
          },
          mutations: {
            // Default retry for mutations
            retry: 1,
          },
        },
      })
  )

  return (
    <TanstackQueryProvider client={queryClient}>
      {children}
    </TanstackQueryProvider>
  )
}