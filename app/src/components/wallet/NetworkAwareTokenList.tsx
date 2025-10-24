"use client"

import React, { useState, useCallback, useMemo } from 'react';
import { useDisplayTokens, useNetworkTokens, useTokenRefresh } from '@/providers/NetworkTokenProvider';
import { useSimpleCrossWallet } from '@/providers/SimpleCrossWalletProvider';
import { useCurrentNetwork, useNetworkConfig } from '@/stores/networkStore';
import { CompactTokenListItem } from './CompactTokenListItem';
import { TokenDetailModal } from './TokenDetailModal';
import { TokenSearchInput } from './TokenSearchInput';
import { TokenDisplayModeToggle, TokenDisplayModeToggleCompact } from './TokenDisplayModeToggle';
import { cn } from '@/lib/utils';
import { Icon } from '@/components/ui/icon';
import type { TokenWithChainInfo } from '@/types/crossWallet';

interface NetworkAwareTokenListProps {
  className?: string;

  // Display options
  compact?: boolean;
  maxItems?: number;
  showSearch?: boolean;
  showModeToggle?: boolean;
  showRefreshButton?: boolean;
  showPercentChange?: boolean;
  showSendButtons?: boolean;

  // Search options
  searchPlaceholder?: string;

  // Layout options
  togglePosition?: 'top' | 'bottom' | 'none';
  toggleVariant?: 'full' | 'compact' | 'mini';

  // Event handlers
  onTokenClick?: (token: TokenWithChainInfo) => void;
  onSendClick?: (token: TokenWithChainInfo) => void;

  // Auto refresh options
  autoRefreshOnNetworkChange?: boolean;
  refreshInterval?: number;
}

