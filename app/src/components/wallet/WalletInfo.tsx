// Wallet information display component

"use client"

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Icon } from '@/components/ui/icon'
import { WalletInfo as WalletInfoType, WalletStats } from '@/lib/types/wallet'
import { CrossscanApiService } from '@/lib/services/crossscan-api'
import { CROSS_TOKEN } from '@/config/tokens'

interface WalletInfoProps {
  walletInfo: WalletInfoType
  onDisconnect: () => void
  onRefresh: () => void
  isLoading: boolean
}

export function WalletInfo({ walletInfo, onDisconnect, onRefresh, isLoading }: WalletInfoProps) {
  const [stats, setStats] = useState<WalletStats | null>(null)
  const [isLoadingStats, setIsLoadingStats] = useState(false)

  const loadWalletStats = useCallback(async () => {
    if (!walletInfo.address) return

    setIsLoadingStats(true)
    try {
      const walletStats = await CrossscanApiService.getWalletStats(walletInfo.address)
      setStats(walletStats)
    } catch (error) {
      console.error('Failed to load wallet stats:', error)
    } finally {
      setIsLoadingStats(false)
    }
  }, [walletInfo.address])

  // Load wallet stats on mount
  useEffect(() => {
    loadWalletStats()
  }, [loadWalletStats])

  const refreshStats = async () => {
    if (!walletInfo.address) return

    setIsLoadingStats(true)
    try {
      const walletStats = await CrossscanApiService.getWalletStats(walletInfo.address)
      setStats(walletStats)
    } catch (error) {
      console.error('Failed to load wallet stats:', error)
    } finally {
      setIsLoadingStats(false)
    }
  }

  const formatLastUpdated = (date: Date) => {
    const diffMs = Date.now() - date.getTime()
    const diffMinutes = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMinutes < 1) {
      return 'just now'
    } else if (diffMinutes < 60) {
      return `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`
    } else {
      return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`
    }
  }

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(walletInfo.address)
      // Could add a toast notification here
    } catch (error) {
      console.error('Failed to copy address:', error)
    }
  }

  return (
    <Card className="p-4 bg-card border border-border/40">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Icon name="credit-card" size={18} className="text-primary" />
          <h3 className="font-semibold">Wallet Connected</h3>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            disabled={isLoading}
            className="h-8 w-8 p-0"
          >
            <Icon
              name="refresh"
              size={14}
              className={isLoading ? 'animate-spin' : ''}
            />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDisconnect}
            className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
          >
            <Icon name="x" size={14} />
          </Button>
        </div>
      </div>

      {/* Address */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Address:</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={copyAddress}
            className="h-auto p-1 text-xs font-mono hover:bg-accent"
          >
            {CrossscanApiService.shortenAddress(walletInfo.address)}
            <Icon name="external-link" size={12} className="ml-1" />
          </Button>
        </div>

        {/* Balance */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Balance</span>
            <div className="flex items-center gap-2">
              <img
                src={CROSS_TOKEN.logoUrl}
                alt={CROSS_TOKEN.name}
                className="w-4 h-4 rounded-full"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
              <Badge variant="outline" className="font-mono">
                {parseFloat(walletInfo.balanceFormatted).toFixed(4)} {CROSS_TOKEN.symbol}
              </Badge>
            </div>
          </div>

          {/* Network */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Network</span>
            <Badge variant="secondary" className="text-xs">
              {walletInfo.network || 'CROSS Chain'}
            </Badge>
          </div>
        </div>

        {/* Stats */}
        {stats && !isLoadingStats && (
          <div className="pt-2 border-t border-border/20">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <span className="text-muted-foreground">Transactions</span>
                <div className="font-medium">{stats.totalTransactions}</div>
              </div>
              <div className="space-y-1">
                <span className="text-muted-foreground">Total Value</span>
                <div className="flex items-center gap-1 font-medium font-mono">
                  <img
                    src={CROSS_TOKEN.logoUrl}
                    alt={CROSS_TOKEN.name}
                    className="w-3 h-3 rounded-full"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                  {parseFloat(CrossscanApiService.formatBalance(stats.totalValue)).toFixed(2)} {CROSS_TOKEN.symbol}
                </div>
              </div>
            </div>
          </div>
        )}

        {isLoadingStats && (
          <div className="pt-2 border-t border-border/20">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Icon name="spinner" size={12} className="animate-spin" />
              Loading stats...
            </div>
          </div>
        )}

        {/* Last Updated */}
        <div className="text-xs text-muted-foreground">
          Updated {formatLastUpdated(walletInfo.lastUpdated)}
        </div>
      </div>
    </Card>
  )
}