"use client"

import { TokenBalance, NetworkInfo } from '@/types/blockchain'
import { getTokenConfig, getTokenLogo, TOKEN_CONFIGS } from '@/config/tokens'

interface PriceData {
  symbol: string
  price: number
  change24h: number
  volume24h: number
  marketCap: number
  lastUpdated: Date
}

interface HistoricalPrice {
  timestamp: Date
  price: number
  volume: number
}

class TokenService {
  private priceCache = new Map<string, PriceData>()
  private priceHistory = new Map<string, HistoricalPrice[]>()
  private refreshInterval: NodeJS.Timeout | null = null

  constructor() {
    this.startPriceUpdates()
  }

  async getTokenPrice(symbol: string, chainId?: number): Promise<number> {
    try {
      const cacheKey = chainId ? `${symbol}_${chainId}` : symbol
      const cached = this.priceCache.get(cacheKey)
      if (cached && this.isCacheValid(cached.lastUpdated)) {
        return cached.price
      }

      // 실제 Cross Wallet SDK API 호출
      let price = 0
      let change24h = 0
      let volume24h = 0
      let marketCap = 0

      if (typeof window !== 'undefined' && window.cross) {
        try {
          // chainId가 있으면 파라미터로 전달
          const priceInfo = chainId
            ? await window.cross.getTokenPrice(symbol, { chainId })
            : await window.cross.getTokenPrice(symbol)
          price = parseFloat(priceInfo.price || '0')
          change24h = parseFloat(priceInfo.percentChange24h || '0')
          volume24h = parseFloat(priceInfo.volume24h || '0')
          marketCap = parseFloat(priceInfo.marketCap || '0')
        } catch (sdkError) {
          console.warn(`Cross Wallet SDK에서 ${symbol} 가격 조회 실패 (chainId: ${chainId}):`, sdkError)
          // SDK 실패 시 기본값 0 사용 (mock 데이터 사용 안 함)
        }
      } else {
        console.warn('Cross Wallet SDK를 사용할 수 없습니다.')
      }

      const priceData: PriceData = {
        symbol,
        price,
        change24h,
        volume24h,
        marketCap,
        lastUpdated: new Date()
      }

      this.priceCache.set(cacheKey, priceData)
      return price
    } catch (error) {
      console.error('Failed to fetch token price:', error)
      return 0
    }
  }

  async getTokenPriceData(symbol: string, chainId?: number): Promise<PriceData | null> {
    try {
      await this.getTokenPrice(symbol, chainId) // Ensure cache is populated
      const cacheKey = chainId ? `${symbol}_${chainId}` : symbol
      return this.priceCache.get(cacheKey) || null
    } catch (error) {
      console.error('Failed to get token price data:', error)
      return null
    }
  }

  async getMultipleTokenPrices(symbols: string[], chainId?: number): Promise<Map<string, number>> {
    const prices = new Map<string, number>()

    await Promise.all(
      symbols.map(async (symbol) => {
        const price = await this.getTokenPrice(symbol, chainId)
        prices.set(symbol, price)
      })
    )

    return prices
  }

  async getTokenBalance(
    address: string,
    tokenAddress: string,
    network: NetworkInfo
  ): Promise<string> {
    try {
      // 실제 Cross Wallet SDK API 호출 - chainId 파라미터 포함
      if (typeof window !== 'undefined' && window.cross) {
        try {
          // network에서 chainId 추출하여 API 호출
          const chainId = network.chainId
          const balances = await window.cross.getBalance(address, { chainId })

          // tokenAddress로 symbol을 찾아서 해당 토큰의 잔액 반환
          const tokens = await window.cross.getTokenList({ chainId })
          const token = tokens.find(t => t.address.toLowerCase() === tokenAddress.toLowerCase())

          if (token && balances[token.symbol]) {
            return balances[token.symbol]
          }
        } catch (sdkError) {
          console.warn(`Cross Wallet SDK에서 잔액 조회 실패 (chainId: ${network.chainId}):`, sdkError)
        }
      } else {
        console.warn('Cross Wallet SDK를 사용할 수 없습니다.')
      }

      return '0'
    } catch (error) {
      console.error('Failed to fetch token balance:', error)
      return '0'
    }
  }

