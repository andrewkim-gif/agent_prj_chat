"use client"

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { Badge } from '@/components/ui/badge'
import { tokenService } from '@/services/tokenService'
import { cn } from '@/lib/utils'

interface PricePoint {
  timestamp: Date
  price: number
  volume: number
}

interface TokenPriceChartProps {
  symbol: string
  className?: string
  height?: number
  showTimeframes?: boolean
  showStats?: boolean
}

type Timeframe = '1h' | '24h' | '7d' | '30d'

export function TokenPriceChart({
  symbol,
  className,
  height = 200,
  showTimeframes = true,
  showStats = true
}: TokenPriceChartProps) {
  const [timeframe, setTimeframe] = useState<Timeframe>('24h')
  const [priceData, setPriceData] = useState<PricePoint[]>([])
  const [currentPrice, setCurrentPrice] = useState<number>(0)
  const [priceChange, setPriceChange] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const [historyData, priceInfo] = await Promise.all([
          tokenService.getHistoricalPrices(symbol, timeframe),
          tokenService.getTokenPriceData(symbol)
        ])

        setPriceData(historyData)
        setCurrentPrice(priceInfo?.price || 0)
        setPriceChange(priceInfo?.change24h || 0)
      } catch (error) {
        console.error('Failed to fetch price data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [symbol, timeframe])

  const formatPrice = (price: number) => {
    if (price < 0.01) return `$${price.toFixed(6)}`
    return `$${price.toFixed(2)}`
  }

  const formatChange = (change: number) => {
    const sign = change >= 0 ? '+' : ''
    return `${sign}${change.toFixed(2)}%`
  }

  const getChangeColor = (change: number) => {
    return change >= 0 ? 'text-green-500' : 'text-red-500'
  }

  const renderSimpleChart = () => {
    if (priceData.length === 0) return null

    const maxPrice = Math.max(...priceData.map(p => p.price))
    const minPrice = Math.min(...priceData.map(p => p.price))
    const priceRange = maxPrice - minPrice

    const points = priceData.map((point, index) => {
      const x = (index / (priceData.length - 1)) * 100
      const y = 100 - ((point.price - minPrice) / priceRange) * 100
      return `${x},${y}`
    }).join(' ')

    const lastPrice = priceData[priceData.length - 1]?.price
    const firstPrice = priceData[0]?.price
    const isPositive = lastPrice >= firstPrice

    return (
      <div className="relative" style={{ height }}>
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="absolute inset-0"
        >
          <defs>
            <linearGradient id={`gradient-${symbol}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop
                offset="0%"
                stopColor={isPositive ? "#10b981" : "#ef4444"}
                stopOpacity="0.3"
              />
              <stop
                offset="100%"
                stopColor={isPositive ? "#10b981" : "#ef4444"}
                stopOpacity="0.05"
              />
            </linearGradient>
          </defs>

          <polyline
            fill="none"
            stroke={isPositive ? "#10b981" : "#ef4444"}
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
            points={points}
          />

          <polygon
            fill={`url(#gradient-${symbol})`}
            points={`0,100 ${points} 100,100`}
          />
        </svg>

        {/* Price points overlay */}
        <div className="absolute inset-0 flex items-end justify-between px-2 pb-2">
          {priceData.length > 0 && (
            <>
              <div className="text-xs text-muted-foreground">
                {formatPrice(minPrice)}
              </div>
              <div className="text-xs text-muted-foreground">
                {formatPrice(maxPrice)}
              </div>
            </>
          )}
        </div>
      </div>
    )
  }

  return (
    <Card className={cn("p-4", className)}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-lg">{symbol}</h3>
            <Badge variant="outline" className="text-xs">
              {timeframe}
            </Badge>
          </div>
          {showStats && (
            <div className="flex items-center gap-4 mt-1">
              <div className="text-2xl font-bold">{formatPrice(currentPrice)}</div>
              <div className={cn("text-sm font-medium", getChangeColor(priceChange))}>
                {formatChange(priceChange)}
              </div>
            </div>
          )}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => window.location.reload()}
          disabled={isLoading}
        >
          <Icon name="refresh" size={16} className={cn(isLoading && "animate-spin")} />
        </Button>
      </div>

      {showTimeframes && (
        <div className="flex gap-2 mb-4">
          {(['1h', '24h', '7d', '30d'] as Timeframe[]).map((tf) => (
            <Button
              key={tf}
              variant={timeframe === tf ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeframe(tf)}
              disabled={isLoading}
            >
              {tf}
            </Button>
          ))}
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center" style={{ height }}>
          <Icon name="spinner" size={32} className="animate-spin text-muted-foreground" />
        </div>
      ) : priceData.length > 0 ? (
        renderSimpleChart()
      ) : (
        <div className="flex items-center justify-center text-muted-foreground" style={{ height }}>
          <div className="text-center">
            <Icon name="chart-bar" size={32} className="mx-auto mb-2" />
            <p>No price data available</p>
          </div>
        </div>
      )}

      {showStats && priceData.length > 0 && (
        <div className="mt-4 pt-4 border-t border-border">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground">High</div>
              <div className="font-medium">
                {formatPrice(Math.max(...priceData.map(p => p.price)))}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground">Low</div>
              <div className="font-medium">
                {formatPrice(Math.min(...priceData.map(p => p.price)))}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground">Volume</div>
              <div className="font-medium">
                ${(priceData.reduce((sum, p) => sum + p.volume, 0) / 1000).toFixed(1)}K
              </div>
            </div>
            <div>
              <div className="text-muted-foreground">Data Points</div>
              <div className="font-medium">{priceData.length}</div>
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}