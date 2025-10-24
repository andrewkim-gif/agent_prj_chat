"use client"

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { Badge } from '@/components/ui/badge'
import { TokenBalance } from './TokenBalance'
import { useTokenManager } from '@/hooks/useTokenManager'
import { useBlockchainWallet } from '@/hooks/useBlockchainWallet'
import { TokenBalance as TokenBalanceType } from '@/types/blockchain'
import { cn } from '@/lib/utils'

interface TokenPortfolioProps {
  className?: string
  showHeader?: boolean
  showActions?: boolean
  compact?: boolean
}

type ViewMode = 'list' | 'gainers' | 'losers'

export function TokenPortfolio({
  className,
  showHeader = true,
  showActions = true,
  compact = false
}: TokenPortfolioProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [sortBy, setSortBy] = useState<'value' | 'change' | 'symbol'>('value')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const { wallet } = useBlockchainWallet()
  const {
    tokens,
    isLoading,
    isRefreshing,
    portfolioValue,
    portfolioChange24h,
    topGainers,
    topLosers,
    refreshBalances
  } = useTokenManager()

  const formatPortfolioValue = (value: number) => {
    if (value === 0) return '$0.00'
    if (value < 0.01) return '<$0.01'
    if (value >= 1000000) return `$${(value / 1000000).toFixed(2)}M`
    if (value >= 1000) return `$${(value / 1000).toFixed(2)}K`
    return `$${value.toFixed(2)}`
  }

  const formatChange = (change: number) => {
    const sign = change >= 0 ? '+' : ''
    return `${sign}${change.toFixed(2)}%`
  }

  const getChangeColor = (change: number) => {
    return change >= 0 ? 'text-green-500' : 'text-red-500'
  }

  const sortTokens = (tokens: TokenBalanceType[]) => {
    return [...tokens].sort((a, b) => {
      let valueA, valueB

      switch (sortBy) {
        case 'value':
          valueA = a.value || 0
          valueB = b.value || 0
          break
        case 'change':
          valueA = a.change24h || 0
          valueB = b.change24h || 0
          break
        case 'symbol':
          valueA = a.symbol
          valueB = b.symbol
          break
        default:
          valueA = a.value || 0
          valueB = b.value || 0
      }

      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return sortOrder === 'asc' ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA)
      }

      return sortOrder === 'asc' ?
        (valueA as number) - (valueB as number) :
        (valueB as number) - (valueA as number)
    })
  }

  const getDisplayTokens = () => {
    switch (viewMode) {
      case 'gainers':
        return topGainers
      case 'losers':
        return topLosers
      default:
        return sortTokens(tokens.filter(token => parseFloat(token.balance) > 0))
    }
  }

  const handleTokenAction = (action: string, token: TokenBalanceType) => {
    // These would trigger modals or navigation
    console.log(`${action} action for ${token.symbol}`)
  }

  if (!wallet.isConnected) {
    return (
      <Card className={cn("p-6 text-center", className)}>
        <Icon name="credit-card" size={48} className="mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">Connect Your Wallet</h3>
        <p className="text-muted-foreground mb-4">
          Connect your wallet to view your token portfolio and balances
        </p>
      </Card>
    )
  }

  return (
    <div className={cn("space-y-4", className)}>
      {showHeader && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold">Portfolio</h2>
              <p className="text-muted-foreground">Your token holdings and performance</p>
            </div>
            <Button
              variant="outline"
              onClick={refreshBalances}
              disabled={isRefreshing}
              className="gap-2"
            >
              <Icon
                name="refresh"
                size={16}
                className={cn(isRefreshing && "animate-spin")}
              />
              Refresh
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center md:text-left">
              <div className="text-3xl font-bold">{formatPortfolioValue(portfolioValue)}</div>
              <div className="text-sm text-muted-foreground">Total Portfolio Value</div>
            </div>
            <div className="text-center md:text-left">
              <div className={cn("text-2xl font-semibold", getChangeColor(portfolioChange24h))}>
                {formatChange(portfolioChange24h)}
              </div>
              <div className="text-sm text-muted-foreground">24h Change</div>
            </div>
            <div className="text-center md:text-left">
              <div className="text-2xl font-semibold">{tokens.length}</div>
              <div className="text-sm text-muted-foreground">Assets</div>
            </div>
          </div>
        </Card>
      )}

      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              All Assets
            </Button>
            <Button
              variant={viewMode === 'gainers' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('gainers')}
            >
              <Icon name="trending-up" size={16} className="mr-1" />
              Gainers
            </Button>
            <Button
              variant={viewMode === 'losers' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('losers')}
            >
              <Icon name="trending-down" size={16} className="mr-1" />
              Losers
            </Button>
          </div>

          {viewMode === 'list' && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (sortBy === 'value') {
                    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
                  } else {
                    setSortBy('value')
                    setSortOrder('desc')
                  }
                }}
              >
                <Icon name="dollar" size={16} className="mr-1" />
                Value
                {sortBy === 'value' && (
                  <Icon name={sortOrder === 'asc' ? "chevron-up" : "chevron-down"} size={14} className="ml-1" />
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (sortBy === 'change') {
                    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
                  } else {
                    setSortBy('change')
                    setSortOrder('desc')
                  }
                }}
              >
                <Icon name="trending-up" size={16} className="mr-1" />
                Change
                {sortBy === 'change' && (
                  <Icon name={sortOrder === 'asc' ? "chevron-up" : "chevron-down"} size={14} className="ml-1" />
                )}
              </Button>
            </div>
          )}
        </div>

        <div className="space-y-2">
          {isLoading && (
            <div className="text-center py-8">
              <Icon name="spinner" size={32} className="mx-auto mb-2 animate-spin text-muted-foreground" />
              <p className="text-muted-foreground">Loading portfolio...</p>
            </div>
          )}

          {!isLoading && getDisplayTokens().length === 0 && (
            <div className="text-center py-8">
              <Icon name="coins" size={32} className="mx-auto mb-2 text-muted-foreground" />
              <p className="text-muted-foreground">
                {viewMode === 'gainers' && 'No gainers found'}
                {viewMode === 'losers' && 'No losers found'}
                {viewMode === 'list' && 'No tokens found in your portfolio'}
              </p>
            </div>
          )}

          {!isLoading && getDisplayTokens().map((token) => (
            <TokenBalance
              key={token.symbol}
              token={token}
              compact={compact}
              showActions={showActions}
              onSend={(token) => handleTokenAction('send', token)}
              onReceive={(token) => handleTokenAction('receive', token)}
              onSwap={(token) => handleTokenAction('swap', token)}
            />
          ))}
        </div>
      </Card>
    </div>
  )
}