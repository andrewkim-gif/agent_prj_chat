// Custom hook for server-based token data management
// Matches cross-wallet-desktop's use-balance.ts pattern for API integration

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  fetchCompleteTokenData,
  fetchComprehensiveTokenData,
  refreshTokenData,
  type TokenInfo,
  type TokenStats
} from '@/services/crossWalletApi'
import type { TokenWithChainInfo } from '@/types/crossWallet'
import Decimal from 'decimal.js'

interface UseServerTokenDataProps {
  currency?: string
  chainIds?: number[]
  refreshInterval?: number // in milliseconds
  enabled?: boolean
}

interface UseServerTokenDataResult {
  // Token data
  serverTokens: TokenWithChainInfo[]
  isLoading: boolean
  isError: boolean
  error: Error | null

  // Actions
  refreshTokens: () => Promise<void>
  refetch: () => void

  // Utilities
  getTokenByAddress: (address: string, chainId: number) => TokenWithChainInfo | undefined
  getTokensByChain: (chainId: number) => TokenWithChainInfo[]
  searchTokens: (query: string) => TokenWithChainInfo[]
}

// Query keys for React Query
const QUERY_KEYS = {
  serverTokens: (currency: string, chainIds?: number[]) => [
    'serverTokens',
    currency,
    chainIds?.join(',') || 'all'
  ] as const,
} as const

export function useServerTokenData({
  currency = 'USD',
  chainIds,
  refreshInterval = 30000, // 30 seconds default
  enabled = true
}: UseServerTokenDataProps = {}): UseServerTokenDataResult {
  const queryClient = useQueryClient()

  // Query for server token data
  const {
    data: serverTokens = [],
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: QUERY_KEYS.serverTokens(currency, chainIds),
    queryFn: () => fetchComprehensiveTokenData(currency, true), // Use crossscan integration
    enabled,
    staleTime: refreshInterval,
    refetchInterval: refreshInterval,
    retry: (failureCount, error) => {
      // Retry up to 3 times for network errors
      if (failureCount >= 3) return false
      return true
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })

  // Manual refresh function
  const refreshTokens = useCallback(async () => {
    try {
      if (serverTokens.length > 0) {
        // Use the refresh function for existing tokens to maintain state
        const refreshedTokens = await refreshTokenData(serverTokens, currency)

        // Update the query cache
        queryClient.setQueryData(
          QUERY_KEYS.serverTokens(currency, chainIds),
          refreshedTokens
        )
      } else {
        // If no tokens, refetch completely
        await refetch()
      }
    } catch (error) {
      console.error('Failed to refresh tokens:', error)
    }
  }, [serverTokens, currency, chainIds, queryClient, refetch])

  // Utility functions
  const getTokenByAddress = useCallback((address: string, chainId: number): TokenWithChainInfo | undefined => {
    return serverTokens.find(token =>
      token.address.toLowerCase() === address.toLowerCase() &&
      token.chainId === chainId
    )
  }, [serverTokens])

  const getTokensByChain = useCallback((chainId: number): TokenWithChainInfo[] => {
    return serverTokens.filter(token => token.chainId === chainId)
  }, [serverTokens])

  const searchTokens = useCallback((query: string): TokenWithChainInfo[] => {
    if (!query.trim()) return serverTokens

    const searchQuery = query.toLowerCase().trim()
    return serverTokens.filter(token =>
      token.name?.toLowerCase().includes(searchQuery) ||
      token.symbol?.toLowerCase().includes(searchQuery) ||
      token.address?.toLowerCase().includes(searchQuery)
    )
  }, [serverTokens])

  return {
    serverTokens,
    isLoading,
    isError,
    error: error as Error | null,
    refreshTokens,
    refetch,
    getTokenByAddress,
    getTokensByChain,
    searchTokens,
  }
}

// Hook for enhanced token data that merges server data with user balances
interface UseEnhancedTokenDataProps extends UseServerTokenDataProps {
  userTokens?: TokenWithChainInfo[]
}

interface UseEnhancedTokenDataResult extends UseServerTokenDataResult {
  enhancedTokens: TokenWithChainInfo[]
  ownedTokens: TokenWithChainInfo[]
  unownedTokens: TokenWithChainInfo[]
  totalValue: string
  formattedTotalValue: string
}

export function useEnhancedTokenData({
  userTokens = [],
  ...serverTokenProps
}: UseEnhancedTokenDataProps = {}): UseEnhancedTokenDataResult {
  const serverData = useServerTokenData(serverTokenProps)
  const { serverTokens } = serverData

  // Merge server data with user balances
  const enhancedTokens = useMemo(() => {
    if (!serverTokens.length) return []

    const userTokenMap = new Map<string, TokenWithChainInfo>()
    userTokens.forEach(userToken => {
      const key = `${userToken.address.toLowerCase()}-${userToken.chainId}`
      userTokenMap.set(key, userToken)
    })

    return serverTokens.map(serverToken => {
      const key = `${serverToken.address.toLowerCase()}-${serverToken.chainId}`
      const userToken = userTokenMap.get(key)

      if (userToken) {
        // Merge server data (images, stats) with user data (balance)
        return {
          ...serverToken,
          balance: userToken.balance || '0',
          totalCurrencyPrice: userToken.totalCurrencyPrice || '0',
          deployed: userToken.deployed ?? serverToken.deployed,
          // Keep server stats as they are more up-to-date
          stats: serverToken.stats
        }
      }

      // Return server token with zero balance
      return {
        ...serverToken,
        balance: '0',
        totalCurrencyPrice: '0'
      }
    })
  }, [serverTokens, userTokens])

  // Filter owned vs unowned tokens
  const { ownedTokens, unownedTokens } = useMemo(() => {
    const owned: TokenWithChainInfo[] = []
    const unowned: TokenWithChainInfo[] = []

    enhancedTokens.forEach(token => {
      if (token.deployed !== false && token.balance && Number(token.balance) > 0) {
        owned.push(token)
      } else {
        unowned.push(token)
      }
    })

    return { ownedTokens: owned, unownedTokens: unowned }
  }, [enhancedTokens])

  // Calculate total portfolio value
  const { totalValue, formattedTotalValue } = useMemo(() => {
    try {
      const total = ownedTokens.reduce((sum, token) => {
        const value = new Decimal(token.totalCurrencyPrice || '0')
        return sum.add(value)
      }, new Decimal(0))

      const totalStr = total.toString()
      const formatted = total.toNumber().toLocaleString('en-US', {
        style: 'currency',
        currency: serverTokenProps.currency || 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })

      return {
        totalValue: totalStr,
        formattedTotalValue: formatted
      }
    } catch (error) {
      console.error('Error calculating total value:', error)
      return {
        totalValue: '0',
        formattedTotalValue: '$0.00'
      }
    }
  }, [ownedTokens, serverTokenProps.currency])

  return {
    ...serverData,
    enhancedTokens,
    ownedTokens,
    unownedTokens,
    totalValue,
    formattedTotalValue
  }
}

// Prefetch tokens for improved performance
export function usePrefetchTokenData(currency: string = 'USD', chainIds?: number[]) {
  const queryClient = useQueryClient()

  const prefetchTokens = useCallback(() => {
    queryClient.prefetchQuery({
      queryKey: QUERY_KEYS.serverTokens(currency, chainIds),
      queryFn: () => fetchCompleteTokenData(currency, chainIds),
      staleTime: 30000, // 30 seconds
    })
  }, [queryClient, currency, chainIds])

  return { prefetchTokens }
}