"use client"

import React, { createContext, useContext, useCallback, useEffect, useState, useMemo } from 'react';
import { useSimpleCrossWallet } from '@/providers/SimpleCrossWalletProvider';
import { useCurrentNetwork, useNetworkConfig } from '@/stores/networkStore';
import { getTokensByChainId, getAllTokens } from '@/config/tokens';
import { useAppKitAccount } from '@to-nexus/sdk/react';
import { AccountController } from '@to-nexus/sdk/react';
import type { TokenWithChainInfo } from '@/types/crossWallet';

interface NetworkTokenState {
  // 현재 네트워크의 모든 지원 토큰 (잔액 0 포함)
  allSupportedTokens: TokenWithChainInfo[]

  // 사용자가 실제 보유한 토큰
  ownedTokens: TokenWithChainInfo[]

  // 표시 모드
  displayMode: 'owned' | 'all'

  // 로딩 상태
  isRefreshing: boolean

  // 마지막 업데이트 시간
  lastRefresh: number

  // 현재 네트워크 정보
  currentChainId: number
}

interface NetworkTokenActions {
  // 표시 모드 변경
  setDisplayMode: (mode: 'owned' | 'all') => void

  // 현재 네트워크의 토큰 새로고침
  refreshTokens: () => Promise<void>

  // 특정 네트워크의 토큰 새로고침
  refreshTokensForNetwork: (chainId: number) => Promise<void>

  // 표시할 토큰 목록 가져오기
  getDisplayTokens: () => TokenWithChainInfo[]
}

interface NetworkTokenContextValue extends NetworkTokenState, NetworkTokenActions {}

const NetworkTokenContext = createContext<NetworkTokenContextValue | null>(null);

interface NetworkTokenProviderProps {
  children: React.ReactNode;
}

