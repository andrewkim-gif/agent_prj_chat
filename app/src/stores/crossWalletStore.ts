import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import Decimal from 'decimal.js';
import type {
  CrossWalletState,
  CrossWalletActions,
  Account,
  TokenWithChainInfo,
  Currency
} from '@/types/crossWallet';

// 초기 상태
const initialState: CrossWalletState = {
  accounts: [],
  currentAccount: null,
  tokens: [],
  isLoadingBalance: false,
  lastBalanceUpdate: 0,
  isShowTotalAssets: true,
  currency: 'USD',
  theme: 'light',
  isConnected: false,
  connectionStatus: 'disconnected',
};

// Cross Wallet Store 타입
export interface CrossWalletStore extends CrossWalletState, CrossWalletActions {
  // 계산된 값들
  getTotalAssetsValue: () => string;
  getFormattedTotalAssets: () => string;
  getCurrentAccount: () => Account | null;
}

// Zustand 스토어 생성
export const useCrossWalletStore = create<CrossWalletStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      // 계정 관리
      setCurrentAccount: (account: Account) => {
        set((state) => ({
          currentAccount: account,
          isConnected: true,
          connectionStatus: 'connected' as const,
          // 기존 계정 목록에서 선택 상태 업데이트
          accounts: state.accounts.map(acc => ({
            ...acc,
            isSelected: acc.id === account.id
          }))
        }));
      },

      addAccount: (account: Account) => {
        set((state) => ({
          accounts: [...state.accounts.filter(acc => acc.id !== account.id), account]
        }));
      },

      removeAccount: (accountId: string) => {
        set((state) => {
          const updatedAccounts = state.accounts.filter(acc => acc.id !== accountId);
          const wasCurrentAccount = state.currentAccount?.id === accountId;

          return {
            accounts: updatedAccounts,
            currentAccount: wasCurrentAccount ? null : state.currentAccount,
            isConnected: wasCurrentAccount ? false : state.isConnected,
            connectionStatus: wasCurrentAccount ? 'disconnected' as const : state.connectionStatus
          };
        });
      },

      // 토큰 관리
      updateTokens: (tokens: TokenWithChainInfo[]) => {
        set({
          tokens,
          lastBalanceUpdate: Date.now(),
          isLoadingBalance: false
        });
      },

      setLoadingBalance: (loading: boolean) => {
        set({ isLoadingBalance: loading });
      },

      // UI 설정
      toggleShowTotalAssets: () => {
        set((state) => ({ isShowTotalAssets: !state.isShowTotalAssets }));
      },

      setCurrency: (currency: Currency) => {
        set({ currency });
      },

      setTheme: (theme: 'light' | 'dark') => {
        set({ theme });
      },

      // 연결 관리
      setConnectionStatus: (status: 'connected' | 'disconnected' | 'connecting') => {
        set({
          connectionStatus: status,
          isConnected: status === 'connected'
        });
      },

      // 초기화
      reset: () => {
        set(initialState);
      },

      // 계산된 값들
      getTotalAssetsValue: () => {
        const state = get();
        try {
          return state.tokens.reduce((total, token) => {
            const tokenValue = token.totalCurrencyPrice || '0';
            return total.plus(new Decimal(tokenValue));
          }, new Decimal(0)).toString();
        } catch (error) {
          console.error('Error calculating total assets:', error);
          return '0';
        }
      },

      getFormattedTotalAssets: () => {
        const state = get();
        const totalValue = state.getTotalAssetsValue();
        const currencySymbol = getCurrencySymbol(state.currency);

        try {
          const formatted = formatNumber(new Decimal(totalValue).toNumber(), true);
          return `${currencySymbol}${formatted}`;
        } catch (error) {
          console.error('Error formatting total assets:', error);
          return `${currencySymbol}0`;
        }
      },

      getCurrentAccount: () => {
        const state = get();
        return state.currentAccount || state.accounts.find(acc => acc.isSelected) || null;
      },
    }),
    {
      name: 'cross-wallet-storage',
      version: 1,
      storage: createJSONStorage(() => localStorage),

      // 지속성에서 제외할 키들 (런타임 상태)
      partialize: (state) => ({
        accounts: state.accounts,
        currentAccount: state.currentAccount,
        isShowTotalAssets: state.isShowTotalAssets,
        currency: state.currency,
        theme: state.theme,
        // 토큰 정보는 제외 (항상 새로 조회)
      }),

      // 마이그레이션 로직
      migrate: (persistedState: any, version: number) => {
        if (version === 0) {
          // 초기 버전에서의 마이그레이션
          return {
            ...persistedState,
            connectionStatus: 'disconnected',
            isConnected: false,
          };
        }
        return persistedState;
      },

      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error('Cross Wallet store rehydration error:', error);
        } else if (state) {
          // 재시작 시 연결 상태 초기화
          state.setConnectionStatus('disconnected');
        }
      },
    }
  )
);

// 유틸리티 함수들
export function getCurrencySymbol(currency: Currency): string {
  const symbols: Record<Currency, string> = {
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'KRW': '₩',
    'AUD': 'A$',
    'CAD': 'C$',
    'CHF': 'CHF ',
  };
  return symbols[currency] || '$';
}

export function formatNumber(value: number, addCommas: boolean = true, decimals?: number): string {
  try {
    const num = new Decimal(value);

    if (num.isZero()) return '0';

    // 소수점 자릿수 결정
    let precision = decimals;
    if (precision === undefined) {
      if (num.gte(100)) precision = 0;
      else if (num.gte(1)) precision = 2;
      else if (num.gte(0.01)) precision = 4;
      else precision = 6;
    }

    const formatted = num.toFixed(precision);

    if (addCommas) {
      return formatted.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }

    return formatted;
  } catch (error) {
    console.error('Error formatting number:', error);
    return '0';
  }
}