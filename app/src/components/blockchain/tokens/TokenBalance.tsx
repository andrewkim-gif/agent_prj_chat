"use client"

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { Badge } from '@/components/ui/badge'
import { TokenBalance as TokenBalanceType } from '@/types/blockchain'
import { cn } from '@/lib/utils'

interface TokenBalanceProps {
  token: TokenBalanceType
  onSend?: (token: TokenBalanceType) => void
  onReceive?: (token: TokenBalanceType) => void
  onSwap?: (token: TokenBalanceType) => void
  showActions?: boolean
  compact?: boolean
  className?: string
}

export function TokenBalance({
  token,
  onSend,
  onReceive,
  onSwap,
  showActions = true,
  compact = false,
  className
}: TokenBalanceProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const formatBalance = (balance: string) => {
    const num = parseFloat(balance)
    if (num === 0) return '0'
    if (num < 0.001) return '<0.001'
    if (num < 1) return num.toFixed(6)
    if (num < 1000) return num.toFixed(3)
    if (num < 1000000) return `${(num / 1000).toFixed(1)}K`
    return `${(num / 1000000).toFixed(1)}M`
  }

  const formatValue = (value?: number) => {
    if (!value || value === 0) return '$0.00'
    if (value < 0.01) return '<$0.01'
    return `$${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
  }

  const formatPrice = (price?: number) => {
    if (!price || price === 0) return '$0.00'
    if (price < 0.01) return `$${price.toFixed(6)}`
    return `$${price.toFixed(2)}`
  }

  const formatChange = (change?: number) => {
    if (!change) return '+0.00%'
    const sign = change >= 0 ? '+' : ''
    return `${sign}${change.toFixed(2)}%`
  }

  const getChangeColor = (change?: number) => {
    if (!change) return 'text-muted-foreground'
    return change >= 0 ? 'text-green-500' : 'text-red-500'
  }

  if (compact) {
    return (
      <div className={cn("flex items-center justify-between p-3 hover:bg-muted/50 rounded-lg transition-colors", className)}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            {token.logoUrl ? (
              <img src={token.logoUrl} alt={token.symbol} className="w-6 h-6" />
            ) : (
              <Icon name="coins" size={16} className="text-primary" />
            )}
          </div>
          <div>
            <div className="font-medium text-sm">{token.symbol}</div>
            <div className="text-xs text-muted-foreground">{formatBalance(token.balance)}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm font-medium">{formatValue(token.value)}</div>
          <div className={cn("text-xs", getChangeColor(token.change24h))}>
            {formatChange(token.change24h)}
          </div>
        </div>
      </div>
    )
  }

  return (
    <Card className={cn("p-4", className)}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            {token.logoUrl ? (
              <img src={token.logoUrl} alt={token.symbol} className="w-8 h-8" />
            ) : (
              <Icon name="coins" size={24} className="text-primary" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-lg">{token.symbol}</h3>
              <Badge variant="outline" className="text-xs">
                {token.name}
              </Badge>
            </div>
            <div className="text-sm text-muted-foreground">
              Balance: {formatBalance(token.balance)}
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className="font-semibold text-lg">{formatValue(token.value)}</div>
          <div className="text-sm text-muted-foreground">{formatPrice(token.price)}</div>
          <div className={cn("text-sm font-medium", getChangeColor(token.change24h))}>
            {formatChange(token.change24h)}
          </div>
        </div>
      </div>

      {showActions && (
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSend?.(token)}
              className="flex-1"
            >
              <Icon name="arrow-right" size={16} className="mr-2" />
              Send
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onReceive?.(token)}
              className="flex-1"
            >
              <Icon name="arrow-left" size={16} className="mr-2" />
              Receive
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSwap?.(token)}
              className="flex-1"
            >
              <Icon name="arrow-up-down" size={16} className="mr-2" />
              Swap
            </Button>
          </div>
        </div>
      )}

      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-border space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Contract Address:</span>
            <span className="font-mono text-xs">
              {token.contractAddress ?
                `${token.contractAddress.slice(0, 6)}...${token.contractAddress.slice(-4)}` :
                'Native Token'
              }
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Decimals:</span>
            <span>{token.decimals}</span>
          </div>
          {token.value && token.value > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Portfolio %:</span>
              <span>2.5%</span> {/* This would be calculated from total portfolio */}
            </div>
          )}
        </div>
      )}

      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full mt-2 text-xs text-muted-foreground"
      >
        {isExpanded ? 'Show Less' : 'Show More'}
        <Icon name={isExpanded ? "chevron-up" : "chevron-down"} size={14} className="ml-1" />
      </Button>
    </Card>
  )
}