// Token configuration with logos and metadata
export interface TokenConfig {
  symbol: string
  name: string
  logoUrl: string
  decimals: number
  contractAddress?: string
  isNative?: boolean
  coingeckoId?: string
}

export const TOKEN_CONFIGS: Record<string, TokenConfig> = {
  CROSS: {
    symbol: 'CROSS',
    name: 'Cross Chain',
    logoUrl: 'https://portal-cdn.korbit.co.kr/currencies/icons/ico-coin-cross.png',
    decimals: 18,
    isNative: true,
    coingeckoId: 'cross-chain-protocol'
  },
  BNB: {
    symbol: 'BNB',
    name: 'BNB',
    logoUrl: 'https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png',
    decimals: 18,
    isNative: true,
    coingeckoId: 'binancecoin'
  },
  ETH: {
    symbol: 'ETH',
    name: 'Ethereum',
    logoUrl: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png',
    decimals: 18,
    isNative: true,
    coingeckoId: 'ethereum'
  },
  USDT: {
    symbol: 'USDT',
    name: 'Tether USD',
    logoUrl: 'https://assets.coingecko.com/coins/images/325/small/Tether.png',
    decimals: 6,
    coingeckoId: 'tether'
  },
  USDC: {
    symbol: 'USDC',
    name: 'USD Coin',
    logoUrl: 'https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png',
    decimals: 6,
    coingeckoId: 'usd-coin'
  },
  BTC: {
    symbol: 'BTC',
    name: 'Bitcoin',
    logoUrl: 'https://assets.coingecko.com/coins/images/1/small/bitcoin.png',
    decimals: 8,
    isNative: true,
    coingeckoId: 'bitcoin'
  }
}

// Cross Token specific configuration
export const CROSS_TOKEN = TOKEN_CONFIGS.CROSS

// Helper functions
export function getTokenConfig(symbol: string): TokenConfig | null {
  return TOKEN_CONFIGS[symbol.toUpperCase()] || null
}

export function getTokenLogo(symbol: string): string {
  const config = getTokenConfig(symbol)
  return config?.logoUrl || ''
}

export function getTokenName(symbol: string): string {
  const config = getTokenConfig(symbol)
  return config?.name || symbol
}

export function getAllTokens(): TokenConfig[] {
  return Object.values(TOKEN_CONFIGS)
}

// Network specific token lists
export const CROSS_MAINNET_TOKENS = [
  TOKEN_CONFIGS.CROSS,
  TOKEN_CONFIGS.USDT,
  TOKEN_CONFIGS.USDC
]

export const SUPPORTED_TOKENS = Object.keys(TOKEN_CONFIGS)