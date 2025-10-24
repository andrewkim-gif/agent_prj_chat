"use client"

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Icon } from '@/components/ui/icon'
import { Separator } from '@/components/ui/separator'
import { WalletDashboardProps } from '@/types/blockchain'
import { useBlockchainState, useWalletState, useTokenBalances, useNetworkState } from '@/providers/BlockchainStateProvider'
import { NetworkWarningBanner } from '@/components/network/NetworkWarningBanner'
import { NetworkStatusIndicator } from '@/components/network/NetworkStatusIndicator'
import { NetworkSelector } from '@/components/network/NetworkSelector'
import { useNetworkConfig, useIsTestnet } from '@/stores/networkStore'
import { cn } from '@/lib/utils'

export function WalletDashboard({
  compact = false,
  showActions = true,
  className,
  onActionClick,
  onConnectWallet
}: WalletDashboardProps) {
  const { dispatch } = useBlockchainState()
  const wallet = useWalletState()
  const tokens = useTokenBalances()
  const network = useNetworkState()
  const [showAllTokens, setShowAllTokens] = useState(false)

  // Network awareness
  const networkConfig = useNetworkConfig()
  const isTestnet = useIsTestnet()

  // Calculate total portfolio value
  const totalValue = tokens.reduce((sum, token) => sum + (token.value || 0), 0)

  // Filter tokens to show (non-zero balances first)
  const visibleTokens = tokens
    .filter(token => compact ? parseFloat(token.balance) > 0 : true)
    .slice(0, showAllTokens || compact ? undefined : 3)

  const handleActionClick = (action: string) => {
    onActionClick?.(action)

    // Dispatch UI actions
    switch (action) {
      case 'send':
        dispatch({ type: 'UI_SET_MODAL', payload: 'transaction-builder' })
        break
      case 'receive':
        dispatch({ type: 'UI_SET_MODAL', payload: 'receive-address' })
        break
      case 'history':
        dispatch({ type: 'UI_SET_MODAL', payload: 'transaction-history' })
        break
      case 'disconnect':
        dispatch({ type: 'WALLET_DISCONNECT' })
        dispatch({
          type: 'UI_ADD_NOTIFICATION',
          payload: { type: 'info', message: 'Wallet has been disconnected.' }
        })
        break
    }
  }

  const copyAddress = async () => {
    if (wallet.address) {
      try {
        await navigator.clipboard.writeText(wallet.address)
        dispatch({
          type: 'UI_ADD_NOTIFICATION',
          payload: { type: 'success', message: 'Address copied to clipboard.' }
        })
      } catch (error) {
        dispatch({
          type: 'UI_ADD_NOTIFICATION',
          payload: { type: 'error', message: 'Failed to copy address.' }
        })
      }
    }
  }

  if (!wallet.isConnected) {
    return (
      <Card className={cn("p-4 bg-card text-card-foreground border border-border/40", className)}>
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-muted mx-auto flex items-center justify-center">
            <Icon name="credit-card" size={24} className="text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Wallet Connection Required</h3>
            <p className="text-sm text-muted-foreground">
              Please connect your wallet to use blockchain features
            </p>
          </div>
          <Button
            onClick={() => {
              if (onConnectWallet) {
                onConnectWallet()
              } else {
                dispatch({ type: 'UI_SET_MODAL', payload: 'wallet-selector' })
              }
            }}
            className="w-full"
          >
            <Icon name="credit-card" size={16} className="mr-2 brightness-0 invert" />
            Connect Wallet
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <Card className={cn("p-4 bg-card text-card-foreground border border-border/40", className)}>
      {/* Network Warning */}
      {isTestnet && (
        <div className="mb-4">
          <NetworkWarningBanner showSwitchButton={true} />
        </div>
      )}

      {/* Wallet Header */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Wallet Type Icon */}
            {/* <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              {wallet.type === 'metamask' && (
                <Icon name="robot" size={20} className="text-orange-500" />
              )}
              {wallet.type === 'cross' && (
                <Icon name="zap" size={20} className="text-primary" />
              )}
              {wallet.type === 'walletconnect' && (
                <Icon name="qr-code" size={20} className="text-blue-500" />
              )}
              {(wallet.type === 'hardware' || !wallet.type) && (
                <Icon name="credit-card" size={20} className="text-gray-600" />
              )}
            </div> */}

            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Badge className="bg-green-500/10 text-green-600 text-xs">
                  <Icon name="check-circle" size={12} className="mr-1" />
                  Connected
                </Badge>
                {wallet.type && (
                  <span className="text-xs text-muted-foreground capitalize">
                    {wallet.type}
                  </span>
                )}
              </div>

              {/* Address Display */}
              <div className="flex items-center gap-2 mt-1">
                <button
                  onClick={copyAddress}
                  className="text-sm font-mono bg-muted px-2 py-1 rounded hover:bg-muted/80 transition-colors"
                >
                  {wallet.ensName || (wallet.address && `${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}`)}
                </button>
                <Icon name="copy" size={12} className="text-muted-foreground cursor-pointer hover:text-foreground" onClick={copyAddress} />
              </div>
            </div>
          </div>

          {/* Network Selector */}
          <div className="text-right">
            <NetworkSelector variant="compact" />
          </div>
        </div>

        {/* Total Portfolio Value */}
        {!compact && totalValue > 0 && (
          <div className="bg-muted/50 rounded-lg p-3">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Total Portfolio Value</p>
              <p className="text-2xl font-bold text-primary">
                ${totalValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        )}

        {/* Token Balances */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Token Balance</h4>
            {tokens.filter(t => parseFloat(t.balance) > 0).length > 3 && !compact && (
              <button
                onClick={() => setShowAllTokens(!showAllTokens)}
                className="text-xs text-primary hover:underline"
              >
                {showAllTokens ? 'Collapse' : 'Show All'}
              </button>
            )}
          </div>

          <div className="space-y-2">
            {visibleTokens.map((token) => {
              const balance = parseFloat(token.balance)
              const hasBalance = balance > 0

              return (
                <div
                  key={token.symbol}
                  className={`flex items-center justify-between p-2 rounded-lg transition-colors ${
                    hasBalance ? 'bg-muted/50' : 'opacity-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-xs font-bold text-primary">
                        {token.symbol.slice(0, 2)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">{token.symbol}</p>
                      {!compact && (
                        <p className="text-xs text-muted-foreground">{token.name}</p>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {balance.toLocaleString(undefined, { maximumFractionDigits: 4 })}
                    </p>
                    {token.value && token.value > 0 && !compact && (
                      <p className="text-xs text-muted-foreground">
                        ${token.value.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {tokens.filter(t => parseFloat(t.balance) > 0).length === 0 && (
            <div className="text-center py-4 text-muted-foreground">
              <Icon name="coins" size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">No token balance</p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        {showActions && (
          <>
            <Separator />
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleActionClick('send')}
                className="flex items-center gap-2"
              >
                <Icon name="arrow-right" size={14} />
                Send
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleActionClick('receive')}
                className="flex items-center gap-2"
              >
                <Icon name="arrow-left" size={14} />
                Receive
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleActionClick('history')}
                className="flex items-center gap-2"
              >
                <Icon name="clock-two" size={14} />
                History
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleActionClick('disconnect')}
                className="flex items-center gap-2 text-destructive hover:text-destructive"
              >
                <Icon name="x" size={14} />
                Disconnect
              </Button>
            </div>
          </>
        )}

        {/* Compact Mode Additional Info */}
        {compact && (
          <div className="text-xs text-muted-foreground text-center">
            {networkConfig?.displayName} • {tokens.filter(t => parseFloat(t.balance) > 0).length} tokens
          </div>
        )}
      </div>
    </Card>
  )
}