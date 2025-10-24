// Cross Wallet 통합을 위한 타입 정의

export type Currency = 'AUD' | 'CAD' | 'CHF' | 'EUR' | 'GBP' | 'KRW' | 'USD';

export interface Account {
  id: string;
  name: string;
  avatar?: string;
  address: string;
  isSelected: boolean;
  walletType: 'privateKey' | 'mnemonic';
  lastActivity?: number;
}

export interface TokenStats {
  price?: string;
  convertedPrice?: string;
  percentChange24h?: string;
  marketCap?: string;
  volume24h?: string;
}

export interface TokenWithChainInfo {
  id: string;
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  balance: string;
  image?: string;
  chainId: number;
  deployed?: boolean;
  stats?: TokenStats;
  totalCurrencyPrice?: string;
  currency?: Currency;
}

export interface CrossWalletState {
  // 계정 관리
  accounts: Account[];
  currentAccount: Account | null;

  // 토큰 및 잔액
  tokens: TokenWithChainInfo[];
  isLoadingBalance: boolean;
  lastBalanceUpdate: number;

  // UI 상태
  isShowTotalAssets: boolean;
  currency: Currency;
  theme: 'light' | 'dark';

  // 연결 상태
  isConnected: boolean;
  connectionStatus: 'connected' | 'disconnected' | 'connecting';
}

export interface CrossWalletActions {
  // 계정 관리
  setCurrentAccount: (account: Account) => void;
  addAccount: (account: Account) => void;
  removeAccount: (accountId: string) => void;

  // 토큰 관리
  updateTokens: (tokens: TokenWithChainInfo[]) => void;
  setLoadingBalance: (loading: boolean) => void;

  // UI 설정
  toggleShowTotalAssets: () => void;
  setCurrency: (currency: Currency) => void;
  setTheme: (theme: 'light' | 'dark') => void;

  // 연결 관리
  setConnectionStatus: (status: 'connected' | 'disconnected' | 'connecting') => void;

  // 초기화
  reset: () => void;
}

export interface SendTokenParams {
  fromAddress: string;
  toAddress: string;
  tokenAddress: string;
  amount: string;
  decimals: number;
}

export interface Transaction {
  hash: string;
  status: 'pending' | 'confirmed' | 'failed';
  fromAddress: string;
  toAddress: string;
  tokenAddress: string;
  amount: string;
  timestamp: number;
}

export interface CrossWalletContextValue extends CrossWalletState, CrossWalletActions {
  // 통합 액션들
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  refreshBalance: () => Promise<void>;
  sendToken: (params: SendTokenParams) => Promise<string>;

  // 계산된 값들
  totalAssetsValue: string;
  formattedTotalAssets: string;
}