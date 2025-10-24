"use client"

import React, { createContext, useContext, useCallback, useEffect, useState } from 'react';
import { useCrossWalletStore } from '@/stores/crossWalletStore';
import { useAppKit, useAppKitAccount, useAppKitNetwork } from '@to-nexus/sdk/react';
import type {
  CrossWalletContextValue,
  Account,
  TokenWithChainInfo,
  SendTokenParams
} from '@/types/crossWallet';

// Context 생성
const SimpleCrossWalletContext = createContext<CrossWalletContextValue | null>(null);

interface SimpleCrossWalletProviderProps {
  children: React.ReactNode;
}

export function SimpleCrossWalletProvider({ children }: SimpleCrossWalletProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false);

  // Cross SDK hooks
  const appKit = useAppKit();
  const {
    address: sdkAddress,
    isConnected: sdkConnected,
    balance: sdkBalance,
    balanceSymbol: sdkBalanceSymbol,
    tokenBalance: sdkTokenBalance
  } = useAppKitAccount();
  const { chainId: sdkChainId } = useAppKitNetwork();

  // Zustand 스토어 상태 및 액션
  const {
    // 상태
    accounts,
    currentAccount,
    tokens,
    isLoadingBalance,
    lastBalanceUpdate,
    isShowTotalAssets,
    currency,
    theme,
    isConnected,
    connectionStatus,

    // 액션
    setCurrentAccount,
    addAccount,
    removeAccount,
    updateTokens,
    setLoadingBalance,
    toggleShowTotalAssets,
    setCurrency,
    setTheme,
    setConnectionStatus,
    reset,

    // 계산된 값들
    getTotalAssetsValue,
    getFormattedTotalAssets,
    getCurrentAccount,
  } = useCrossWalletStore();

  // 🚀 간단한 지갑 연결 함수
  const connectWallet = useCallback(async () => {
    try {
      setConnectionStatus('connecting');

      if (sdkConnected && sdkAddress) {
        console.log('✅ Cross SDK already connected:', sdkAddress);
        const account: Account = {
          id: sdkAddress,
          name: `Account ${sdkAddress.slice(0, 6)}...${sdkAddress.slice(-4)}`,
          address: sdkAddress,
          isSelected: true,
          walletType: 'cross_wallet',
          lastActivity: Date.now(),
        };

        addAccount(account);
        setCurrentAccount(account);
        setConnectionStatus('connected');
        return;
      }

      // Cross SDK AppKit 모달 열기
      console.log('🔌 Opening Cross SDK connection modal...');
      if (appKit) {
        appKit.open();
      } else {
        throw new Error('Cross SDK AppKit not available');
      }

    } catch (error) {
      console.error('❌ Failed to connect Cross Wallet:', error);
      setConnectionStatus('disconnected');
      throw error;
    }
  }, [sdkConnected, sdkAddress, addAccount, setCurrentAccount, setConnectionStatus, appKit]);

  // 지갑 연결 해제 함수
  const disconnectWallet = useCallback(() => {
    console.log('🔌 Disconnecting wallet...');
    setConnectionStatus('disconnected');
    reset();
    console.log('✅ Wallet state reset completed');
  }, [setConnectionStatus, reset]);

  // 🎯 간단한 잔액 새로고침 함수 - Cross SDK 데이터만 사용
  const refreshBalance = useCallback(async () => {
    const account = getCurrentAccount();
    if (!account?.address) {
      console.warn('❌ No account available for balance refresh');
      return;
    }

    console.log('🚀 SIMPLE refreshBalance START:', {
      account: account.address,
      sdkConnected,
      sdkBalance,
      sdkBalanceSymbol,
      sdkChainId,
      tokenBalanceLength: sdkTokenBalance?.length || 0
    });

    try {
      setLoadingBalance(true);
      const tokens: TokenWithChainInfo[] = [];

      // 1️⃣ Cross SDK가 연결되어 있고 잔액이 있으면 바로 tCROSS 토큰 생성
      if (sdkConnected && sdkAddress && sdkBalance && parseFloat(sdkBalance) > 0) {
        const tokenChainId = sdkChainId || 612044; // Cross Testnet 기본값
        const balanceValue = parseFloat(sdkBalance);
        const balanceInWei = (balanceValue * Math.pow(10, 18)).toString();

        const tCrossToken: TokenWithChainInfo = {
          id: `${account.address}-native-${tokenChainId}`,
          address: 'native',
          name: 'tCROSS (Testnet)',
          symbol: 'tCROSS',
          decimals: 18,
          balance: balanceInWei,
          image: 'https://contents.crosstoken.io/wallet/token/images/tCROSS.svg',
          chainId: tokenChainId,
          deployed: true,
          stats: {
            price: '0',
            convertedPrice: '0',
            percentChange24h: '0.00',
          },
          totalCurrencyPrice: '0.00',
          currency: currency,
        };

        tokens.push(tCrossToken);
        console.log('✅ CREATED TCROSS TOKEN:', {
          symbol: tCrossToken.symbol,
          balance: balanceValue,
          chainId: tokenChainId,
          id: tCrossToken.id
        });
      } else {
        console.log('❌ SDK conditions not met:', {
          sdkConnected,
          sdkAddress: !!sdkAddress,
          sdkBalance,
          balanceNum: sdkBalance ? parseFloat(sdkBalance) : 'N/A'
        });
      }

      // 2️⃣ SDK tokenBalance 배열에서 추가 토큰들 처리
      if (sdkTokenBalance && sdkTokenBalance.length > 0) {
        console.log('📋 Processing SDK tokenBalance:', sdkTokenBalance.length);

        for (const token of sdkTokenBalance) {
          // 네이티브 토큰은 위에서 이미 처리했으므로 스킵
          if (token.address === '0x0000000000000000000000000000000000000001') {
            console.log('⏭️ Skipping native token from tokenBalance');
            continue;
          }

          const balanceInWei = token.quantity?.numeric || '0';
          const balanceInToken = parseFloat(balanceInWei) / Math.pow(10, token.quantity?.decimals || 18);

          if (balanceInToken > 0) {
            const tokenWithChainInfo: TokenWithChainInfo = {
              id: `${account.address}-${token.symbol?.toLowerCase()}-${token.chainId || sdkChainId || 612044}`,
              address: token.address,
              name: token.name || token.symbol || 'Unknown',
              symbol: token.symbol || 'UNK',
              decimals: token.quantity?.decimals || 18,
              balance: balanceInWei,
              image: token.icon_url || '',
              chainId: token.chainId || sdkChainId || 612044,
              deployed: true,
              stats: {
                price: '0',
                convertedPrice: '0',
                percentChange24h: '0.00',
              },
              totalCurrencyPrice: '0.00',
              currency: currency,
            };

            tokens.push(tokenWithChainInfo);
            console.log('✅ Added SDK token:', token.symbol);
          }
        }
      }

      console.log('📊 FINAL TOKENS TO STORE:', {
        count: tokens.length,
        tokens: tokens.map(t => ({ symbol: t.symbol, balance: t.balance, chainId: t.chainId }))
      });

      // 3️⃣ 스토어에 업데이트
      updateTokens(tokens);
      console.log('✅ Tokens updated in store');

    } catch (error) {
      console.error('❌ Error in refreshBalance:', error);
      updateTokens([]);
    } finally {
      setLoadingBalance(false);
    }
  }, [getCurrentAccount, setLoadingBalance, updateTokens, currency, sdkConnected, sdkAddress, sdkBalance, sdkBalanceSymbol, sdkChainId, sdkTokenBalance]);

  // 토큰 송금 함수
  const sendToken = useCallback(async (params: SendTokenParams): Promise<string> => {
    console.log('Sending token:', params);
    return `0x${Math.random().toString(16).substr(2, 64)}`;
  }, []);

  // Cross SDK 지갑 상태와 동기화 - 즉시 동기화
  useEffect(() => {
    if (sdkConnected && sdkAddress) {
      console.log('🔌 Cross SDK connected, syncing with wallet state...');
      try {
        const account: Account = {
          id: sdkAddress,
          name: `Account ${sdkAddress.slice(0, 6)}...${sdkAddress.slice(-4)}`,
          address: sdkAddress,
          isSelected: true,
          walletType: 'cross_wallet',
          lastActivity: Date.now(),
        };

        addAccount(account);
        setCurrentAccount(account);
        setConnectionStatus('connected');
      } catch (error) {
        console.warn('Failed to sync with Cross SDK:', error);
      }
    } else if (!sdkConnected && isConnected) {
      // SDK가 연결되지 않았는데 스토어에서는 연결됨으로 되어있으면 초기화
      console.log('🔌 SDK disconnected, updating wallet state...');
      setConnectionStatus('disconnected');
    }
  }, [sdkConnected, sdkAddress, isConnected, addAccount, setCurrentAccount, setConnectionStatus]);

  // 연결된 계정의 잔액 업데이트
  useEffect(() => {
    if (!isConnected || !getCurrentAccount()) return;

    // 초기 잔액 로드
    refreshBalance();

    // 30초마다 잔액 업데이트
    const interval = setInterval(() => {
      refreshBalance();
    }, 30000);

    return () => clearInterval(interval);
  }, [isConnected, getCurrentAccount, refreshBalance]);

  // SDK 연결 상태 변경 시 즉시 잔액 새로고침
  useEffect(() => {
    if (sdkConnected && sdkAddress && isConnected) {
      console.log('🔄 SDK connection detected, refreshing balance...');
      refreshBalance();
    }
  }, [sdkConnected, sdkAddress, isConnected, refreshBalance]);

  // 초기화 및 즉시 SDK 상태 동기화
  useEffect(() => {
    setIsInitialized(true);

    // 컴포넌트 마운트 시 즉시 SDK 상태와 동기화
    if (sdkConnected && sdkAddress) {
      console.log('🚀 Initial SDK sync on mount:', { sdkConnected, sdkAddress });
      const account: Account = {
        id: sdkAddress,
        name: `Account ${sdkAddress.slice(0, 6)}...${sdkAddress.slice(-4)}`,
        address: sdkAddress,
        isSelected: true,
        walletType: 'cross_wallet',
        lastActivity: Date.now(),
      };

      addAccount(account);
      setCurrentAccount(account);
      setConnectionStatus('connected');
    }

    const handleWalletDisconnected = () => {
      console.log('🔌 Received wallet-disconnected event');
      disconnectWallet();
    };

    window.addEventListener('wallet-disconnected', handleWalletDisconnected);

    return () => {
      window.removeEventListener('wallet-disconnected', handleWalletDisconnected);
    };
  }, [disconnectWallet, sdkConnected, sdkAddress, addAccount, setCurrentAccount, setConnectionStatus]);

  // Context 값 구성
  const contextValue: CrossWalletContextValue = {
    // 상태
    accounts,
    currentAccount,
    tokens,
    isLoadingBalance,
    lastBalanceUpdate,
    isShowTotalAssets,
    currency,
    theme,
    isConnected,
    connectionStatus,

    // 액션
    setCurrentAccount,
    addAccount,
    removeAccount,
    updateTokens,
    setLoadingBalance,
    toggleShowTotalAssets,
    setCurrency,
    setTheme,
    setConnectionStatus,
    reset,

    // 통합 액션
    connectWallet,
    disconnectWallet,
    refreshBalance,
    sendToken,

    // 계산된 값
    totalAssetsValue: getTotalAssetsValue(),
    formattedTotalAssets: getFormattedTotalAssets(),
  };

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <SimpleCrossWalletContext.Provider value={contextValue}>
      {children}
    </SimpleCrossWalletContext.Provider>
  );
}

// Context 훅
export function useSimpleCrossWallet(): CrossWalletContextValue {
  const context = useContext(SimpleCrossWalletContext);

  if (!context) {
    throw new Error('useSimpleCrossWallet must be used within a SimpleCrossWalletProvider');
  }

  return context;
}

// 계정 정보만 필요한 경우를 위한 간단한 훅
export function useSimpleCrossWalletAccount() {
  const { currentAccount, isConnected, connectWallet, disconnectWallet } = useSimpleCrossWallet();

  return {
    account: currentAccount,
    isConnected,
    connectWallet,
    disconnectWallet,
  };
}

// 토큰 정보만 필요한 경우를 위한 훅
export function useSimpleCrossWalletTokens() {
  const {
    tokens,
    isLoadingBalance,
    refreshBalance,
    totalAssetsValue,
    formattedTotalAssets,
  } = useSimpleCrossWallet();

  return {
    tokens,
    isLoading: isLoadingBalance,
    refreshBalance,
    totalAssetsValue,
    formattedTotalAssets,
  };
}