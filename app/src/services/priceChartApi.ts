"use client"

interface PriceDataPoint {
  timestamp: number
  price: number
  volume?: number
}

interface ChartTimeframe {
  label: string
  value: string
  days: number
}

export const CHART_TIMEFRAMES: ChartTimeframe[] = [
  { label: '24H', value: '1D', days: 1 },
  { label: '7D', value: '7D', days: 7 },
  { label: '30D', value: '30D', days: 30 },
  { label: '90D', value: '90D', days: 90 },
  { label: '1Y', value: '1Y', days: 365 }
]

// Mock price data generator for development
function generateMockPriceData(
  basePrice: number,
  days: number,
  symbol: string
): PriceDataPoint[] {
  const data: PriceDataPoint[] = []
  const now = Date.now()
  const intervalMs = (days * 24 * 60 * 60 * 1000) / 100 // 100 data points

  let currentPrice = basePrice
  const volatility = 0.02 // 2% volatility

  for (let i = 0; i < 100; i++) {
    const timestamp = now - (days * 24 * 60 * 60 * 1000) + (i * intervalMs)

    // Add some realistic price movement
    const change = (Math.random() - 0.5) * volatility
    currentPrice = currentPrice * (1 + change)

    // Add some trend based on symbol
    if (symbol === 'CROSS') {
      currentPrice *= 1.0001 // Slight upward trend
    } else if (symbol === 'ZENY') {
      currentPrice *= 0.9999 // Slight downward trend
    }

    data.push({
      timestamp,
      price: Number(currentPrice.toFixed(6)),
      volume: Math.random() * 1000000
    })
  }

  return data
}

export async function fetchTokenPriceHistory(
  _tokenAddress: string, // Prefixed with underscore to indicate intentionally unused
  symbol: string,
  timeframe: string = '7D',
  _currency: string = 'USD' // Prefixed with underscore to indicate intentionally unused
): Promise<PriceDataPoint[]> {
  try {
    // Find the timeframe configuration
    const timeframeConfig = CHART_TIMEFRAMES.find(tf => tf.value === timeframe)
    const days = timeframeConfig?.days || 7

    // For now, we'll use mock data since we don't have a real price history API
    // In production, this would call the actual Cross Wallet price API
    // tokenAddress and currency will be used when implementing real API calls
    const basePrice = getBasePrice(symbol)

    return generateMockPriceData(basePrice, days, symbol)
  } catch (error) {
    console.error('Failed to fetch token price history:', error)
    throw new Error('Failed to fetch price data')
  }
}

function getBasePrice(symbol: string): number {
  // Base prices for different tokens (from our static data)
  const basePrices: Record<string, number> = {
    'CROSS': 0.245,
    'ZENY': 0.00123,
    'MGT': 1.56,
    'ETH': 2500,
    'BTC': 45000,
    'USDT': 1.0,
    'USDC': 1.0
  }

  return basePrices[symbol] || 0.1
}

// Calculate percentage change from price data
export function calculatePriceChange(data: PriceDataPoint[]): {
  change: number
  changePercent: number
  isPositive: boolean
} {
  if (data.length < 2) {
    return { change: 0, changePercent: 0, isPositive: true }
  }

  const firstPrice = data[0].price
  const lastPrice = data[data.length - 1].price
  const change = lastPrice - firstPrice
  const changePercent = (change / firstPrice) * 100

  return {
    change,
    changePercent,
    isPositive: change >= 0
  }
}

// Format price for display
export function formatPrice(price: number, currency: string = 'USD'): string {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: price < 1 ? 6 : 2,
    maximumFractionDigits: price < 1 ? 6 : 2
  })

  return formatter.format(price)
}

// Format volume for display
export function formatVolume(volume: number): string {
  if (volume >= 1e9) {
    return `${(volume / 1e9).toFixed(1)}B`
  } else if (volume >= 1e6) {
    return `${(volume / 1e6).toFixed(1)}M`
  } else if (volume >= 1e3) {
    return `${(volume / 1e3).toFixed(1)}K`
  }
  return volume.toFixed(0)
}

// Technical indicators
export function calculateMovingAverage(data: PriceDataPoint[], period: number): number[] {
  const ma: number[] = []

  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      ma.push(data[i].price)
    } else {
      const sum = data.slice(i - period + 1, i + 1).reduce((acc, point) => acc + point.price, 0)
      ma.push(sum / period)
    }
  }

  return ma
}

export function calculateRSI(data: PriceDataPoint[], period: number = 14): number[] {
  const rsi: number[] = []
  const changes: number[] = []

  // Calculate price changes
  for (let i = 1; i < data.length; i++) {
    changes.push(data[i].price - data[i - 1].price)
  }

  for (let i = 0; i < changes.length; i++) {
    if (i < period - 1) {
      rsi.push(50) // Default RSI value
    } else {
      const gains = changes.slice(i - period + 1, i + 1).filter(change => change > 0)
      const losses = changes.slice(i - period + 1, i + 1).filter(change => change < 0).map(loss => Math.abs(loss))

      const avgGain = gains.length > 0 ? gains.reduce((sum, gain) => sum + gain, 0) / period : 0
      const avgLoss = losses.length > 0 ? losses.reduce((sum, loss) => sum + loss, 0) / period : 0

      if (avgLoss === 0) {
        rsi.push(100)
      } else {
        const rs = avgGain / avgLoss
        const rsiValue = 100 - (100 / (1 + rs))
        rsi.push(rsiValue)
      }
    }
  }

  return rsi
}