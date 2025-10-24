"use client"

import { useState, useCallback } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Icon } from '@/components/ui/icon'
import { Separator } from '@/components/ui/separator'
import { useBlockchainWallet } from '@/hooks/useBlockchainWallet'
import { useCrossWallet } from '@/providers/CrossWalletProvider'
import { CompactTokenListWithModal } from './CompactTokenListWithModal'
import { AllTokensList } from './AllTokensList'
import { NftList } from './NftList'
import { getCurrencySymbol } from '@/stores/crossWalletStore'
import { Send, Eye, X } from '@mynaui/icons-react'
import { cn } from '@/lib/utils'
import type { TokenWithChainInfo } from '@/types/crossWallet'

interface UnifiedWalletDashboardProps {
  compact?: boolean
  showActions?: boolean
  className?: string
  onActionClick?: (action: string) => void
  onConnectWallet?: () => void
  onTokenClick?: (token: TokenWithChainInfo) => void
  onSendClick?: (token?: TokenWithChainInfo) => void
}

export function UnifiedWalletDashboard({
  compact = false,
  showActions = true,
  className,
  onActionClick,
  onConnectWallet,
  onTokenClick,
  onSendClick
}: UnifiedWalletDashboardProps) {
  const { wallet, crossAccount, disconnectWallet: disconnectBlockchainWallet } = useBlockchainWallet()
  const {
    isConnected: crossWalletConnected,
    currentAccount,
    formattedTotalAssets,
    totalAssetsValue,
    currency,
    isShowTotalAssets,
    toggleShowTotalAssets,
    isLoadingBalance,
    connectWallet,
    disconnectWallet,
    tokens
  } = useCrossWallet()

  const [showAllTokens, setShowAllTokens] = useState(false)
  const [viewMode, setViewMode] = useState<'tokens' | 'nft'>('tokens') // Tokens tab vs NFT tab
  const currencySymbol = getCurrencySymbol(currency)

  // 지갑 연결 상태 통합 처리
  const isConnected = wallet.isConnected || crossWalletConnected || !!crossAccount?.address
  const walletAddress = currentAccount?.address || crossAccount?.address || wallet.address
  const walletType = currentAccount?.walletType || wallet.type || 'unknown'

  const handleConnect = useCallback(async () => {
    if (onConnectWallet) {
      onConnectWallet()
    } else {
      try {
        await connectWallet()
      } catch (error) {
        console.error('Failed to connect wallet:', error)
      }
    }
  }, [connectWallet, onConnectWallet])

  const handleActionClick = useCallback(async (action: string) => {
    onActionClick?.(action)

    switch (action) {
      case 'send':
        if (onSendClick) {
          onSendClick()
        }
        break
      case 'disconnect':
        // 모든 지갑 연결 해제
        console.log('🔌 Disconnect button clicked - starting wallet disconnection...')
        try {
          console.log('🔌 Disconnecting Cross Wallet...')
          await disconnectWallet() // Cross Wallet 해제

          console.log('🔌 Disconnecting Blockchain Wallet...')
          if (disconnectBlockchainWallet) {
            await disconnectBlockchainWallet() // ARA Chat 기존 지갑 해제
          }

          console.log('✅ All wallets disconnected successfully')

          // 상태 업데이트 강제 트리거 (React state 즉시 갱신)
          window.dispatchEvent(new CustomEvent('wallet-disconnected'))
        } catch (error) {
          console.error('❌ Failed to disconnect wallet:', error)
        }
        break
    }
  }, [onActionClick, onSendClick, disconnectWallet, disconnectBlockchainWallet])

  const handleTokenClick = useCallback((token: TokenWithChainInfo) => {
    if (onTokenClick) {
      onTokenClick(token)
    }
  }, [onTokenClick])

  const handleTokenSend = useCallback((token: TokenWithChainInfo) => {
    if (onSendClick) {
      onSendClick(token)
    }
  }, [onSendClick])

  const copyAddress = async () => {
    if (walletAddress) {
      try {
        await navigator.clipboard.writeText(walletAddress)
        // TODO: Add notification
        console.log('Address copied to clipboard')
      } catch (error) {
        console.error('Failed to copy address:', error)
      }
    }
  }

  // 연결되지 않은 상태
  if (!isConnected) {
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
          <Button onClick={handleConnect} className="w-full">
            <Icon name="credit-card" size={16} className="mr-2 brightness-0 invert" />
            Connect Wallet
          </Button>
        </div>
      </Card>
    )
  }

  // 연결된 상태
  return (
    <Card className={cn("p-4 bg-card text-card-foreground border border-border/40", className)}>
      <div className="space-y-4">
        {/* 지갑 헤더 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Badge className="bg-green-500/10 text-green-600 text-xs">
                  <Icon name="check-circle" size={12} className="mr-1" />
                  Connected
                </Badge>
                {walletType && (
                  <span className="text-xs text-muted-foreground capitalize">
                    {walletType === 'mnemonic' ? 'Cross Wallet' : walletType}
                  </span>
                )}
              </div>

              {/* 주소 표시 */}
              {walletAddress && (
                <div className="flex items-center gap-2 mt-1">
                  <button
                    onClick={copyAddress}
                    className="text-sm font-mono bg-muted px-2 py-1 rounded hover:bg-muted/80 transition-colors"
                  >
                    {`${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`}
                  </button>
                  <Icon
                    name="copy"
                    size={12}
                    className="text-muted-foreground cursor-pointer hover:text-foreground"
                    onClick={copyAddress}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Total Assets 섹션 (Cross Wallet 연결 시에만) */}
        {crossWalletConnected && (
          <>
            <Separator />
            <div className="space-y-3">
              {/* Total Assets 헤더 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">
                    Total Assets {currency}
                  </span>
                  <button
                    type="button"
                    onClick={toggleShowTotalAssets}
                    className="p-0.5 rounded hover:bg-muted/50 transition-colors"
                    aria-label={isShowTotalAssets ? 'Hide assets' : 'Show assets'}
                  >
                    {isShowTotalAssets ? (
                      <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                    ) : (
                      <X className="w-3.5 h-3.5 text-muted-foreground" />
                    )}
                  </button>
                </div>

                {/* Send 버튼 */}
                {showActions && (
                  <Button
                    onClick={() => handleActionClick('send')}
                    size="sm"
                    className="h-8 px-3"
                    disabled={isLoadingBalance || totalAssetsValue === '0'}
                  >
                    <Send className="w-4 h-4 mr-1.5" />
                    Send
                  </Button>
                )}
              </div>

              {/* Total Assets 금액 */}
              <div className="bg-muted/50 rounded-lg p-3">
                <div className="flex items-center justify-center">
                  {isLoadingBalance ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                      <span className="text-sm text-muted-foreground">Loading...</span>
                    </div>
                  ) : (
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground mb-1">Portfolio Value</p>
                      <p className={`font-bold text-primary ${compact ? 'text-xl' : 'text-2xl'}`}>
                        {isShowTotalAssets ? formattedTotalAssets : `${currencySymbol}••••`}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Token List 섹션 */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">
                  {viewMode === 'tokens' ? 'Tokens' : 'NFTs'}
                </h4>
                <div className="flex items-center gap-2">
                  {/* 보기 모드 토글 */}
                  <div className="flex bg-muted rounded-lg p-0.5">
                    <button
                      onClick={() => setViewMode('tokens')}
                      className={cn(
                        'px-2 py-1 text-xs rounded transition-colors',
                        viewMode === 'tokens'
                          ? 'bg-background text-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-foreground'
                      )}
                    >
                      Tokens
                    </button>
                    <button
                      onClick={() => setViewMode('nft')}
                      className={cn(
                        'px-2 py-1 text-xs rounded transition-colors',
                        viewMode === 'nft'
                          ? 'bg-background text-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-foreground'
                      )}
                    >
                      NFT
                    </button>
                  </div>

                  {/* Show All 토글 (토큰 모드에서만) */}
                  {viewMode === 'tokens' && tokens && tokens.length > 3 && !compact && (
                    <button
                      onClick={() => setShowAllTokens(!showAllTokens)}
                      className="text-xs text-primary hover:underline"
                    >
                      {showAllTokens ? 'Collapse' : 'Show All'}
                    </button>
                  )}
                </div>
              </div>

              {/* 조건부 렌더링: 토큰 vs NFT */}
              {viewMode === 'tokens' ? (
                <AllTokensList
                  onSendClick={handleTokenSend}
                  compact={compact}
                  maxItems={showAllTokens ? undefined : (compact ? 5 : 10)}
                  showPercentChange={!compact}
                  showOnlyOwned={false}
                  showSearch={!compact}
                  className="space-y-1"
                />
              ) : (
                <NftList
                  compact={compact}
                  className="space-y-1"
                />
              )}
            </div>
          </>
        )}

        {/* Quick Actions */}
        {showActions && (
          <>
            <Separator />
            <div className="grid grid-cols-2 gap-2">
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
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handleActionClick('disconnect')}
              className="w-full flex items-center gap-2 text-destructive hover:text-destructive"
            >
              <Icon name="x" size={14} />
              Disconnect Wallet
            </Button>
          </>
        )}

        {/* Compact Mode Additional Info */}
        {compact && crossWalletConnected && (
          <div className="text-xs text-muted-foreground text-center">
            {tokens?.filter(t => Number(t.balance) > 0).length || 0} tokens
          </div>
        )}
      </div>
    </Card>
  )
}

export default UnifiedWalletDashboard