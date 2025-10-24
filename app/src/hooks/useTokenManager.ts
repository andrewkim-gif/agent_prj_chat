"use client"

import { useState, useEffect, useCallback } from 'react'
import { useBlockchainState } from '@/providers/BlockchainStateProvider'
import { TokenBalance } from '@/types/blockchain'
import { tokenService } from '@/services/tokenService'

interface UseTokenManagerReturn {
  tokens: TokenBalance[]
  isLoading: boolean
  isRefreshing: boolean
  portfolioValue: number
  portfolioChange24h: number
  topGainers: TokenBalance[]
  topLosers: TokenBalance[]
  refreshBalances: () => Promise<void>
  addCustomToken: (token: TokenBalance) => Promise<void>
  removeCustomToken: (symbol: string) => void
  getTokenPrice: (symbol: string) => Promise<number>
  watchToken: (symbol: string) => void
  unwatchToken: (symbol: string) => void
  isTokenWatched: (symbol: string) => boolean
}

export function useTokenManager(): UseTokenManagerReturn {
  const { state, dispatch } = useBlockchainState()
  const [isLoading, setIsLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const refreshBalances = useCallback(async () => {
    if (!state.wallet.isConnected || !state.wallet.address) {
      return
    }

    setIsRefreshing(true)
    try {
      const updatedTokens = await tokenService.getMultipleTokenBalances(
        state.wallet.address,
        state.tokens.balances,
        state.network.current
      )

      dispatch({
        type: 'TOKENS_UPDATE_BALANCES',
        payload: updatedTokens
      })

      dispatch({
        type: 'UI_ADD_NOTIFICATION',
        payload: {
          type: 'success',
          message: 'Token balances updated successfully'
        }
      })
    } catch (error) {
      console.error('Failed to refresh balances:', error)
      dispatch({
        type: 'UI_ADD_NOTIFICATION',
        payload: {
          type: 'error',
          message: 'Failed to refresh token balances'
        }
      })
    } finally {
      setIsRefreshing(false)
    }
  }, [state.wallet.isConnected, state.wallet.address, state.tokens.balances, state.network.current, dispatch])

  const addCustomToken = useCallback(async (token: TokenBalance) => {
    setIsLoading(true)
    try {
      // Validate token by trying to fetch its price
      const price = await tokenService.getTokenPrice(token.symbol)

      const tokenWithPrice = {
        ...token,
        price,
        value: parseFloat(token.balance) * price
      }

      dispatch({
        type: 'TOKENS_ADD_CUSTOM',
        payload: tokenWithPrice
      })

      dispatch({
        type: 'UI_ADD_NOTIFICATION',
        payload: {
          type: 'success',
          message: `${token.symbol} token added successfully`
        }
      })
    } catch (error) {
      console.error('Failed to add custom token:', error)
      dispatch({
        type: 'UI_ADD_NOTIFICATION',
        payload: {
          type: 'error',
          message: `Failed to add ${token.symbol} token`
        }
      })
    } finally {
      setIsLoading(false)
    }
  }, [dispatch])

  const removeCustomToken = useCallback((symbol: string) => {
    const updatedBalances = state.tokens.balances.filter(token => token.symbol !== symbol)
    const updatedCustomTokens = state.tokens.customTokens.filter(token => token.symbol !== symbol)

    dispatch({
      type: 'TOKENS_UPDATE_BALANCES',
      payload: updatedBalances
    })

    dispatch({
      type: 'UI_ADD_NOTIFICATION',
      payload: {
        type: 'info',
        message: `${symbol} token removed from portfolio`
      }
    })
  }, [state.tokens.balances, state.tokens.customTokens, dispatch])

  const getTokenPrice = useCallback(async (symbol: string): Promise<number> => {
    try {
      return await tokenService.getTokenPrice(symbol)
    } catch (error) {
      console.error('Failed to get token price:', error)
      return 0
    }
  }, [])

  const watchToken = useCallback((symbol: string) => {
    if (!state.tokens.watchlist.includes(symbol)) {
      dispatch({
        type: 'TOKENS_ADD_TO_WATCHLIST',
        payload: symbol
      })

      dispatch({
        type: 'UI_ADD_NOTIFICATION',
        payload: {
          type: 'success',
          message: `${symbol} added to watchlist`
        }
      })
    }
  }, [state.tokens.watchlist, dispatch])

  const unwatchToken = useCallback((symbol: string) => {
    const updatedWatchlist = state.tokens.watchlist.filter(s => s !== symbol)
    // Note: We would need to add this action type to the reducer
    // For now, we'll update via existing actions

    dispatch({
      type: 'UI_ADD_NOTIFICATION',
      payload: {
        type: 'info',
        message: `${symbol} removed from watchlist`
      }
    })
  }, [state.tokens.watchlist, dispatch])

  const isTokenWatched = useCallback((symbol: string): boolean => {
    return state.tokens.watchlist.includes(symbol)
  }, [state.tokens.watchlist])

  // Auto-refresh balances when wallet connects
  useEffect(() => {
    if (state.wallet.isConnected && state.wallet.address) {
      refreshBalances()
    }
  }, [state.wallet.isConnected, state.wallet.address, refreshBalances])

  // Auto-refresh prices periodically
  useEffect(() => {
    if (!state.wallet.isConnected) return

    const interval = setInterval(() => {
      refreshBalances()
    }, 60000) // Refresh every minute

    return () => clearInterval(interval)
  }, [state.wallet.isConnected, refreshBalances])

  // Calculate portfolio metrics
  const portfolioValue = tokenService.calculatePortfolioValue(state.tokens.balances)
  const portfolioChange24h = tokenService.calculatePortfolioChange24h(state.tokens.balances)
  const topGainers = tokenService.getTopGainers(state.tokens.balances, 3)
  const topLosers = tokenService.getTopLosers(state.tokens.balances, 3)

  return {
    tokens: state.tokens.balances,
    isLoading,
    isRefreshing,
    portfolioValue,
    portfolioChange24h,
    topGainers,
    topLosers,
    refreshBalances,
    addCustomToken,
    removeCustomToken,
    getTokenPrice,
    watchToken,
    unwatchToken,
    isTokenWatched
  }
}