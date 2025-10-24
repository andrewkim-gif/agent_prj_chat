"use client"

import React, { createContext, useContext, useCallback, useEffect, useState } from 'react';
import { useCrossWalletStore } from '@/stores/crossWalletStore';
import { useNetworkStore } from '@/stores/networkStore';
import { useBlockchainWallet } from '@/hooks/useBlockchainWallet';
import type {
  CrossWalletContextValue,
  Account,
  TokenWithChainInfo,
  SendTokenParams
} from '@/types/crossWallet';

// Context 생성
const CrossWalletContext = createContext<CrossWalletContextValue | null>(null);

interface CrossWalletProviderProps {
  children: React.ReactNode;
}

export function CrossWalletProvider({ children }: CrossWalletProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false);

  // Network store
  const { currentNetwork } = useNetworkStore();

  // ARA Chat 기존 지갑 훅
  const { wallet, crossAccount } = useBlockchainWallet();

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

  // 지갑 연결 함수
  const connectWallet = useCallback(async () => {
    try {
      setConnectionStatus('connecting');

      // ARA Chat의 기존 연결 정보가 있으면 사용
      if (crossAccount?.address) {
        const account: Account = {
          id: crossAccount.address,
          name: `Account ${crossAccount.address.slice(0, 6)}...${crossAccount.address.slice(-4)}`,
          address: crossAccount.address,
          isSelected: true,
          walletType: 'mnemonic', // 기본값
          lastActivity: Date.now(),
        };

        addAccount(account);
        setCurrentAccount(account);
        setConnectionStatus('connected');
        return;
      }

      // ARA Chat의 일반 지갑 정보 사용
      if (wallet.isConnected && wallet.address) {
        const account: Account = {
          id: wallet.address,
          name: `Account ${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}`,
          address: wallet.address,
          isSelected: true,
          walletType: 'mnemonic',
          lastActivity: Date.now(),
        };

        addAccount(account);
        setCurrentAccount(account);
        setConnectionStatus('connected');
        return;
      }

      // 연결된 지갑이 없으면 에러
      throw new Error('No wallet connected');

    } catch (error) {
      console.error('Failed to connect Cross Wallet:', error);
      setConnectionStatus('disconnected');
      throw error;
    }
  }, [crossAccount, wallet, addAccount, setCurrentAccount, setConnectionStatus]);

  // 지갑 연결 해제 함수
  const disconnectWallet = useCallback(() => {
    console.log('🔌 CrossWalletProvider: Disconnecting wallet...');
    setConnectionStatus('disconnected');
    reset();
    console.log('✅ CrossWalletProvider: Wallet state reset completed');
  }, [setConnectionStatus, reset]);

  // 잔액 새로고침 함수 - 실제 Cross Wallet SDK 사용
  const refreshBalance = useCallback(async () => {
    const account = getCurrentAccount();
    if (!account?.address) {
      console.warn('No account available for balance refresh');
      return;
    }

    try {
      setLoadingBalance(true);

      // 실제 Cross Wallet SDK를 사용하여 토큰 잔액 조회
      const realTokens: TokenWithChainInfo[] = [];

      // Cross Wallet SDK에서 지갑의 실제 토큰 목록 가져오기 - 현재 네트워크별 조회
      if (typeof window !== 'undefined' && window.cross) {
        try {
          // 현재 네트워크의 chainId 가져오기
          const chainId = currentNetwork === 'cross-mainnet' ? 4157 : 4158;

          // Cross Wallet SDK가 올바른 네트워크에 있는지 확인
          let currentChainId;
          try {
            currentChainId = await window.cross.getChainId();
            console.log(`🌐 Cross Wallet current chainId: ${currentChainId}, expected: ${chainId}`);

            // If Cross Wallet is on wrong network, try to switch
            if (currentChainId !== chainId) {
              console.log(`🔄 Attempting to switch Cross Wallet to chainId ${chainId}...`);

              if (typeof window.cross.switchChain === 'function') {
                try {
                  await window.cross.switchChain(chainId);
                  console.log(`✅ Successfully switched Cross Wallet to chainId ${chainId}`);
                  // Verify the switch
                  currentChainId = await window.cross.getChainId();
                } catch (switchError) {
                  console.warn(`⚠️ Could not auto-switch Cross Wallet network: ${switchError.message}`);
                  console.log(`💡 Please manually switch Cross Wallet to ${currentNetwork === 'cross-mainnet' ? 'mainnet' : 'testnet'}`);
                }
              } else {
                console.warn(`⚠️ Cross Wallet does not support automatic network switching`);
                console.log(`💡 Please manually switch Cross Wallet to ${currentNetwork === 'cross-mainnet' ? 'mainnet' : 'testnet'} (chainId: ${chainId})`);
              }
            }
          } catch (chainIdError) {
            console.warn(`Could not get Cross Wallet chainId: ${chainIdError.message}`);
          }

          // Cross Wallet SDK의 실제 API 호출 - chainId 파라미터 포함 (fallback: 파라미터 없이 시도)
          let walletTokens, tokenBalances;

          try {
            // 먼저 chainId 파라미터와 함께 시도
            walletTokens = await window.cross.getTokenList({ chainId });
            tokenBalances = await window.cross.getBalance(account.address, { chainId });
            console.log(`📊 Cross Wallet API with chainId ${chainId}: ${walletTokens.length} tokens`);
          } catch (paramError) {
            console.warn(`ChainId 파라미터 지원 안 됨, 기본 API 호출로 fallback (chainId: ${chainId}):`, paramError);
            // chainId 파라미터 없이 시도 (Cross SDK가 현재 네트워크에 맞게 초기화되어 있다고 가정)
            walletTokens = await window.cross.getTokenList();
            tokenBalances = await window.cross.getBalance(account.address);
            console.log(`📊 Cross Wallet API without chainId: ${walletTokens.length} tokens`);
          }

          console.log(`🌐 Network: ${currentNetwork} (chainId: ${chainId}) - 토큰 ${walletTokens.length}개 조회됨`);

          // 각 토큰의 실제 잔액과 가격 정보 조회
          for (const token of walletTokens) {
            try {
              const balance = tokenBalances[token.symbol] || '0';
              let priceInfo;
              try {
                priceInfo = await window.cross.getTokenPrice(token.symbol, { chainId });
              } catch (priceError) {
                // chainId 파라미터 없이 시도
                priceInfo = await window.cross.getTokenPrice(token.symbol);
              }

              // Wei 단위로 변환된 잔액
              const balanceInWei = balance;

              // USD 가격 계산 - Network-aware 가격 처리
              const balanceInToken = parseFloat(balance) / Math.pow(10, token.decimals || 18);
              let usdPrice = parseFloat(priceInfo.price || '0');

              // 🧪 TESTNET 가격 보정: Testnet에서는 실제 USD 가격 대신 테스트 가격 표시
              if (chainId === 4158) { // Testnet
                // Testnet에서는 가격을 0으로 설정하거나 "Test" 표시를 위한 매우 작은 값
                usdPrice = balanceInToken > 0 ? 0.001 : 0; // 테스트 가격
                console.log(`🧪 Testnet price override for ${token.symbol}: $${usdPrice} (original: ${priceInfo.price})`);
              }

              const totalCurrencyPrice = (balanceInToken * usdPrice).toFixed(2);

              const tokenWithChainInfo: TokenWithChainInfo = {
                id: `${account.address}-${token.symbol.toLowerCase()}-${chainId}`,
                address: token.address,
                name: chainId === 4158 ? `${token.name} (Testnet)` : token.name, // 🧪 Testnet 표시
                symbol: chainId === 4158 ? `${token.symbol}-TEST` : token.symbol, // 🧪 Testnet 심볼 구분
                decimals: token.decimals || 18,
                balance: balanceInWei,
                image: token.logoUrl || `https://portal-cdn.korbit.co.kr/currencies/icons/ico-coin-${token.symbol.toLowerCase()}.png`,
                chainId: chainId, // 현재 네트워크의 chainId 사용
                deployed: true,
                stats: {
                  price: chainId === 4158 ? usdPrice.toString() : (priceInfo.price || '0'), // 🧪 Testnet 가격 표시
                  convertedPrice: chainId === 4158 ? usdPrice.toString() : (priceInfo.price || '0'),
                  percentChange24h: chainId === 4158 ? '0.00' : (priceInfo.percentChange24h || '0'), // 🧪 Testnet 변동률
                },
                totalCurrencyPrice,
                currency: currency,
              };

              realTokens.push(tokenWithChainInfo);
            } catch (tokenError) {
              console.warn(`Failed to fetch data for token ${token.symbol} on chainId ${chainId}:`, tokenError);
            }
          }
        } catch (sdkError) {
          console.error(`Cross Wallet SDK API 호출 실패 (network: ${currentNetwork}):`, sdkError);

          // SDK 호출 실패 시 빈 배열로 설정 (mock 데이터 사용 안 함)
          console.warn(`실제 지갑 데이터를 가져올 수 없습니다 (${currentNetwork}). 지갑을 다시 연결해주세요.`);
        }
      } else {
        const networkDisplayName = currentNetwork === 'cross-mainnet' ? 'mainnet' : 'testnet';
        console.warn(`Cross Wallet extension is not available or not connected.`);
        console.log(`💡 To fix this issue:`);
        console.log(`   1. Install Cross Wallet browser extension`);
        console.log(`   2. Connect your wallet to ARA Chat`);
        console.log(`   3. Make sure Cross Wallet is on ${networkDisplayName} network`);
        console.log(`   4. Refresh the page and try again`);

        // Show user-friendly message in console
        console.info(`🌐 Current ARA Chat network: ${currentNetwork} (${networkDisplayName})`);
        console.info(`🔌 Cross Wallet status: Not connected or not available`);
      }

      // 실제 토큰 데이터만 업데이트 (mock 데이터 사용 안 함)
      updateTokens(realTokens);

    } catch (error) {
      console.error('Failed to refresh balance:', error);
      // 에러 발생 시에도 빈 배열로 설정 (mock 데이터 사용 안 함)
      updateTokens([]);
    } finally {
      setLoadingBalance(false);
    }
  }, [getCurrentAccount, setLoadingBalance, updateTokens, currency]);

  // 토큰 송금 함수
  const sendToken = useCallback(async (params: SendTokenParams): Promise<string> => {
    // TODO: 실제 송금 로직 구현
    console.log('Sending token:', params);

    // 모의 트랜잭션 해시 반환
    return `0x${Math.random().toString(16).substr(2, 64)}`;
  }, []);

  // ARA Chat 지갑 상태와 동기화
  useEffect(() => {
    const syncWithAraChat = async () => {
      // Cross Wallet이 연결되지 않았고, ARA Chat에 연결된 지갑이 있으면 동기화
      if (!isConnected && (wallet.isConnected || crossAccount?.address)) {
        try {
          await connectWallet();
        } catch (error) {
          console.warn('Failed to sync with ARA Chat wallet:', error);
        }
      }
    };

    if (isInitialized) {
      syncWithAraChat();
    }
  }, [isInitialized, isConnected, wallet.isConnected, crossAccount?.address, connectWallet]);

  // 연결된 계정의 잔액 주기적 업데이트
  useEffect(() => {
    if (!isConnected || !getCurrentAccount()) return;

    // 초기 잔액 로드
    refreshBalance();

    // 30초마다 잔액 업데이트
    const interval = setInterval(refreshBalance, 30000);

    return () => clearInterval(interval);
  }, [isConnected, getCurrentAccount, refreshBalance]);

  // 네트워크 변경 시 지갑 데이터 새로고침
  useEffect(() => {
    if (!isConnected || !getCurrentAccount()) return;

    console.log(`🌐 Network changed to: ${currentNetwork}, refreshing wallet data...`);

    // 네트워크가 변경되면 즉시 잔액 새로고침
    refreshBalance();
  }, [currentNetwork, isConnected, getCurrentAccount, refreshBalance]);

  // 초기화 및 이벤트 리스너 설정
  useEffect(() => {
    setIsInitialized(true);

    // 지갑 연결 해제 이벤트 리스너 추가
    const handleWalletDisconnected = () => {
      console.log('🔌 CrossWalletProvider: Received wallet-disconnected event');
      disconnectWallet();
    };

    window.addEventListener('wallet-disconnected', handleWalletDisconnected);

    return () => {
      window.removeEventListener('wallet-disconnected', handleWalletDisconnected);
    };
  }, [disconnectWallet]);

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
    // 초기화 중 로딩 표시
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <CrossWalletContext.Provider value={contextValue}>
      {children}
    </CrossWalletContext.Provider>
  );
}

// Context 훅
export function useCrossWallet(): CrossWalletContextValue {
  const context = useContext(CrossWalletContext);

  if (!context) {
    throw new Error('useCrossWallet must be used within a CrossWalletProvider');
  }

  return context;
}

// 계정 정보만 필요한 경우를 위한 간단한 훅
export function useCrossWalletAccount() {
  const { currentAccount, isConnected, connectWallet, disconnectWallet } = useCrossWallet();

  return {
    account: currentAccount,
    isConnected,
    connectWallet,
    disconnectWallet,
  };
}

// 토큰 정보만 필요한 경우를 위한 훅
export function useCrossWalletTokens() {
  const {
    tokens,
    isLoadingBalance,
    refreshBalance,
    totalAssetsValue,
    formattedTotalAssets,
  } = useCrossWallet();

  return {
    tokens,
    isLoading: isLoadingBalance,
    refreshBalance,
    totalAssetsValue,
    formattedTotalAssets,
  };
}