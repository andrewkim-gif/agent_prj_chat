"use client"

interface CrossscanToken {
  address_hash: string
  name: string
  symbol: string
  type: string // "ERC-20", "ERC-721", "ERC-1155"
  decimals: string | null
  total_supply: string | null
  holders_count: number
  reputation: string
  circulating_market_cap: string | null
  exchange_rate: string | null
  icon_url: string | null
  volume_24h: string | null
}

interface CrossscanResponse {
  items: CrossscanToken[]
  next_page_params: Record<string, unknown>
}

import type { BaseTokenInfo } from '@/data/tokenList'

/**
 * Fetch tokens from crossscan.io API
 */
export async function fetchCrossscanTokens(
  limit: number = 100,
  offset: number = 0,
  network: 'mainnet' | 'testnet' = 'mainnet'
): Promise<CrossscanToken[]> {
  try {
    // Use local API route to avoid CORS issues
    const url = `/api/crossscan/tokens?limit=${limit}&offset=${offset}&network=${network}`

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      // Add timeout and error handling
      signal: AbortSignal.timeout(10000), // 10 second timeout
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch crossscan tokens: ${response.status} ${response.statusText}`)
    }

    const data: CrossscanResponse = await response.json()
    return data.items || []
  } catch (error) {
    console.error('Error fetching crossscan tokens:', error)
    throw error
  }
}

/**
 * Convert crossscan token to BaseTokenInfo format
 */
export function convertCrossscanToBaseToken(
  crossscanToken: CrossscanToken,
  sortingValue: number = 100,
  network: 'mainnet' | 'testnet' = 'mainnet'
): BaseTokenInfo {
  // Network-aware chain ID mapping
  const chainId = network === 'mainnet' ? 4157 : 4158;

  return {
    address: crossscanToken.address_hash,
    name: crossscanToken.name,
    symbol: crossscanToken.symbol,
    decimals: crossscanToken.decimals ? parseInt(crossscanToken.decimals) : 18,
    chainId, // Use network-specific chain ID
    image: crossscanToken.icon_url || `/tokens/${crossscanToken.symbol.toLowerCase()}.png`,
    deployed: true,
    category: getCategoryFromType(crossscanToken.type),
    enabled: true,
    required: false,
    sortingValue
  }
}

/**
 * Get category based on token type
 */
function getCategoryFromType(type: string): string {
  switch (type) {
    case 'ERC-20':
      return 'token'
    case 'ERC-721':
    case 'ERC-1155':
      return 'nft'
    default:
      return 'token'
  }
}

/**
 * Fetch and convert tokens to BaseTokenInfo format
 */
export async function fetchCrossscanTokensAsBaseTokens(
  limit: number = 100,
  onlyERC20: boolean = true,
  network: 'mainnet' | 'testnet' = 'mainnet'
): Promise<BaseTokenInfo[]> {
  try {
    const crossscanTokens = await fetchCrossscanTokens(limit, 0, network)

    // Filter for ERC-20 tokens only if requested
    const filteredTokens = onlyERC20
      ? crossscanTokens.filter(token => token.type === 'ERC-20')
      : crossscanTokens

    // Convert to BaseTokenInfo format
    return filteredTokens.map((token, index) =>
      convertCrossscanToBaseToken(token, 1000 + index, network) // Start sorting values from 1000
    )
  } catch (error) {
    console.error('Failed to fetch and convert crossscan tokens:', error)
    return []
  }
}

/**
 * Get popular tokens (by holder count)
 */
export async function getPopularCrossscanTokens(limit: number = 50): Promise<BaseTokenInfo[]> {
  try {
    const tokens = await fetchCrossscanTokensAsBaseTokens(200, true) // Fetch more to sort

    // Sort by holders count (descending) and take top tokens
    return tokens
      .sort((a, b) => {
        // We'll need to store holders_count somewhere - for now use sorting value
        return b.sortingValue - a.sortingValue
      })
      .slice(0, limit)
  } catch (error) {
    console.error('Failed to get popular crossscan tokens:', error)
    return []
  }
}

/**
 * Search tokens by name or symbol
 */
export async function searchCrossscanTokens(
  query: string,
  limit: number = 50
): Promise<BaseTokenInfo[]> {
  try {
    const tokens = await fetchCrossscanTokensAsBaseTokens(200, true)

    const searchTerm = query.toLowerCase()
    return tokens
      .filter(token =>
        token.name.toLowerCase().includes(searchTerm) ||
        token.symbol.toLowerCase().includes(searchTerm)
      )
      .slice(0, limit)
  } catch (error) {
    console.error('Failed to search crossscan tokens:', error)
    return []
  }
}

/**
 * Merge crossscan tokens with static tokens, giving priority to static tokens
 */
export function mergeCrossscanWithStaticTokens(
  staticTokens: BaseTokenInfo[],
  crossscanTokens: BaseTokenInfo[]
): BaseTokenInfo[] {
  const staticSymbols = new Set(staticTokens.map(token => token.symbol))
  const staticAddresses = new Set(staticTokens.map(token => token.address.toLowerCase()))

  // Filter out crossscan tokens that already exist in static tokens
  const uniqueCrossscanTokens = crossscanTokens.filter(token =>
    !staticSymbols.has(token.symbol) &&
    !staticAddresses.has(token.address.toLowerCase())
  )

  // Combine static tokens (higher priority) with unique crossscan tokens
  return [
    ...staticTokens,
    ...uniqueCrossscanTokens
  ]
}

/**
 * Get comprehensive token list (static + crossscan)
 */
export async function getComprehensiveTokenList(): Promise<BaseTokenInfo[]> {
  try {
    // Import static tokens
    const { CROSS_CHAIN_TOKENS } = await import('@/data/tokenList')

    // Fetch crossscan tokens
    const crossscanTokens = await fetchCrossscanTokensAsBaseTokens(100, true)

    // Merge and return
    return mergeCrossscanWithStaticTokens(CROSS_CHAIN_TOKENS, crossscanTokens)
  } catch (error) {
    console.error('Failed to get comprehensive token list:', error)
    // Fallback to static tokens only
    const { CROSS_CHAIN_TOKENS } = await import('@/data/tokenList')
    return CROSS_CHAIN_TOKENS
  }
}