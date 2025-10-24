"use client"

import { useState, useCallback, useMemo, useEffect, memo } from 'react';
import { useCrossWallet } from '@/providers/CrossWalletProvider';
import { CompactTokenListItem } from './CompactTokenListItem';
import { TokenSearchInput } from './TokenSearchInput';
import { TokenDetailModal } from './TokenDetailModal';
import { cn } from '@/lib/utils';
import { Icon } from '@/components/ui/icon';
import type { TokenWithChainInfo } from '@/types/crossWallet';

interface CompactTokenListWithSearchProps {
  className?: string;
  onSendClick?: (token: TokenWithChainInfo) => void;
  showPercentChange?: boolean;
  compact?: boolean;
  maxItems?: number;
  showSendButtons?: boolean;
  showSearch?: boolean;
  searchPlaceholder?: string;
}

const CompactTokenListWithSearchComponent = function CompactTokenListWithSearch({
  className = '',
  onSendClick,
  showPercentChange = true,
  compact = false,
  maxItems,
  showSendButtons = true,
  showSearch = true,
  searchPlaceholder = "Search tokens..."
}: CompactTokenListWithSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [selectedToken, setSelectedToken] = useState<TokenWithChainInfo | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 검색어 디바운싱 (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const {
    tokens,
    isLoadingBalance,
    currency,
    isConnected,
  } = useCrossWallet();

  // 검색 및 필터링된 토큰 목록
  const processedTokens = useMemo(() => {
    if (!tokens || tokens.length === 0) return []

    // 1. 기본 필터링: 배포된 토큰이고 잔액이 0보다 큰 토큰만
    const filteredTokens = tokens.filter(token => {
      // deployed가 false이면 제외
      if (token.deployed === false) return false

      // balance가 0이거나 없으면 제외
      const balance = token.balance || '0'
      const balanceNum = Number(balance)
      if (balanceNum === 0) return false

      return true
    })

    // 2. 검색 필터링 (디바운싱된 검색어 사용)
    const searchFiltered = debouncedSearchQuery.trim()
      ? filteredTokens.filter(token => {
          const query = debouncedSearchQuery.toLowerCase().trim()
          return (
            token.name?.toLowerCase().includes(query) ||
            token.symbol?.toLowerCase().includes(query) ||
            token.address?.toLowerCase().includes(query)
          )
        })
      : filteredTokens

    // 3. 정렬: totalCurrencyPrice 기준 내림차순 (가치 높은 순)
    const sortedTokens = [...searchFiltered].sort((a, b) => {
      const aValue = parseFloat(a.totalCurrencyPrice || '0')
      const bValue = parseFloat(b.totalCurrencyPrice || '0')
      return bValue - aValue
    })

    // 4. 최대 표시 개수 제한
    return maxItems ? sortedTokens.slice(0, maxItems) : sortedTokens
  }, [tokens, debouncedSearchQuery, maxItems])

  // 토큰 클릭 핸들러 - 모달 열기
  const handleTokenClick = useCallback((token: TokenWithChainInfo) => {
    setSelectedToken(token);
    setIsModalOpen(true);
  }, []);

  // 모달 닫기 핸들러
  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedToken(null);
  }, []);

  // 송금 클릭 핸들러
  const handleSendClick = useCallback((token: TokenWithChainInfo) => {
    if (onSendClick) {
      onSendClick(token);
    } else {
      // 기본 동작: 송금 모달 또는 인터페이스 표시
      console.log('Send token:', token);
    }
  }, [onSendClick]);

  // 검색어 변경 핸들러
  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
  }, []);

  // 검색 클리어 핸들러
  const handleSearchClear = useCallback(() => {
    setSearchQuery('');
  }, []);

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

  // 로딩 상태
  if (isLoadingBalance) {
    return (
      <div className={cn('space-y-3', className)}>
        {/* 검색창 스켈레톤 */}
        {showSearch && (
          <div className="h-10 bg-muted/50 animate-pulse rounded-lg" />
        )}

        {/* 토큰 목록 스켈레톤 */}
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
    )
  }

  return (
    <div className={cn('space-y-3', className)}>
      {/* 검색 입력 */}
      {showSearch && tokens && tokens.length > 0 && (
        <TokenSearchInput
          placeholder={searchPlaceholder}
          value={searchQuery}
          onChange={handleSearchChange}
          onClear={handleSearchClear}
          size={compact ? 'sm' : 'md'}
        />
      )}

      {/* 토큰 목록 */}
      <div className="space-y-1">
        {processedTokens.length === 0 ? (
          <div className="text-center py-8">
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                <Icon
                  name={searchQuery ? "search" : "coins"}
                  size={24}
                  className="text-muted-foreground"
                />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  {debouncedSearchQuery ? "검색 결과 없음" : "토큰 없음"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {debouncedSearchQuery
                    ? `"${debouncedSearchQuery}"에 대한 검색 결과가 없습니다`
                    : "보유한 토큰이 없습니다"
                  }
                </p>
              </div>
              {debouncedSearchQuery && (
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
              showSendButton={showSendButtons}
            />
          ))
        )}
      </div>

      {/* 검색 결과 정보 */}
      {showSearch && debouncedSearchQuery && processedTokens.length > 0 && (
        <div className="text-xs text-muted-foreground text-center">
          &quot;{debouncedSearchQuery}&quot;에 대한 {processedTokens.length}개 결과
        </div>
      )}

      {/* 토큰 디테일 모달 */}
      <TokenDetailModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        token={selectedToken}
        onSendClick={handleSendClick}
      />
    </div>
  )
}

// memo로 감싸서 성능 최적화
export const CompactTokenListWithSearch = memo(CompactTokenListWithSearchComponent);

export default CompactTokenListWithSearch;