export function NetworkTokenProvider({ children }: NetworkTokenProviderProps) {
  // States
  const [allSupportedTokens, setAllSupportedTokens] = useState<TokenWithChainInfo[]>([]);
  const [ownedTokens, setOwnedTokens] = useState<TokenWithChainInfo[]>([]);
  const [displayMode, setDisplayMode] = useState<'owned' | 'all'>('owned');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(0);

  // Dependencies
  const { tokens: userTokens, isConnected, currency } = useSimpleCrossWallet();
  const currentNetwork = useCurrentNetwork();
  const networkConfig = useNetworkConfig();
  const { tokenBalance: sdkTokenBalance, isConnected: sdkConnected } = useAppKitAccount();

  // Current chain ID
  const currentChainId = useMemo(() => {
    return networkConfig?.chainId || 612044; // Cross Testnet 기본값
  }, [networkConfig]);

  // Debug logging - 개발 환경에서만 활성화
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 NetworkTokenProvider Debug:', {
      isConnected,
      sdkConnected,
      userTokensLength: userTokens?.length || 0,
      sdkTokenBalanceLength: sdkTokenBalance?.length || 0,
      currentChainId,
      allSupportedTokensLength: allSupportedTokens.length,
      ownedTokensLength: ownedTokens.length,
      displayMode
    });
  }

  // 정적 토큰 목록을 TokenWithChainInfo 형태로 변환
  const convertStaticTokensToTokenWithChainInfo = useCallback((chainId: number): TokenWithChainInfo[] => {
    const staticTokens = getTokensByChainId(chainId);

    return staticTokens.map(token => ({
      id: `static-${token.symbol.toLowerCase()}-${chainId}`,
      address: token.contractAddress || 'native',
      name: token.name,
      symbol: token.symbol,
      decimals: token.decimals,
      balance: '0',
      totalBalance: '0',
      totalCurrencyPrice: '0.00',
      image: token.logoUrl,
      chainId: chainId,
      deployed: true,
      stats: {
        price: '0',
        convertedPrice: '0',
        percentChange24h: '0.00'
      },
      currency: currency,
      category: token.category,
      verified: token.verified,
      isNative: token.isNative
    }));
  }, [currency]);

  // Cross SDK를 통한 사용자 토큰 잔액 조회
  const fetchUserTokenBalances = useCallback(async (chainId: number): Promise<TokenWithChainInfo[]> => {
    if (!isConnected || !sdkConnected) {
      console.log('📱 Not connected to wallet, skipping balance fetch');
      return [];
    }

    try {
      console.log('🔄 Fetching user token balances for chain:', chainId);

      // Cross SDK를 통한 토큰 잔액 조회
      await AccountController.fetchTokenBalance();

      if (!sdkTokenBalance || sdkTokenBalance.length === 0) {
        console.log('📭 No token balances found');
        return [];
      }

      // SDK 토큰 잔액을 TokenWithChainInfo 형태로 변환
      const processedTokens: TokenWithChainInfo[] = [];

      for (const token of sdkTokenBalance) {
        // 현재 네트워크의 토큰만 처리
        if (token.chainId && token.chainId !== chainId) continue;

        const balanceInWei = token.quantity?.numeric || '0';
        const balanceInToken = parseFloat(balanceInWei) / Math.pow(10, token.quantity?.decimals || 18);

        // 잔액이 있는 토큰만 포함
        if (balanceInToken > 0) {
          const tokenWithChainInfo: TokenWithChainInfo = {
            id: `user-${token.symbol?.toLowerCase()}-${chainId}`,
            address: token.address || 'native',
            name: token.name || token.symbol || 'Unknown',
            symbol: token.symbol || 'UNK',
            decimals: token.quantity?.decimals || 18,
            balance: balanceInWei,
            totalBalance: balanceInWei,
            totalCurrencyPrice: '0.00', // 가격 정보는 별도 조회 필요
            image: token.icon_url || '',
            chainId: chainId,
            deployed: true,
            stats: {
              price: '0',
              convertedPrice: '0',
              percentChange24h: '0.00'
            },
            currency: currency
          };

          processedTokens.push(tokenWithChainInfo);
        }
      }

      console.log('✅ Processed user tokens:', processedTokens.length);
      return processedTokens;

    } catch (error) {
      console.error('❌ Error fetching user token balances:', error);
      return [];
    }
  }, [isConnected, sdkConnected, sdkTokenBalance, currency]);

  // 정적 토큰과 사용자 잔액 병합
  const mergeTokenData = useCallback((
    staticTokens: TokenWithChainInfo[],
    userTokens: TokenWithChainInfo[]
  ): { allTokens: TokenWithChainInfo[], ownedTokens: TokenWithChainInfo[] } => {

    console.log('🔄 Merging token data:', {
      staticCount: staticTokens.length,
      userCount: userTokens.length
    });

    // 전체 토큰 목록 생성 (정적 토큰 기준)
    const allTokens = staticTokens.map(staticToken => {
      // 사용자 토큰에서 매칭되는 토큰 찾기
      const userToken = userTokens.find(ut =>
        (ut.address.toLowerCase() === staticToken.address.toLowerCase() ||
         ut.symbol.toLowerCase() === staticToken.symbol.toLowerCase()) &&
        ut.chainId === staticToken.chainId
      );

      if (userToken) {
        // 사용자 잔액 정보로 업데이트
        return {
          ...staticToken,
          id: userToken.id,
          balance: userToken.balance,
          totalBalance: userToken.totalBalance,
          totalCurrencyPrice: userToken.totalCurrencyPrice,
          stats: userToken.stats
        };
      }

      // 잔액이 없는 정적 토큰
      return staticToken;
    });

    // 정적 목록에 없는 사용자 토큰 추가
    userTokens.forEach(userToken => {
      const existsInStatic = allTokens.some(staticToken =>
        (staticToken.address.toLowerCase() === userToken.address.toLowerCase() ||
         staticToken.symbol.toLowerCase() === userToken.symbol.toLowerCase()) &&
        staticToken.chainId === userToken.chainId
      );

      if (!existsInStatic) {
        allTokens.unshift(userToken); // 맨 앞에 추가
      }
    });

    // 보유 토큰만 필터링
    const ownedTokens = allTokens.filter(token => {
      const balance = parseFloat(token.balance || '0');
      return balance > 0;
    });

    console.log('✅ Token merge completed:', {
      allTokensCount: allTokens.length,
      ownedTokensCount: ownedTokens.length
    });

    return { allTokens, ownedTokens };
  }, []);

  // 특정 네트워크의 토큰 새로고침
  const refreshTokensForNetwork = useCallback(async (chainId: number) => {
    console.log('🔄 Refreshing tokens for network:', chainId);
    setIsRefreshing(true);

    try {
      // 1. 정적 토큰 목록 즉시 로드
      const staticTokens = convertStaticTokensToTokenWithChainInfo(chainId);
      console.log('📋 Loaded static tokens:', staticTokens.length);

      // 즉시 표시할 수 있도록 설정
      setAllSupportedTokens(staticTokens);
      setOwnedTokens([]);

      // 2. 사용자 잔액 조회 (백그라운드)
      const userTokens = await fetchUserTokenBalances(chainId);

      // 3. 데이터 병합 및 최종 업데이트
      const { allTokens, ownedTokens } = mergeTokenData(staticTokens, userTokens);

      setAllSupportedTokens(allTokens);
      setOwnedTokens(ownedTokens);
      setLastRefresh(Date.now());

      console.log('✅ Token refresh completed for chain:', chainId);

    } catch (error) {
      console.error('❌ Error refreshing tokens:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [convertStaticTokensToTokenWithChainInfo, fetchUserTokenBalances, mergeTokenData]);

  // 현재 네트워크의 토큰 새로고침
  const refreshTokens = useCallback(async () => {
    await refreshTokensForNetwork(currentChainId);
  }, [refreshTokensForNetwork, currentChainId]);

  // 표시할 토큰 목록 가져오기
  const getDisplayTokens = useCallback((): TokenWithChainInfo[] => {
    const tokens = displayMode === 'owned' ? ownedTokens : allSupportedTokens;

    // 정렬: 잔액 있는 토큰을 먼저, 그 다음 이름순
    return [...tokens].sort((a, b) => {
      const aBalance = parseFloat(a.balance || '0');
      const bBalance = parseFloat(b.balance || '0');

      // 잔액이 있는 토큰 우선
      if (aBalance > 0 && bBalance === 0) return -1;
      if (aBalance === 0 && bBalance > 0) return 1;

      // 잔액이 모두 있거나 모두 없으면 이름순
      return (a.name || '').localeCompare(b.name || '');
    });
  }, [displayMode, ownedTokens, allSupportedTokens]);

  // 네트워크 변경 시 토큰 새로고침 (지갑 연결 여부와 관계없이)
  useEffect(() => {
    console.log('🌐 Network changed to:', currentNetwork, 'Chain ID:', currentChainId);
    refreshTokensForNetwork(currentChainId);
  }, [currentNetwork, currentChainId, refreshTokensForNetwork]);

  // 초기 로딩: 네트워크 설정이 준비되면 정적 토큰을 즉시 로드
  useEffect(() => {
    if (currentChainId && allSupportedTokens.length === 0) {
      console.log('🚀 Initial token load for chain:', currentChainId);
      const staticTokens = convertStaticTokensToTokenWithChainInfo(currentChainId);
      setAllSupportedTokens(staticTokens);
    }
  }, [currentChainId, allSupportedTokens.length, convertStaticTokensToTokenWithChainInfo]);

  // SDK 연결 상태 변경 시 토큰 새로고침
  useEffect(() => {
    if (sdkConnected && isConnected) {
      console.log('🔌 SDK connected, refreshing tokens...');
      refreshTokens();
    }
  }, [sdkConnected, isConnected, refreshTokens]);

  // Context 값 구성
  const contextValue: NetworkTokenContextValue = {
    // State
    allSupportedTokens,
    ownedTokens,
    displayMode,
    isRefreshing,
    lastRefresh,
    currentChainId,

    // Actions
    setDisplayMode,
    refreshTokens,
    refreshTokensForNetwork,
    getDisplayTokens
  };

  return (
    <NetworkTokenContext.Provider value={contextValue}>
      {children}
    </NetworkTokenContext.Provider>
  );
}

// Context 훅
export function useNetworkTokens(): NetworkTokenContextValue {
  const context = useContext(NetworkTokenContext);

  if (!context) {
    throw new Error('useNetworkTokens must be used within a NetworkTokenProvider');
  }

  return context;
}

// 편의 훅들
export function useDisplayTokens() {
  const { getDisplayTokens, displayMode, isRefreshing } = useNetworkTokens();

  return {
    tokens: getDisplayTokens(),
    displayMode,
    isRefreshing
  };
}

export function useTokenCounts() {
  const { allSupportedTokens, ownedTokens } = useNetworkTokens();

  return {
    totalCount: allSupportedTokens.length,
    ownedCount: ownedTokens.length
  };
}

export function useTokenRefresh() {
  const { refreshTokens, refreshTokensForNetwork, isRefreshing, lastRefresh } = useNetworkTokens();

  return {
    refreshTokens,
    refreshTokensForNetwork,
    isRefreshing,
    lastRefresh
  };
}