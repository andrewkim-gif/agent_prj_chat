"use client"

import { useState, useCallback, useMemo, useEffect, memo } from 'react';
import { useCrossWallet } from '@/providers/CrossWalletProvider';
import { useEnhancedTokenData } from '@/hooks/useServerTokenData';
import { CompactTokenListItem } from './CompactTokenListItem';
import { TokenSearchInput } from './TokenSearchInput';
import { TokenDetailModal } from './TokenDetailModal';
import { cn } from '@/lib/utils';
import { Icon } from '@/components/ui/icon';
import { getAllTokensWithChainInfo } from '@/data/tokenList';
import { getTokenImageUrl } from '@/services/crossWalletApi';
import { useCurrentNetwork, useNetworkConfig } from '@/stores/networkStore';
import type { TokenWithChainInfo } from '@/types/crossWallet';

interface AllTokensListProps {
  className?: string;
  onSendClick?: (token: TokenWithChainInfo) => void;
  showPercentChange?: boolean;
  compact?: boolean;
  maxItems?: number;
  showSendButtons?: boolean;
  showSearch?: boolean;
  searchPlaceholder?: string;
  showOnlyOwned?: boolean; // 보유한 토큰만 보여줄지 여부
}

const AllTokensListComponent = function AllTokensList({
  className = '',
  onSendClick,
  showPercentChange = true,
  compact = false,
  maxItems,
  showSendButtons = true,
  showSearch = true,
  searchPlaceholder = "Search tokens...",
  showOnlyOwned = false
}: AllTokensListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [selectedToken, setSelectedToken] = useState<TokenWithChainInfo | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sortBy, setSortBy] = useState<'value' | 'name' | 'price'>('value');

  // Network awareness
  const currentNetwork = useCurrentNetwork();
  const networkConfig = useNetworkConfig();

  // 검색어 디바운싱 (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const {
    tokens: userTokens, // 사용자의 실제 잔액이 있는 토큰들
    isLoadingBalance,
    currency,
    isConnected,
  } = useCrossWallet();

  // Enhanced token data from server (includes images, prices, stats)
  // Filter by current network chain ID
  const currentChainIds = useMemo(() => {
    return networkConfig ? [networkConfig.chainId] : [4157]; // Default to mainnet
  }, [networkConfig]);

  const {
    enhancedTokens,
    ownedTokens,
    unownedTokens,
    isLoading: isLoadingServerData,
    isError: isServerError,
    error: serverError,
    refreshTokens
  } = useEnhancedTokenData({
    currency,
    userTokens,
    chainIds: currentChainIds, // Use current network chain ID
    refreshInterval: 30000, // 30 seconds
    enabled: isConnected
  });

  // Determine which token list to use based on server data availability
  const processedTokens = useMemo(() => {
    let sourceTokens: TokenWithChainInfo[] = []

    // Use server data if available, fallback to static + user data
    if (enhancedTokens.length > 0) {
      sourceTokens = enhancedTokens.map(token => ({
        ...token,
        // Ensure server images are used with proper URL
        image: getTokenImageUrl(token)
      }))
    } else {
      // Fallback to static token list merged with user data
      // Filter by current network chain ID
      const allAvailableTokens = getAllTokensWithChainInfo(currency);
      const networkFilteredTokens = allAvailableTokens.filter(token =>
        currentChainIds.includes(token.chainId)
      );

      sourceTokens = networkFilteredTokens.map(staticToken => {
        const userToken = userTokens?.find(userToken =>
          userToken.address?.toLowerCase() === staticToken.address?.toLowerCase() &&
          userToken.chainId === staticToken.chainId
        );

        if (userToken) {
          return {
            ...staticToken,
            balance: userToken.balance || '0',
            totalCurrencyPrice: userToken.totalCurrencyPrice || '0',
            stats: userToken.stats || staticToken.stats,
            deployed: userToken.deployed ?? staticToken.deployed
          };
        }

        return staticToken;
      });
    }

    let filteredTokens = [...sourceTokens]

    // Filter by ownership status
    if (showOnlyOwned) {
      filteredTokens = sourceTokens.filter(token => {
        // deployed가 false이면 제외
        if (token.deployed === false) return false

        // balance가 0이거나 없으면 제외
        const balance = token.balance || '0'
        const balanceNum = Number(balance)
        if (balanceNum === 0) return false

        return true
      })
    } else {
      // 모든 토큰을 보여주되, deployed가 false인 토큰은 제외
      filteredTokens = sourceTokens.filter(token => {
        return token.deployed !== false
      })
    }

    // Search filtering (using debounced search query)
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

    // Sorting
    const sortedTokens = [...searchFiltered].sort((a, b) => {
      switch (sortBy) {
        case 'value':
          // totalCurrencyPrice 또는 stats.convertedPrice 기준 내림차순
          const aValue = parseFloat(a.totalCurrencyPrice || a.stats?.convertedPrice || '0')
          const bValue = parseFloat(b.totalCurrencyPrice || b.stats?.convertedPrice || '0')
          return bValue - aValue

        case 'name':
          // 이름 기준 오름차순
          return (a.name || '').localeCompare(b.name || '')

        case 'price':
          // 단위 가격 기준 내림차순
          const aPrice = parseFloat(a.stats?.convertedPrice || '0')
          const bPrice = parseFloat(b.stats?.convertedPrice || '0')
          return bPrice - aPrice

        default:
          return 0
      }
    })

    // 최대 표시 개수 제한
    return maxItems ? sortedTokens.slice(0, maxItems) : sortedTokens
  }, [enhancedTokens, userTokens, currency, debouncedSearchQuery, maxItems, sortBy, showOnlyOwned, currentChainIds])

  // Combined loading state
  const isLoading = isLoadingBalance || isLoadingServerData

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

  // 정렬 변경 핸들러
  const handleSortChange = useCallback((newSortBy: 'value' | 'name' | 'price') => {
    setSortBy(newSortBy);
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
  if (isLoading) {
    return (
      <div className={cn('space-y-3', className)}>
        {/* 검색창 및 정렬 옵션 스켈레톤 */}
        {showSearch && (
          <div className="space-y-2">
            <div className="h-10 bg-muted/50 animate-pulse rounded-lg" />
            <div className="h-8 bg-muted/50 animate-pulse rounded-lg w-40" />
          </div>
        )}

        {/* 토큰 목록 스켈레톤 */}
        <div className="space-y-1">
          {Array.from({ length: maxItems || 10 }).map((_, index) => (
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
      {/* 검색 및 필터 옵션 */}
      {showSearch && processedTokens && processedTokens.length > 0 && (
        <div className="space-y-3">
          <TokenSearchInput
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={handleSearchChange}
            onClear={handleSearchClear}
            size={compact ? 'sm' : 'md'}
          />

          {/* 정렬 옵션 */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">정렬:</span>
            <div className="flex gap-1">
              {[
                { key: 'value', label: '가치순' },
                { key: 'name', label: '이름순' },
                { key: 'price', label: '가격순' }
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => handleSortChange(key as 'value' | 'name' | 'price')}
                  className={cn(
                    'px-3 py-1 text-xs rounded-full transition-colors',
                    sortBy === key
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
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
                  {debouncedSearchQuery ? "검색 결과 없음" : showOnlyOwned ? "보유한 토큰 없음" : "토큰 없음"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {debouncedSearchQuery
                    ? `"${debouncedSearchQuery}"에 대한 검색 결과가 없습니다`
                    : showOnlyOwned
                    ? "보유한 토큰이 없습니다"
                    : "사용 가능한 토큰이 없습니다"
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
              showSendButton={showSendButtons && showOnlyOwned} // 보유한 토큰만 볼 때만 송금 버튼 표시
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
export const AllTokensList = memo(AllTokensListComponent);

export default AllTokensList;