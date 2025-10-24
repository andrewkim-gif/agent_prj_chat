"use client"

import { useState, useEffect, useMemo } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts'
import { Button } from '@/components/ui/button'
import {
  fetchTokenPriceHistory,
  calculatePriceChange,
  formatPrice,
  formatVolume,
  calculateMovingAverage,
  CHART_TIMEFRAMES
} from '@/services/priceChartApi'
import { getCurrencySymbol } from '@/stores/crossWalletStore'
import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown, ChartLine } from '@mynaui/icons-react'

interface TokenPriceChartProps {
  tokenAddress: string
  tokenSymbol: string
  tokenName: string
  currency?: string
  className?: string
}

interface ChartDataPoint {
  timestamp: number
  price: number
  volume?: number
  date: string
  formattedPrice: string
  ma20?: number
  ma50?: number
}

export function TokenPriceChart({
  tokenAddress,
  tokenSymbol,
  tokenName,
  currency = 'USD',
  className = ''
}: TokenPriceChartProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState('7D')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [rawData, setRawData] = useState<any[]>([])
  const [showMA, setShowMA] = useState(false)

  const currencySymbol = getCurrencySymbol(currency)

  // Fetch price data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const priceData = await fetchTokenPriceHistory(
          tokenAddress,
          tokenSymbol,
          selectedTimeframe,
          currency
        )

        setRawData(priceData)
      } catch (err) {
        setError('Failed to load chart data')
        console.error('Chart data error:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [tokenAddress, tokenSymbol, selectedTimeframe, currency])

  // Process chart data
  const chartData = useMemo((): ChartDataPoint[] => {
    if (!rawData || rawData.length === 0) return []

    const ma20 = showMA ? calculateMovingAverage(rawData, 20) : []
    const ma50 = showMA ? calculateMovingAverage(rawData, 50) : []

    return rawData.map((point, index) => ({
      timestamp: point.timestamp,
      price: point.price,
      volume: point.volume,
      date: new Date(point.timestamp).toLocaleDateString(),
      formattedPrice: formatPrice(point.price, currency),
      ...(showMA && ma20.length > index && { ma20: ma20[index] }),
      ...(showMA && ma50.length > index && { ma50: ma50[index] })
    }))
  }, [rawData, currency, showMA])

  // Calculate price change
  const priceChange = useMemo(() => {
    return calculatePriceChange(rawData)
  }, [rawData])

  // Current price (last data point)
  const currentPrice = useMemo(() => {
    if (chartData.length === 0) return 0
    return chartData[chartData.length - 1].price
  }, [chartData])

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm text-muted-foreground">{data.date}</p>
          <p className="font-semibold text-foreground">
            Price: {data.formattedPrice}
          </p>
          {data.volume && (
            <p className="text-sm text-muted-foreground">
              Volume: {formatVolume(data.volume)}
            </p>
          )}
          {data.ma20 && (
            <p className="text-sm text-blue-500">
              MA20: {formatPrice(data.ma20, currency)}
            </p>
          )}
          {data.ma50 && (
            <p className="text-sm text-orange-500">
              MA50: {formatPrice(data.ma50, currency)}
            </p>
          )}
        </div>
      )
    }
    return null
  }

  // Format axis labels
  const formatXAxisLabel = (tickItem: number) => {
    const date = new Date(tickItem)
    const timeframe = CHART_TIMEFRAMES.find(tf => tf.value === selectedTimeframe)

    if (timeframe?.days === 1) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    } else if (timeframe?.days <= 7) {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }
  }

  if (isLoading) {
    return (
      <div className={cn("space-y-4", className)}>
        {/* Header skeleton */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-6 bg-muted animate-pulse rounded w-32" />
            <div className="h-8 bg-muted animate-pulse rounded w-24" />
          </div>
          <div className="flex gap-2">
            {CHART_TIMEFRAMES.map((tf, index) => (
              <div key={index} className="h-8 w-12 bg-muted animate-pulse rounded" />
            ))}
          </div>
        </div>

        {/* Chart skeleton */}
        <div className="h-80 bg-muted animate-pulse rounded-lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="text-center py-8">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
              <ChartLine className="w-6 h-6 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Chart Unavailable</p>
              <p className="text-xs text-muted-foreground mt-1">{error}</p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-foreground">
            {tokenName} ({tokenSymbol})
          </h3>

          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold text-foreground">
              {formatPrice(currentPrice, currency)}
            </span>

            <div className={cn(
              "flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium",
              priceChange.isPositive
                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
            )}>
              {priceChange.isPositive ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              <span>
                {priceChange.isPositive ? '+' : ''}{priceChange.changePercent.toFixed(2)}%
              </span>
            </div>
          </div>
        </div>

        {/* Timeframe Selector */}
        <div className="flex gap-1">
          {CHART_TIMEFRAMES.map((timeframe) => (
            <Button
              key={timeframe.value}
              size="sm"
              variant={selectedTimeframe === timeframe.value ? "default" : "outline"}
              onClick={() => setSelectedTimeframe(timeframe.value)}
              className="text-xs px-3 py-1"
            >
              {timeframe.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Chart Controls */}
      <div className="flex items-center gap-3">
        <Button
          size="sm"
          variant={showMA ? "default" : "outline"}
          onClick={() => setShowMA(!showMA)}
          className="text-xs"
        >
          Moving Averages
        </Button>
      </div>

      {/* Price Chart */}
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <defs>
              <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor={priceChange.isPositive ? "#10b981" : "#ef4444"}
                  stopOpacity={0.3}
                />
                <stop
                  offset="95%"
                  stopColor={priceChange.isPositive ? "#10b981" : "#ef4444"}
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />

            <XAxis
              dataKey="timestamp"
              type="number"
              domain={['dataMin', 'dataMax']}
              tickFormatter={formatXAxisLabel}
              tick={{ fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />

            <YAxis
              domain={['dataMin - dataMin * 0.01', 'dataMax + dataMax * 0.01']}
              tickFormatter={(value) => formatPrice(value, currency)}
              tick={{ fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />

            <Tooltip content={<CustomTooltip />} />

            <Area
              type="monotone"
              dataKey="price"
              stroke={priceChange.isPositive ? "#10b981" : "#ef4444"}
              strokeWidth={2}
              fill="url(#priceGradient)"
            />

            {/* Moving Averages */}
            {showMA && (
              <>
                <Line
                  type="monotone"
                  dataKey="ma20"
                  stroke="#3b82f6"
                  strokeWidth={1}
                  dot={false}
                  strokeDasharray="5 5"
                />
                <Line
                  type="monotone"
                  dataKey="ma50"
                  stroke="#f97316"
                  strokeWidth={1}
                  dot={false}
                  strokeDasharray="5 5"
                />
              </>
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Chart Legend */}
      {showMA && (
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-blue-500 opacity-80" />
            <span className="text-muted-foreground">MA20</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-orange-500 opacity-80" />
            <span className="text-muted-foreground">MA50</span>
          </div>
        </div>
      )}

      {/* Price Summary */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-muted-foreground">Price Change:</span>
          <div className={cn(
            "font-medium",
            priceChange.isPositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
          )}>
            {priceChange.isPositive ? '+' : ''}{currencySymbol}{Math.abs(priceChange.change).toFixed(6)}
          </div>
        </div>

        <div>
          <span className="text-muted-foreground">Timeframe:</span>
          <div className="font-medium text-foreground">
            {CHART_TIMEFRAMES.find(tf => tf.value === selectedTimeframe)?.label}
          </div>
        </div>
      </div>
    </div>
  )
}

export default TokenPriceChart