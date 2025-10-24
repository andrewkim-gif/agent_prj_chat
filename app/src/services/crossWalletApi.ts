// Cross Wallet API service functions matching cross-wallet-desktop implementation
// Based on cross-wallet-desktop's API structure and entity definitions

import type { TokenWithChainInfo } from '@/types/crossWallet'

// API base configuration
const CROSS_WALLET_API_BASE = process.env.NEXT_PUBLIC_CROSS_WALLET_API_URL || 'https://api.crosswallet.app'

// Token info from /token/info endpoint (matches TokenRow entity)
export interface TokenInfo {
  address: string
  name: string
  symbol: string
  decimals: number
  chainId: number
  image?: string
  deployed: boolean
  category?: string
  enabled?: boolean
  required?: boolean
  sortingValue?: number
}

// Token stats from /token/stats endpoint (matches TokenStats entity)
export interface TokenStats {
  address: string
  chainId: number
  price: string
  convertedPrice: string
  percentChange24h: number
  volume24h: string
  marketCap: string
  lastUpdated?: string
}

// API response types
export interface TokenInfoResponse {
  data: TokenInfo[]
  success: boolean
  message?: string
}

export interface TokenStatsResponse {
  data: TokenStats[]
  success: boolean
  message?: string
}

// Error handling
export class CrossWalletApiError extends Error {
  constructor(message: string, public statusCode?: number) {
    super(message)
    this.name = 'CrossWalletApiError'
  }
}

