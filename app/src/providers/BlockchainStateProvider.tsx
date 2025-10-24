"use client"

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react'
import {
  WalletState,
  TokenBalance,
  Transaction,
  NetworkInfo,
  BridgeTransaction,
  SecuritySettings,
  SUPPORTED_NETWORKS,
  DEFAULT_TOKENS
} from '@/types/blockchain'

// State interface
interface BlockchainState {
  wallet: WalletState;
  tokens: {
    balances: TokenBalance[];
    watchlist: string[];
    customTokens: TokenBalance[];
  };
  transactions: {
    pending: Transaction[];
    history: Transaction[];
    filters: {
      status?: string;
      symbol?: string;
      type?: string;
    };
  };
  network: {
    current: NetworkInfo;
    supported: NetworkInfo[];
    gasPrice?: string;
    isConnecting?: boolean;
  };
  bridge: {
    transactions: BridgeTransaction[];
    routes: any[];
  };
  settings: {
    debugMode: boolean;
    gasStrategy: 'slow' | 'standard' | 'fast' | 'instant';
    slippageTolerance: number;
    autoRefresh: boolean;
    security: SecuritySettings;
  };
  ui: {
    activeModal?: string;
    sidebarOpen: boolean;
    notifications: Array<{
      id: string;
      type: 'success' | 'error' | 'warning' | 'info';
      message: string;
      timestamp: Date;
    }>;
  };
}

// Action types
type BlockchainAction =
  | { type: 'WALLET_CONNECT_START'; payload: { type: string } }
  | { type: 'WALLET_CONNECT_SUCCESS'; payload: WalletState }
  | { type: 'WALLET_CONNECT_ERROR'; payload: string }
  | { type: 'WALLET_DISCONNECT' }
  | { type: 'WALLET_UPDATE_BALANCE'; payload: { balance: string; tokenBalances?: any } }
  | { type: 'TOKENS_UPDATE_BALANCES'; payload: TokenBalance[] }
  | { type: 'TOKENS_ADD_CUSTOM'; payload: TokenBalance }
  | { type: 'TOKENS_ADD_TO_WATCHLIST'; payload: string }
  | { type: 'TRANSACTION_ADD'; payload: Transaction }
  | { type: 'TRANSACTION_UPDATE'; payload: { id: string; updates: Partial<Transaction> } }
  | { type: 'TRANSACTION_SET_HISTORY'; payload: Transaction[] }
  | { type: 'NETWORK_SWITCH_START'; payload: number }
  | { type: 'NETWORK_SWITCH_SUCCESS'; payload: NetworkInfo }
  | { type: 'NETWORK_SWITCH_ERROR'; payload: string }
  | { type: 'NETWORK_UPDATE_GAS_PRICE'; payload: string }
  | { type: 'BRIDGE_ADD_TRANSACTION'; payload: BridgeTransaction }
  | { type: 'BRIDGE_UPDATE_TRANSACTION'; payload: { id: string; updates: Partial<BridgeTransaction> } }
  | { type: 'SETTINGS_UPDATE'; payload: Partial<BlockchainState['settings']> }
  | { type: 'UI_SET_MODAL'; payload: string | undefined }
  | { type: 'UI_TOGGLE_SIDEBAR' }
  | { type: 'UI_ADD_NOTIFICATION'; payload: { type: string; message: string } }
  | { type: 'UI_REMOVE_NOTIFICATION'; payload: string };

// Initial state
const initialState: BlockchainState = {
  wallet: {
    isConnected: false,
    isConnecting: false
  },
  tokens: {
    balances: DEFAULT_TOKENS,
    watchlist: ['CROSS', 'BNB', 'ETH', 'USDT', 'USDC'],
    customTokens: []
  },
  transactions: {
    pending: [],
    history: [],
    filters: {}
  },
  network: {
    current: SUPPORTED_NETWORKS[0], // Default to Cross Chain
    supported: SUPPORTED_NETWORKS,
    isConnecting: false
  },
  bridge: {
    transactions: [],
    routes: []
  },
  settings: {
    debugMode: false,
    gasStrategy: 'standard',
    slippageTolerance: 0.5,
    autoRefresh: true,
    security: {
      spendingLimits: {},
      trustedAddresses: [],
      requireConfirmation: true,
      simulateTransactions: true
    }
  },
  ui: {
    sidebarOpen: false,
    notifications: []
  }
};

