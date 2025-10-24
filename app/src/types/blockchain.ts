// Blockchain Types for Cross SDK Integration

export type WalletType = 'metamask' | 'cross' | 'walletconnect' | 'hardware';

export interface WalletState {
  isConnected: boolean;
  address?: string;
  chainId?: number;
  balance?: string;
  symbol?: string;
  type?: WalletType;
  ensName?: string;
  isConnecting?: boolean;
  error?: string;
}

export interface TokenBalance {
  symbol: string;
  name: string;
  balance: string;
  decimals: number;
  contractAddress?: string;
  value?: number; // USD value
  price?: number; // USD price per token
  change24h?: number; // 24h price change percentage
  logoUrl?: string;
}

export interface Transaction {
  id: string;
  hash?: string;
  from: string;
  to: string;
  amount: string;
  symbol: string;
  status: 'pending' | 'confirmed' | 'failed';
  timestamp: Date;
  gasUsed?: string;
  gasPrice?: string;
  blockNumber?: number;
  nonce?: number;
  type?: 'send' | 'receive' | 'swap' | 'bridge';
  description?: string;
}

export interface NetworkInfo {
  chainId: number;
  name: string;
  symbol: string;
  rpcUrl: string;
  blockExplorer?: string;
  isTestnet?: boolean;
  logoUrl?: string;
  gasPrice?: string;
  blockTime?: number;
  isConnected?: boolean;
}

export interface BridgeTransaction {
  id: string;
  sourceChain: number;
  targetChain: number;
  sourceHash?: string;
  targetHash?: string;
  amount: string;
  symbol: string;
  status: 'pending' | 'bridging' | 'completed' | 'failed';
  estimatedTime?: number;
  route?: string;
  fees?: {
    gas: string;
    bridge: string;
    total: string;
  };
}

export interface GasInfo {
  slow: string;
  standard: string;
  fast: string;
  instant: string;
  estimated?: string;
}

export interface SecuritySettings {
  spendingLimits: {
    daily?: string;
    weekly?: string;
    monthly?: string;
  };
  trustedAddresses: string[];
  requireConfirmation: boolean;
  simulateTransactions: boolean;
}

// Chat command interfaces
export interface BlockchainCommand {
  type: string;
  confidence: number;
  params?: Record<string, any>;
  originalMessage: string;
}

export interface BlockchainResponse {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  data?: {
    actionType: string;
    status?: 'pending' | 'success' | 'failed';
    [key: string]: any;
  };
}

// Hook return types
export interface UseWalletReturn {
  wallet: WalletState;
  tokens: TokenBalance[];
  isLoading: boolean;
  connectWallet: (type: WalletType) => Promise<void>;
  disconnectWallet: () => Promise<void>;
  switchWallet: (type: WalletType) => Promise<void>;
  refreshBalances: () => Promise<void>;
}

export interface UseTransactionReturn {
  transactions: Transaction[];
  pending: Transaction[];
  isLoading: boolean;
  sendTransaction: (params: SendTransactionParams) => Promise<string>;
  estimateGas: (params: SendTransactionParams) => Promise<string>;
  getTransactionHistory: () => Promise<Transaction[]>;
}

export interface SendTransactionParams {
  to: string;
  amount: string;
  symbol: string;
  gasPrice?: string;
  gasLimit?: string;
  data?: string;
}

export interface UseNetworkReturn {
  currentNetwork: NetworkInfo;
  supportedNetworks: NetworkInfo[];
  isLoading: boolean;
  switchNetwork: (chainId: number) => Promise<void>;
  addNetwork: (network: NetworkInfo) => Promise<void>;
  getGasPrice: () => Promise<GasInfo>;
}

// Component prop types
export interface WalletSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onWalletSelect?: (type: WalletType) => void;
  supportedWallets?: WalletType[];
}

export interface WalletDashboardProps {
  compact?: boolean;
  showActions?: boolean;
  className?: string;
  onActionClick?: (action: string) => void;
  onConnectWallet?: () => void;
}

export interface TransactionBuilderProps {
  defaultToken?: string;
  defaultAmount?: string;
  defaultRecipient?: string;
  onTransaction?: (tx: Transaction) => void;
  onCancel?: () => void;
  isOpen?: boolean;
}

export interface NetworkSwitcherProps {
  variant?: 'dropdown' | 'modal' | 'inline';
  showTestnets?: boolean;
  onNetworkChange?: (network: NetworkInfo) => void;
}

// Constants
export const SUPPORTED_NETWORKS: NetworkInfo[] = [
  {
    chainId: 4157,
    name: 'Cross Chain',
    symbol: 'CROSS',
    rpcUrl: 'https://rpc.crosschain.network',
    blockExplorer: 'https://crossscan.com',
    isTestnet: false,
    logoUrl: '/icons/cross-chain.svg'
  },
  {
    chainId: 56,
    name: 'BNB Smart Chain',
    symbol: 'BNB',
    rpcUrl: 'https://bsc-dataseed1.binance.org',
    blockExplorer: 'https://bscscan.com',
    isTestnet: false,
    logoUrl: '/icons/bnb-chain.svg'
  },
  {
    chainId: 1,
    name: 'Ethereum',
    symbol: 'ETH',
    rpcUrl: 'https://mainnet.infura.io/v3/',
    blockExplorer: 'https://etherscan.io',
    isTestnet: false,
    logoUrl: '/icons/ethereum.svg'
  }
];

export const SUPPORTED_WALLETS: Array<{
  type: WalletType;
  name: string;
  description: string;
  icon: string;
  isAvailable: () => boolean;
}> = [
  {
    type: 'metamask',
    name: 'MetaMask',
    description: 'Connect with MetaMask wallet',
    icon: '/icons/metamask.svg',
    isAvailable: () => typeof window !== 'undefined' && !!window.ethereum?.isMetaMask
  },
  {
    type: 'cross',
    name: 'Cross Wallet',
    description: 'Connect with Cross native wallet',
    icon: '/icons/cross-wallet.svg',
    isAvailable: () => {
      if (typeof window === 'undefined') return false;

      // Check multiple possible Cross Wallet object names
      const possibleNames = ['crossWallet', 'cross', 'Cross', 'CrossWallet'];

      for (const name of possibleNames) {
        const wallet = (window as any)[name];
        if (wallet && typeof wallet.request === 'function') {
          return true;
        }
      }

      return false;
    }
  },
  {
    type: 'walletconnect',
    name: 'WalletConnect',
    description: 'Connect with QR code',
    icon: '/icons/walletconnect.svg',
    isAvailable: () => true
  },
  {
    type: 'hardware',
    name: 'Hardware Wallet',
    description: 'Connect Ledger or Trezor',
    icon: '/icons/hardware.svg',
    isAvailable: () => true
  }
];

export const DEFAULT_TOKENS: TokenBalance[] = [
  {
    symbol: 'CROSS',
    name: 'Cross Token',
    balance: '0',
    decimals: 18,
    logoUrl: '/icons/cross-token.svg'
  },
  {
    symbol: 'BNB',
    name: 'BNB',
    balance: '0',
    decimals: 18,
    logoUrl: '/icons/bnb.svg'
  },
  {
    symbol: 'ETH',
    name: 'Ethereum',
    balance: '0',
    decimals: 18,
    logoUrl: '/icons/ethereum.svg'
  }
];