// Generic API call function with error handling
async function apiCall<T>(endpoint: string, options?: RequestInit): Promise<T> {
  try {
    const response = await fetch(`${CROSS_WALLET_API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options?.headers,
      },
      ...options,
    })

    if (!response.ok) {
      throw new CrossWalletApiError(
        `API call failed: ${response.status} ${response.statusText}`,
        response.status
      )
    }

    const data = await response.json()

    if (!data.success) {
      throw new CrossWalletApiError(data.message || 'API call returned error')
    }

    return data
  } catch (error) {
    if (error instanceof CrossWalletApiError) {
      throw error
    }

    // Network or parsing errors
    console.error('Cross Wallet API Error:', error)
    throw new CrossWalletApiError(
      error instanceof Error ? error.message : 'Unknown API error'
    )
  }
}

// Fetch all token information (images, metadata, deployment status)
export async function fetchTokenInfo(chainIds?: number[]): Promise<TokenInfo[]> {
  try {
    const params = new URLSearchParams()

    if (chainIds && chainIds.length > 0) {
      params.append('chainIds', chainIds.join(','))
    }

    const queryString = params.toString()
    const endpoint = `/token/info${queryString ? `?${queryString}` : ''}`

    const response = await apiCall<TokenInfoResponse>(endpoint)
    return response.data || []
  } catch (error) {
    console.error('Failed to fetch token info:', error)
    // Return empty array on error to allow graceful degradation
    return []
  }
}

// Fetch token price statistics
export async function fetchTokenStats(
  currency: string = 'USD',
  chainIds?: number[]
): Promise<TokenStats[]> {
  try {
    const params = new URLSearchParams()
    params.append('currency', currency)

    if (chainIds && chainIds.length > 0) {
      params.append('chainIds', chainIds.join(','))
    }

    const queryString = params.toString()
    const endpoint = `/token/stats?${queryString}`

    const response = await apiCall<TokenStatsResponse>(endpoint)
    return response.data || []
  } catch (error) {
    console.error('Failed to fetch token stats:', error)
    // Return empty array on error to allow graceful degradation
    return []
  }
}

// Merge token info and stats data (following cross-wallet-desktop pattern)
export function mergeTokenData(
  tokenInfo: TokenInfo[],
  tokenStats: TokenStats[],
  currency: string = 'USD'
): TokenWithChainInfo[] {
  const statsMap = new Map<string, TokenStats>()

  // Create lookup map for stats
  tokenStats.forEach(stat => {
    const key = `${stat.address.toLowerCase()}-${stat.chainId}`
    statsMap.set(key, stat)
  })

  return tokenInfo.map(token => {
    const key = `${token.address.toLowerCase()}-${token.chainId}`
    const stats = statsMap.get(key)

    return {
      ...token,
      balance: '0', // Will be updated with user balance
      totalCurrencyPrice: '0', // Will be calculated from balance and price
      currency,
      stats: stats ? {
        price: stats.price,
        convertedPrice: stats.convertedPrice,
        percentChange24h: stats.percentChange24h,
        volume24h: stats.volume24h,
        marketCap: stats.marketCap
      } : {
        price: '0',
        convertedPrice: '0',
        percentChange24h: 0,
        volume24h: '0',
        marketCap: '0'
      },
      chainInfo: {
        chainId: token.chainId,
        name: token.chainId === 1020 ? 'Cross Chain' : 'Ethereum',
        symbol: token.chainId === 1020 ? 'CROSS' : 'ETH',
        rpcUrl: token.chainId === 1020 ? 'https://rpc.crosschain.network' : 'https://eth.llamarpc.com',
        blockExplorerUrl: token.chainId === 1020 ? 'https://scan.crosschain.network' : 'https://etherscan.io',
        nativeCurrency: {
          name: token.chainId === 1020 ? 'Cross' : 'Ethereum',
          symbol: token.chainId === 1020 ? 'CROSS' : 'ETH',
          decimals: 18
        },
        enabled: true,
        testnet: false,
        icon: token.chainId === 1020 ? '/chains/cross.png' : '/chains/ethereum.png'
      }
    }
  })
}

// Fetch complete token data (info + stats) - main function used by components
export async function fetchCompleteTokenData(
  currency: string = 'USD',
  chainIds?: number[]
): Promise<TokenWithChainInfo[]> {
  try {
    // Fetch both token info and stats in parallel
    const [tokenInfo, tokenStats] = await Promise.all([
      fetchTokenInfo(chainIds),
      fetchTokenStats(currency, chainIds)
    ])

    // Merge the data following cross-wallet-desktop pattern
    return mergeTokenData(tokenInfo, tokenStats, currency)
  } catch (error) {
    console.error('Failed to fetch complete token data:', error)

    // Fallback to static data if API fails
    const { getAllTokensWithChainInfo } = await import('@/data/tokenList')
    return getAllTokensWithChainInfo(currency)
  }
}

// Fetch token data for specific tokens by addresses
export async function fetchTokensByAddresses(
  addresses: string[],
  chainIds: number[],
  currency: string = 'USD'
): Promise<TokenWithChainInfo[]> {
  try {
    const params = new URLSearchParams()
    params.append('addresses', addresses.join(','))
    params.append('chainIds', chainIds.join(','))
    params.append('currency', currency)

    const endpoint = `/token/info?${params.toString()}`
    const response = await apiCall<TokenInfoResponse>(endpoint)

    // Also fetch stats for these specific tokens
    const tokenStats = await fetchTokenStats(currency, chainIds)

    return mergeTokenData(response.data || [], tokenStats, currency)
  } catch (error) {
    console.error('Failed to fetch tokens by addresses:', error)
    return []
  }
}

// Helper function to get token image URL
export function getTokenImageUrl(token: TokenInfo | TokenWithChainInfo): string {
  // If server provides image URL, use it
  if (token.image && token.image.startsWith('http')) {
    return token.image
  }

  // If server provides relative path, construct full URL
  if (token.image && token.image.startsWith('/')) {
    return `${CROSS_WALLET_API_BASE}${token.image}`
  }

  // Fallback to local images
  if (token.symbol) {
    return `/tokens/${token.symbol.toLowerCase()}.png`
  }

  return '/tokens/default.png'
}

// Utility function to refresh token data (for periodic updates)
export async function refreshTokenData(
  currentTokens: TokenWithChainInfo[],
  currency: string = 'USD'
): Promise<TokenWithChainInfo[]> {
  const addresses = currentTokens.map(t => t.address)
  const chainIds = [...new Set(currentTokens.map(t => t.chainId))]

  try {
    const updatedStats = await fetchTokenStats(currency, chainIds)

    return currentTokens.map(token => {
      const key = `${token.address.toLowerCase()}-${token.chainId}`
      const updatedStat = updatedStats.find(stat =>
        `${stat.address.toLowerCase()}-${stat.chainId}` === key
      )

      if (updatedStat) {
        return {
          ...token,
          stats: {
            price: updatedStat.price,
            convertedPrice: updatedStat.convertedPrice,
            percentChange24h: updatedStat.percentChange24h,
            volume24h: updatedStat.volume24h,
            marketCap: updatedStat.marketCap
          }
        }
      }

      return token
    })
  } catch (error) {
    console.error('Failed to refresh token data:', error)
    return currentTokens
  }
}

/**
 * Fetch comprehensive token data with crossscan integration
 * This function prioritizes crossscan data for a more complete token list
 */
export async function fetchComprehensiveTokenData(
  currency: string = 'USD',
  includeCrossscan: boolean = true
): Promise<TokenWithChainInfo[]> {
  try {
    if (!includeCrossscan) {
      return fetchCompleteTokenData(currency)
    }

    // Import crossscan integration
    const { getComprehensiveTokenList } = await import('@/services/crossscanApi')
    const { convertToTokenWithChainInfo } = await import('@/data/tokenList')

    // Get comprehensive token list (static + crossscan)
    const comprehensiveTokens = await getComprehensiveTokenList()
    const tokensWithChainInfo = convertToTokenWithChainInfo(comprehensiveTokens, currency)

    // Try to enhance with real API stats if available
    try {
      const tokenStats = await fetchTokenStats(currency, [1020]) // Cross chain only
      if (tokenStats.length > 0) {
        // Merge stats with comprehensive tokens
        const statsMap = new Map<string, TokenStats>()
        tokenStats.forEach(stat => {
          const key = `${stat.address.toLowerCase()}-${stat.chainId}`
          statsMap.set(key, stat)
        })

        return tokensWithChainInfo.map(token => {
          const key = `${token.address.toLowerCase()}-${token.chainId}`
          const stats = statsMap.get(key)

          if (stats) {
            return {
              ...token,
              stats: {
                price: stats.price,
                convertedPrice: stats.convertedPrice,
                percentChange24h: stats.percentChange24h,
                volume24h: stats.volume24h,
                marketCap: stats.marketCap
              }
            }
          }

          return token
        })
      }
    } catch (apiError) {
      console.warn('Failed to enhance with API stats, using base data:', apiError)
    }

    return tokensWithChainInfo
  } catch (error) {
    console.error('Failed to fetch comprehensive token data:', error)

    // Fallback to original function
    return fetchCompleteTokenData(currency)
  }
}