// Reducer
function blockchainReducer(state: BlockchainState, action: BlockchainAction): BlockchainState {
  switch (action.type) {
    case 'WALLET_CONNECT_START':
      return {
        ...state,
        wallet: {
          ...state.wallet,
          isConnecting: true,
          error: undefined,
          type: action.payload.type as any
        }
      };

    case 'WALLET_CONNECT_SUCCESS':
      return {
        ...state,
        wallet: {
          ...action.payload,
          isConnecting: false,
          error: undefined
        }
      };

    case 'WALLET_CONNECT_ERROR':
      return {
        ...state,
        wallet: {
          ...state.wallet,
          isConnecting: false,
          error: action.payload
        }
      };

    case 'WALLET_DISCONNECT':
      return {
        ...state,
        wallet: {
          isConnected: false,
          isConnecting: false
        },
        tokens: {
          ...state.tokens,
          balances: DEFAULT_TOKENS
        }
      };

    case 'WALLET_UPDATE_BALANCE':
      return {
        ...state,
        wallet: {
          ...state.wallet,
          balance: action.payload.balance
        },
        tokens: {
          ...state.tokens,
          balances: action.payload.tokenBalances || state.tokens.balances
        }
      };

    case 'TOKENS_UPDATE_BALANCES':
      return {
        ...state,
        tokens: {
          ...state.tokens,
          balances: action.payload
        }
      };

    case 'TOKENS_ADD_CUSTOM':
      return {
        ...state,
        tokens: {
          ...state.tokens,
          customTokens: [...state.tokens.customTokens, action.payload],
          balances: [...state.tokens.balances, action.payload]
        }
      };

    case 'TRANSACTION_ADD':
      return {
        ...state,
        transactions: {
          ...state.transactions,
          pending: action.payload.status === 'pending'
            ? [...state.transactions.pending, action.payload]
            : state.transactions.pending,
          history: [action.payload, ...state.transactions.history]
        }
      };

    case 'TRANSACTION_UPDATE':
      const updatedPending = state.transactions.pending.map(tx =>
        tx.id === action.payload.id ? { ...tx, ...action.payload.updates } : tx
      );
      const updatedHistory = state.transactions.history.map(tx =>
        tx.id === action.payload.id ? { ...tx, ...action.payload.updates } : tx
      );

      return {
        ...state,
        transactions: {
          ...state.transactions,
          pending: action.payload.updates.status !== 'pending'
            ? updatedPending.filter(tx => tx.id !== action.payload.id)
            : updatedPending,
          history: updatedHistory
        }
      };

    case 'NETWORK_SWITCH_START':
      return {
        ...state,
        network: {
          ...state.network,
          isConnecting: true
        }
      };

    case 'NETWORK_SWITCH_SUCCESS':
      return {
        ...state,
        network: {
          ...state.network,
          current: action.payload,
          isConnecting: false
        }
      };

    case 'NETWORK_UPDATE_GAS_PRICE':
      return {
        ...state,
        network: {
          ...state.network,
          gasPrice: action.payload
        }
      };

    case 'SETTINGS_UPDATE':
      return {
        ...state,
        settings: {
          ...state.settings,
          ...action.payload
        }
      };

    case 'UI_SET_MODAL':
      return {
        ...state,
        ui: {
          ...state.ui,
          activeModal: action.payload
        }
      };

    case 'UI_TOGGLE_SIDEBAR':
      return {
        ...state,
        ui: {
          ...state.ui,
          sidebarOpen: !state.ui.sidebarOpen
        }
      };

    case 'UI_ADD_NOTIFICATION':
      return {
        ...state,
        ui: {
          ...state.ui,
          notifications: [
            ...state.ui.notifications,
            {
              id: Date.now().toString(),
              type: action.payload.type as any,
              message: action.payload.message,
              timestamp: new Date()
            }
          ]
        }
      };

    case 'UI_REMOVE_NOTIFICATION':
      return {
        ...state,
        ui: {
          ...state.ui,
          notifications: state.ui.notifications.filter(n => n.id !== action.payload)
        }
      };

    default:
      return state;
  }
}

// Context
interface BlockchainContextType {
  state: BlockchainState;
  dispatch: React.Dispatch<BlockchainAction>;
}

const BlockchainContext = createContext<BlockchainContextType | undefined>(undefined);

// Provider component
interface BlockchainStateProviderProps {
  children: ReactNode;
}

export function BlockchainStateProvider({ children }: BlockchainStateProviderProps) {
  const [state, dispatch] = useReducer(blockchainReducer, initialState);

  // Auto-refresh functionality
  useEffect(() => {
    if (!state.settings.autoRefresh || !state.wallet.isConnected) return;

    const interval = setInterval(() => {
      // Auto-refresh balances and gas prices
      dispatch({ type: 'UI_ADD_NOTIFICATION', payload: { type: 'info', message: 'Refreshing data...' } });
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [state.settings.autoRefresh, state.wallet.isConnected]);

  // Auto-remove notifications
  useEffect(() => {
    const timer = setTimeout(() => {
      if (state.ui.notifications.length > 0) {
        const oldestNotification = state.ui.notifications[0];
        dispatch({ type: 'UI_REMOVE_NOTIFICATION', payload: oldestNotification.id });
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [state.ui.notifications]);

  return (
    <BlockchainContext.Provider value={{ state, dispatch }}>
      {children}
    </BlockchainContext.Provider>
  );
}

// Custom hook to use blockchain state
export function useBlockchainState() {
  const context = useContext(BlockchainContext);
  if (context === undefined) {
    throw new Error('useBlockchainState must be used within a BlockchainStateProvider');
  }
  return context;
}

// Convenience hooks
export function useWalletState() {
  const { state } = useBlockchainState();
  return state.wallet;
}

export function useTokenBalances() {
  const { state } = useBlockchainState();
  return state.tokens.balances;
}

export function useNetworkState() {
  const { state } = useBlockchainState();
  return state.network;
}

export function useTransactionState() {
  const { state } = useBlockchainState();
  return state.transactions;
}

export function useUIState() {
  const { state } = useBlockchainState();
  return state.ui;
}