export function NetworkAwareTokenList({
  className = '',
  compact = false,
  maxItems,
  showSearch = true,
  showModeToggle = true,
  showRefreshButton = true,
  showPercentChange = true,
  showSendButtons = true,
  searchPlaceholder = "토큰 검색...",
  togglePosition = 'top',
  toggleVariant = 'full',
  onTokenClick,
  onSendClick,
  autoRefreshOnNetworkChange = true,
  refreshInterval = 30000
}: NetworkAwareTokenListProps) {
  // Local state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedToken, setSelectedToken] = useState<TokenWithChainInfo | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Network token provider
  const { tokens, displayMode, isRefreshing } = useDisplayTokens();
  const { currentChainId, lastRefresh } = useNetworkTokens();
  const { refreshTokens } = useTokenRefresh();

  // Other dependencies
  const { isConnected } = useSimpleCrossWallet();
  const currentNetwork = useCurrentNetwork();
  const networkConfig = useNetworkConfig();

  // Filtered and processed tokens
  const processedTokens = useMemo(() => {
    let filteredTokens = [...tokens];

    // Search filtering
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filteredTokens = filteredTokens.filter(token => {
        return (
          token.name?.toLowerCase().includes(query) ||
          token.symbol?.toLowerCase().includes(query) ||
          token.address?.toLowerCase().includes(query)
        );
      });
    }

    // Sort tokens: owned first, then by name
    filteredTokens.sort((a, b) => {
      const aBalance = parseFloat(a.balance || '0');
      const bBalance = parseFloat(b.balance || '0');

      // Owned tokens first
      if (aBalance > 0 && bBalance === 0) return -1;
      if (aBalance === 0 && bBalance > 0) return 1;

      // If both owned or both not owned, sort by name
      return (a.name || '').localeCompare(b.name || '');
    });

    // Apply max items limit
    if (maxItems && maxItems > 0) {
      filteredTokens = filteredTokens.slice(0, maxItems);
    }

    return filteredTokens;
  }, [tokens, searchQuery, maxItems]);

  // Debug logging - 개발 환경에서만 활성화
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 NetworkAwareTokenList Debug:', {
      isConnected,
      displayMode,
      tokensLength: tokens.length,
      isRefreshing,
      currentChainId,
      processedTokensLength: processedTokens.length
    });
  }

  // Event handlers
  const handleTokenClick = useCallback((token: TokenWithChainInfo) => {
    if (onTokenClick) {
      onTokenClick(token);
    } else {
      // Default action: show token details
      setSelectedToken(token);
      setIsModalOpen(true);
    }
  }, [onTokenClick]);

  const handleSendClick = useCallback((token: TokenWithChainInfo) => {
    if (onSendClick) {
      onSendClick(token);
    } else {
      // Default action: could show send modal or chat message
      console.log('Send clicked for token:', token);
    }
  }, [onSendClick]);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedToken(null);
  }, []);

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
  }, []);

  const handleSearchClear = useCallback(() => {
    setSearchQuery('');
  }, []);

  const handleRefresh = useCallback(() => {
    refreshTokens();
  }, [refreshTokens]);

  // Render mode toggle
  const renderModeToggle = () => {
    if (!showModeToggle || togglePosition === 'none') return null;

    switch (toggleVariant) {
      case 'compact':
        return <TokenDisplayModeToggleCompact showLabels={!compact} />;
      case 'mini':
        return <TokenDisplayModeToggleCompact className="w-fit" />;
      default:
        return <TokenDisplayModeToggle size={compact ? 'sm' : 'md'} />;
    }
  };

  // Render loading state
  if (isRefreshing && tokens.length === 0) {
    return (
      <div className={cn('space-y-3', className)}>
        {/* Mode toggle skeleton */}
        {showModeToggle && togglePosition === 'top' && (
          <div className="h-20 bg-muted/50 animate-pulse rounded-lg" />
        )}

        {/* Search skeleton */}
        {showSearch && (
          <div className="h-10 bg-muted/50 animate-pulse rounded-lg" />
        )}

        {/* Token list skeleton */}
        <div className="space-y-1">
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
      </div>
    );
  }

  // 지갑 연결 상태 확인 제거 - NetworkTokenProvider에서 처리함

  return (
    <div className={cn('space-y-3', className)}>
      {/* Header: Mode toggle + Refresh */}
      {(showModeToggle && togglePosition === 'top') || showRefreshButton ? (
        <div className="flex items-center justify-between gap-2">
          {showModeToggle && togglePosition === 'top' ? renderModeToggle() : <div />}

          {showRefreshButton && (
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className={cn(
                'flex items-center gap-1 px-2 py-1 rounded-md transition-all duration-200',
                'text-xs text-muted-foreground hover:text-foreground',
                'hover:bg-muted/50',
                isRefreshing && 'opacity-50 cursor-not-allowed'
              )}
              title="토큰 목록 새로고침"
            >
              <Icon
                name={isRefreshing ? 'Spinner' : 'RefreshCw'}
                size={14}
                className={cn(isRefreshing && 'animate-spin')}
              />
              <span>새로고침</span>
            </button>
          )}
        </div>
      ) : null}

      {/* Network info */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Icon name={networkConfig?.iconName as any || 'Globe'} size={14} />
        <span>{networkConfig?.displayName || 'Unknown Network'}</span>
        {isRefreshing && (
          <>
            <span>•</span>
            <span>업데이트 중...</span>
          </>
        )}
      </div>

      {/* Search */}
      {showSearch && processedTokens.length > 0 && (
        <TokenSearchInput
          placeholder={searchPlaceholder}
          value={searchQuery}
          onChange={handleSearchChange}
          onClear={handleSearchClear}
          size={compact ? 'sm' : 'md'}
        />
      )}

      {/* Token List */}
      <div className="space-y-1">
        {processedTokens.length === 0 ? (
          <div className="text-center py-8">
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                <Icon
                  name={searchQuery ? "Search" : displayMode === 'owned' ? "CreditCard" : "Coins"}
                  size={24}
                  className="text-muted-foreground"
                />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  {searchQuery
                    ? "검색 결과 없음"
                    : displayMode === 'owned'
                    ? !isConnected
                      ? "지갑 연결 필요"
                      : "보유한 토큰 없음"
                    : "지원하는 토큰 없음"
                  }
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {searchQuery
                    ? `"${searchQuery}"에 대한 검색 결과가 없습니다`
                    : displayMode === 'owned'
                    ? !isConnected
                      ? "보유 토큰을 보려면 지갑을 연결해주세요"
                      : "아직 보유한 토큰이 없습니다"
                    : "이 네트워크에서 지원하는 토큰이 없습니다"
                  }
                </p>
              </div>
              {searchQuery && (
                <button
                  onClick={handleSearchClear}
                  className="text-xs text-primary hover:underline"
                >
                  검색 초기화
                </button>
              )}
            </div>
          </div>
        ) : (
          processedTokens.map((token) => (
            <CompactTokenListItem
              key={`${token.address}-${token.chainId}`}
              token={token}
              onTokenClick={handleTokenClick}
              onSendClick={handleSendClick}
              showPercentChange={showPercentChange}
              compact={compact}
              showSendButton={showSendButtons && displayMode === 'owned'} // 보유 토큰 모드일 때만 송금 버튼
            />
          ))
        )}
      </div>

      {/* Search results info */}
      {showSearch && searchQuery && processedTokens.length > 0 && (
        <div className="text-xs text-muted-foreground text-center">
          &quot;{searchQuery}&quot;에 대한 {processedTokens.length}개 결과
        </div>
      )}

      {/* Footer: Mode toggle */}
      {showModeToggle && togglePosition === 'bottom' && renderModeToggle()}

      {/* Token Detail Modal */}
      <TokenDetailModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        token={selectedToken}
        onSendClick={handleSendClick}
      />
    </div>
  );
}

// Compact version for sidebar
export function NetworkAwareTokenListCompact({
  className = '',
  maxItems = 5,
  onTokenClick,
  onSendClick
}: Pick<NetworkAwareTokenListProps, 'className' | 'maxItems' | 'onTokenClick' | 'onSendClick'>) {
  return (
    <NetworkAwareTokenList
      className={className}
      compact={true}
      maxItems={maxItems}
      showSearch={false}
      showModeToggle={true}
      showRefreshButton={false}
      showPercentChange={false}
      showSendButtons={true}
      togglePosition="top"
      toggleVariant="compact"
      onTokenClick={onTokenClick}
      onSendClick={onSendClick}
    />
  );
}

// Minimal version for very compact spaces
export function NetworkAwareTokenListMinimal({
  className = '',
  maxItems = 3,
  onTokenClick
}: Pick<NetworkAwareTokenListProps, 'className' | 'maxItems' | 'onTokenClick'>) {
  return (
    <NetworkAwareTokenList
      className={className}
      compact={true}
      maxItems={maxItems}
      showSearch={false}
      showModeToggle={false}
      showRefreshButton={false}
      showPercentChange={false}
      showSendButtons={false}
      togglePosition="none"
      onTokenClick={onTokenClick}
    />
  );
}

export default NetworkAwareTokenList;