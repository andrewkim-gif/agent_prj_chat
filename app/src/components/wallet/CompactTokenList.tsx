"use client"

import { useMemo } from 'react';
import { useCrossWallet } from '@/providers/CrossWalletProvider';
import { CompactTokenListItem } from './CompactTokenListItem';
import { cn } from '@/lib/utils';
import { Icon } from '@/components/ui/icon';
import { useNetworkConfig } from '@/stores/networkStore';
import type { TokenWithChainInfo } from '@/types/crossWallet';

interface CompactTokenListProps {
  className?: string;
  onTokenClick?: (token: TokenWithChainInfo) => void;
  onSendClick?: (token: TokenWithChainInfo) => void;
  showPercentChange?: boolean;
  compact?: boolean;
  maxItems?: number;
  showSendButtons?: boolean;
}

export function CompactTokenList({
  className = '',
  onTokenClick,
  onSendClick,
  showPercentChange = true,
  compact = false,
  maxItems,
  showSendButtons = true
}: CompactTokenListProps) {
  const {
    tokens,
    isLoadingBalance,
    currency,
    isConnected,
  } = useCrossWallet();

  // Network awareness
  const networkConfig = useNetworkConfig();

  // 토큰 목록 필터링 및 정렬 (network-aware)
  const processedTokens = useMemo(() => {
    if (!tokens || tokens.length === 0) return []

    // 필터링: 현재 네트워크의 배포된 토큰이고 잔액이 0보다 큰 토큰만
    const filteredTokens = tokens.filter(token => {
      // 현재 네트워크의 토큰만 표시
      if (networkConfig && token.chainId !== networkConfig.chainId) return false

      // deployed가 false이면 제외
      if (token.deployed === false) return false

      // balance가 0이거나 없으면 제외
      const balance = token.balance || '0'
      const balanceNum = Number(balance)
      if (balanceNum === 0) return false

      return true
    })

    // 정렬: totalCurrencyPrice 기준 내림차순 (가치 높은 순)
    const sortedTokens = [...filteredTokens].sort((a, b) => {
      const aValue = parseFloat(a.totalCurrencyPrice || '0')
      const bValue = parseFloat(b.totalCurrencyPrice || '0')
      return bValue - aValue
    })

    // 최대 표시 개수 제한
    return maxItems ? sortedTokens.slice(0, maxItems) : sortedTokens
  }, [tokens, maxItems, networkConfig])

  const handleTokenClick = (token: TokenWithChainInfo) => {
    if (onTokenClick) {
      onTokenClick(token);
    } else {
      // Default action: show token details in chat
      console.log('Token clicked:', token);
    }
  };

  const handleSendClick = (token: TokenWithChainInfo) => {
    if (onSendClick) {
      onSendClick(token);
    } else {
      // Default action: show send interface
      console.log('Send clicked for token:', token);
    }
  };

  // 연결되지 않은 상태
  if (!isConnected) {
    return (
      <div className={cn('text-center py-6', className)}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
            <Icon name="credit-card" size={24} className="text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">지갑 연결 필요</p>
            <p className="text-xs text-muted-foreground mt-1">
              토큰 목록을 보려면 지갑을 연결해주세요
            </p>
          </div>
        </div>
      </div>
    )
  }

  // 로딩 상태 (cross-wallet-desktop 스타일)
  if (isLoadingBalance) {
    return (
      <div className={cn('space-y-1', className)}>
        {Array.from({ length: maxItems || 5 }).map((_, index) => (
          <div
            key={index}
            className="h-16 px-1 rounded-lg animate-pulse bg-muted/50 flex items-center gap-3"
          >
            <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-muted animate-pulse rounded w-24" />
              <div className="h-3 bg-muted animate-pulse rounded w-16" />
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-muted animate-pulse rounded w-16" />
              <div className="h-3 bg-muted animate-pulse rounded w-12" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  // 처리된 토큰이 없는 상태
  if (processedTokens.length === 0) {
    return (
      <div className={cn('text-center py-8', className)}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
            <Icon name="coins" size={24} className="text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">토큰 없음</p>
            <p className="text-xs text-muted-foreground mt-1">
              보유한 토큰이 없습니다
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('space-y-1', className)}>
      {processedTokens.map((token) => (
        <CompactTokenListItem
          key={`${token.address}-${token.chainId}`}
          token={token}
          onTokenClick={onTokenClick}
          onSendClick={onSendClick}
          showPercentChange={showPercentChange}
          compact={compact}
          showSendButton={showSendButtons}
        />
      ))}
    </div>
  )
}

// Minimal version for very compact displays
export function CompactTokenListMinimal({
  className = '',
  onTokenClick,
  maxItems = 3
}: Pick<CompactTokenListProps, 'className' | 'onTokenClick' | 'maxItems'>) {
  return (
    <CompactTokenList
      className={className}
      onTokenClick={onTokenClick}
      compact={true}
      maxItems={maxItems}
      showPercentChange={false}
      showSendButtons={false}
    />
  );
}

export default CompactTokenList;