  async getMultipleTokenBalances(
    address: string,
    tokens: TokenBalance[],
    network: NetworkInfo
  ): Promise<TokenBalance[]> {
    try {
      const updatedTokens = await Promise.all(
        tokens.map(async (token) => {
          const balance = await this.getTokenBalance(
            address,
            token.contractAddress || '',
            network
          )
          const price = await this.getTokenPrice(token.symbol, network.chainId)

          return {
            ...token,
            balance,
            price,
            value: parseFloat(balance) * price
          }
        })
      )

      return updatedTokens
    } catch (error) {
      console.error('Failed to fetch multiple token balances:', error)
      return tokens
    }
  }

  async getHistoricalPrices(
    symbol: string,
    timeframe: '1h' | '24h' | '7d' | '30d' = '24h'
  ): Promise<HistoricalPrice[]> {
    try {
      const cached = this.priceHistory.get(`${symbol}_${timeframe}`)
      if (cached && cached.length > 0) {
        return cached
      }

      // Generate mock historical data
      const points = this.getTimeframePoints(timeframe)
      const currentPrice = await this.getTokenPrice(symbol)
      const history: HistoricalPrice[] = []

      for (let i = 0; i < points; i++) {
        const timestamp = new Date(Date.now() - (points - i) * this.getTimeframeInterval(timeframe))
        const priceVariation = 1 + (Math.random() - 0.5) * 0.1 // ±5% variation
        const price = currentPrice * priceVariation
        const volume = Math.random() * 100000

        history.push({ timestamp, price, volume })
      }

      this.priceHistory.set(`${symbol}_${timeframe}`, history)
      return history
    } catch (error) {
      console.error('Failed to get historical prices:', error)
      return []
    }
  }

  calculatePortfolioValue(tokens: TokenBalance[]): number {
    return tokens.reduce((total, token) => {
      const balance = parseFloat(token.balance) || 0
      const price = token.price || 0
      return total + (balance * price)
    }, 0)
  }

  calculatePortfolioChange24h(tokens: TokenBalance[]): number {
    const totalValue = this.calculatePortfolioValue(tokens)
    if (totalValue === 0) return 0

    const change24hValue = tokens.reduce((total, token) => {
      const balance = parseFloat(token.balance) || 0
      const price = token.price || 0
      const change24h = token.change24h || 0
      const tokenValue = balance * price
      return total + (tokenValue * (change24h / 100))
    }, 0)

    return (change24hValue / totalValue) * 100
  }

  getTopGainers(tokens: TokenBalance[], limit: number = 5): TokenBalance[] {
    return tokens
      .filter(token => (token.change24h || 0) > 0)
      .sort((a, b) => (b.change24h || 0) - (a.change24h || 0))
      .slice(0, limit)
  }

  getTopLosers(tokens: TokenBalance[], limit: number = 5): TokenBalance[] {
    return tokens
      .filter(token => (token.change24h || 0) < 0)
      .sort((a, b) => (a.change24h || 0) - (b.change24h || 0))
      .slice(0, limit)
  }


  // Get token logo URL
  getTokenLogo(symbol: string): string {
    return getTokenLogo(symbol)
  }

  // Get token configuration
  getTokenConfig(symbol: string) {
    return getTokenConfig(symbol)
  }

  // Get enhanced token balance with logo
  async getEnhancedTokenBalance(token: TokenBalance): Promise<TokenBalance> {
    const config = getTokenConfig(token.symbol)
    const price = await this.getTokenPrice(token.symbol)

    return {
      ...token,
      logoUrl: config?.logoUrl || token.logoUrl,
      name: config?.name || token.name,
      price,
      value: parseFloat(token.balance) * price
    }
  }

  private isCacheValid(lastUpdated: Date): boolean {
    const now = new Date()
    const cacheAge = now.getTime() - lastUpdated.getTime()
    return cacheAge < 60000 // 1 minute cache
  }

  private getTimeframePoints(timeframe: string): number {
    switch (timeframe) {
      case '1h': return 60
      case '24h': return 24
      case '7d': return 7
      case '30d': return 30
      default: return 24
    }
  }

  private getTimeframeInterval(timeframe: string): number {
    switch (timeframe) {
      case '1h': return 60 * 1000 // 1 minute
      case '24h': return 60 * 60 * 1000 // 1 hour
      case '7d': return 24 * 60 * 60 * 1000 // 1 day
      case '30d': return 24 * 60 * 60 * 1000 // 1 day
      default: return 60 * 60 * 1000
    }
  }

  private startPriceUpdates(): void {
    // Update prices every 30 seconds
    this.refreshInterval = setInterval(() => {
      this.priceCache.clear() // Clear cache to force refresh
    }, 30000)
  }

  destroy(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval)
      this.refreshInterval = null
    }
  }
}

export const tokenService = new TokenService()
export default tokenService