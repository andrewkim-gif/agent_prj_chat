# Cross SDK Component Architecture Specification

## 🏗️ Component Hierarchy & Dependencies

### Core Architecture Pattern
```
┌─────────────────────────────────────────┐
│             ARA Chat App                │
├─────────────────────────────────────────┤
│  CrossSDKProvider (Global State)       │
├─────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────────┐   │
│  │ Chat Core   │  │ Blockchain UI   │   │
│  │ (Existing)  │  │ (New Layer)     │   │
│  └─────────────┘  └─────────────────┘   │
└─────────────────────────────────────────┘
```

## 📂 File Structure

```
src/
├── components/
│   ├── chat/ (existing)
│   │   ├── ChatInterface.tsx
│   │   ├── blockchain/
│   │   │   ├── BlockchainChatProcessor.tsx
│   │   │   └── BlockchainMessageItem.tsx
│   │   └── ...
│   └── blockchain/ (new comprehensive layer)
│       ├── index.ts
│       ├── wallet/
│       │   ├── index.ts
│       │   ├── WalletDashboard.tsx
│       │   ├── WalletSelector.tsx
│       │   ├── AccountInfo.tsx
│       │   ├── WalletSwitcher.tsx
│       │   └── hooks/
│       │       ├── useWallet.ts
│       │       └── useWalletState.ts
│       ├── transactions/
│       │   ├── index.ts
│       │   ├── TransactionBuilder.tsx
│       │   ├── TransactionHistory.tsx
│       │   ├── TransactionStatus.tsx
│       │   ├── TransactionPreview.tsx
│       │   ├── GasEstimator.tsx
│       │   └── hooks/
│       │       ├── useTransaction.ts
│       │       └── useTransactionHistory.ts
│       ├── tokens/
│       │   ├── index.ts
│       │   ├── TokenPortfolio.tsx
│       │   ├── TokenSelector.tsx
│       │   ├── TokenTransfer.tsx
│       │   ├── TokenBalance.tsx
│       │   ├── AddTokenModal.tsx
│       │   └── hooks/
│       │       ├── useTokenBalance.ts
│       │       └── useTokenList.ts
│       ├── network/
│       │   ├── index.ts
│       │   ├── NetworkSwitcher.tsx
│       │   ├── NetworkInfo.tsx
│       │   ├── NetworkStatus.tsx
│       │   ├── GasTracker.tsx
│       │   └── hooks/
│       │       ├── useNetwork.ts
│       │       └── useGasPrice.ts
│       ├── bridge/
│       │   ├── index.ts
│       │   ├── BridgeInterface.tsx
│       │   ├── BridgeSelector.tsx
│       │   ├── CrossChainHistory.tsx
│       │   ├── BridgeStatus.tsx
│       │   └── hooks/
│       │       ├── useBridge.ts
│       │       └── useCrossChain.ts
│       ├── analytics/
│       │   ├── index.ts
│       │   ├── PortfolioChart.tsx
│       │   ├── TransactionAnalytics.tsx
│       │   ├── GasAnalytics.tsx
│       │   └── hooks/
│       │       └── useAnalytics.ts
│       ├── developer/
│       │   ├── index.ts
│       │   ├── SDKStatus.tsx
│       │   ├── ConfigurationPanel.tsx
│       │   ├── DebugConsole.tsx
│       │   ├── EventLogger.tsx
│       │   └── hooks/
│       │       └── useSDKDebug.ts
│       ├── security/
│       │   ├── index.ts
│       │   ├── SecurityPanel.tsx
│       │   ├── TransactionSimulator.tsx
│       │   ├── AddressValidator.tsx
│       │   └── hooks/
│       │       └── useSecurity.ts
│       └── layout/
│           ├── index.ts
│           ├── BlockchainSidebar.tsx
│           ├── BlockchainModal.tsx
│           ├── BlockchainBottomSheet.tsx
│           └── BlockchainTabs.tsx
├── providers/
│   ├── CrossSDKProvider.tsx (existing, enhanced)
│   └── BlockchainStateProvider.tsx (new)
├── hooks/
│   ├── blockchain/
│   │   ├── index.ts
│   │   ├── useBlockchainState.ts
│   │   ├── useCrossSDK.ts
│   │   └── useBlockchainCommands.ts
│   └── ...
├── types/
│   ├── blockchain.ts
│   └── crosssdk.ts
└── utils/
    ├── blockchain/
    │   ├── formatters.ts
    │   ├── validators.ts
    │   ├── converters.ts
    │   └── constants.ts
    └── ...
```

## 🔧 Core Type Definitions

```typescript
// types/blockchain.ts
export interface WalletState {
  isConnected: boolean;
  address?: string;
  chainId?: number;
  balance?: string;
  symbol?: string;
  type?: 'metamask' | 'cross' | 'walletconnect';
}

export interface TokenBalance {
  symbol: string;
  balance: string;
  decimals: number;
  contractAddress?: string;
  value?: number; // USD value
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
}

export interface NetworkInfo {
  chainId: number;
  name: string;
  symbol: string;
  rpcUrl: string;
  blockExplorer?: string;
  isTestnet?: boolean;
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
}
```

## 🎯 Component Specifications

### 1. WalletDashboard Component

```typescript
// components/blockchain/wallet/WalletDashboard.tsx
interface WalletDashboardProps {
  compact?: boolean;
  showActions?: boolean;
  className?: string;
}

export function WalletDashboard({
  compact = false,
  showActions = true,
  className
}: WalletDashboardProps) {
  const { wallet, tokens, isLoading } = useWallet();

  return (
    <Card className={cn("blockchain-card", className)}>
      {/* Wallet connection status */}
      {/* Token balances list */}
      {/* Quick actions (send, receive, swap) */}
      {/* Network indicator */}
    </Card>
  );
}
```

### 2. TransactionBuilder Component

```typescript
// components/blockchain/transactions/TransactionBuilder.tsx
interface TransactionBuilderProps {
  defaultToken?: string;
  defaultAmount?: string;
  defaultRecipient?: string;
  onTransaction?: (tx: Transaction) => void;
  onCancel?: () => void;
}

export function TransactionBuilder({
  defaultToken,
  defaultAmount,
  defaultRecipient,
  onTransaction,
  onCancel
}: TransactionBuilderProps) {
  const { sendTransaction, estimateGas, validateAddress } = useTransaction();

  return (
    <div className="space-y-4">
      {/* Token selector */}
      {/* Amount input with balance display */}
      {/* Recipient address input with ENS support */}
      {/* Gas estimation and speed selector */}
      {/* Transaction preview */}
      {/* Action buttons */}
    </div>
  );
}
```

### 3. NetworkSwitcher Component

```typescript
// components/blockchain/network/NetworkSwitcher.tsx
interface NetworkSwitcherProps {
  variant?: 'dropdown' | 'modal' | 'inline';
  showTestnets?: boolean;
  onNetworkChange?: (network: NetworkInfo) => void;
}

export function NetworkSwitcher({
  variant = 'dropdown',
  showTestnets = false,
  onNetworkChange
}: NetworkSwitcherProps) {
  const { currentNetwork, supportedNetworks, switchNetwork } = useNetwork();

  return (
    <div>
      {/* Current network display */}
      {/* Network selection UI based on variant */}
      {/* Network status indicators */}
    </div>
  );
}
```

## 🔄 State Management Architecture

### Global State Provider

```typescript
// providers/BlockchainStateProvider.tsx
interface BlockchainState {
  wallet: WalletState;
  transactions: {
    pending: Transaction[];
    history: Transaction[];
    filters: TransactionFilters;
  };
  tokens: {
    balances: TokenBalance[];
    watchlist: string[];
    customTokens: Token[];
  };
  network: {
    current: NetworkInfo;
    supported: NetworkInfo[];
    gasPrice: string;
  };
  bridge: {
    transactions: BridgeTransaction[];
    routes: BridgeRoute[];
  };
  settings: {
    debugMode: boolean;
    gasStrategy: 'slow' | 'standard' | 'fast';
    slippageTolerance: number;
  };
}

export const BlockchainStateProvider = ({ children }) => {
  const [state, dispatch] = useReducer(blockchainReducer, initialState);

  return (
    <BlockchainContext.Provider value={{ state, dispatch }}>
      {children}
    </BlockchainContext.Provider>
  );
};
```

### Custom Hooks Pattern

```typescript
// hooks/blockchain/useWallet.ts
export function useWallet() {
  const { state, dispatch } = useBlockchainState();
  const { account, isConnected } = useAppKitAccount();

  const connectWallet = async (type: WalletType) => {
    // Connection logic
  };

  const disconnectWallet = async () => {
    // Disconnection logic
  };

  const switchWallet = async (type: WalletType) => {
    // Wallet switching logic
  };

  return {
    wallet: state.wallet,
    tokens: state.tokens.balances,
    isConnected,
    connectWallet,
    disconnectWallet,
    switchWallet
  };
}
```

## 🎨 UI Pattern Library

### Base Component Patterns

```typescript
// Shared blockchain UI patterns
export const BlockchainCard = ({ children, ...props }) => (
  <Card className="blockchain-card" {...props}>
    {children}
  </Card>
);

export const StatusBadge = ({ status, children }) => (
  <Badge className={cn(
    "status-badge",
    {
      'status-connected': status === 'connected',
      'status-pending': status === 'pending',
      'status-failed': status === 'failed'
    }
  )}>
    {children}
  </Badge>
);

export const BlockchainButton = ({ variant = 'primary', children, ...props }) => (
  <Button
    className={cn("blockchain-button", `blockchain-button--${variant}`)}
    {...props}
  >
    {children}
  </Button>
);
```

### Animation Patterns

```typescript
// Shared animation utilities
export const slideInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

export const fadeInScale = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 }
};
```

## 📱 Layout Integration

### Sidebar Integration (Desktop)

```typescript
// layout/BlockchainSidebar.tsx
export function BlockchainSidebar() {
  return (
    <aside className="blockchain-sidebar">
      <WalletDashboard compact />
      <NetworkSwitcher variant="inline" />
      <TokenPortfolio compact />
      <QuickActions />
    </aside>
  );
}
```

### Modal Integration (Mobile)

```typescript
// layout/BlockchainModal.tsx
export function BlockchainModal({ type, ...props }) {
  const components = {
    wallet: WalletSelector,
    transaction: TransactionBuilder,
    network: NetworkSwitcher,
    history: TransactionHistory
  };

  const Component = components[type];

  return (
    <Dialog {...props}>
      <DialogContent>
        <Component />
      </DialogContent>
    </Dialog>
  );
}
```

## 🔗 Chat Integration Points

### Enhanced Command Processing

```typescript
// Enhanced blockchain command patterns
const BLOCKCHAIN_COMMANDS = {
  WALLET: {
    connect: /지갑\s*연결/i,
    info: /지갑\s*정보/i,
    switch: /지갑\s*바꿔/i,
    disconnect: /지갑\s*해제/i
  },
  TOKENS: {
    portfolio: /토큰\s*보여/i,
    transfer: /(\d+(?:\.\d+)?)\s*(\w+)\s*보내/i,
    add: /토큰\s*추가/i,
    swap: /(\w+)\s*(\w+)\s*스왑/i
  },
  NETWORK: {
    switch: /(cross|bsc|ethereum)\s*바꿔/i,
    info: /네트워크\s*정보/i,
    gas: /가스\s*비/i
  },
  BRIDGE: {
    transfer: /(\w+)\s*브릿지/i,
    status: /브릿지\s*상태/i,
    history: /브릿지\s*내역/i
  },
  ANALYTICS: {
    portfolio: /포트폴리오\s*분석/i,
    transactions: /거래\s*분석/i,
    gas: /가스\s*분석/i
  }
};
```

### Message Response Integration

```typescript
// Enhanced blockchain message responses
export function renderBlockchainResponse(command: BlockchainCommand) {
  switch (command.type) {
    case 'wallet_info':
      return <WalletDashboard compact />;
    case 'token_portfolio':
      return <TokenPortfolio />;
    case 'transaction_builder':
      return <TransactionBuilder {...command.params} />;
    case 'network_info':
      return <NetworkInfo />;
    case 'bridge_interface':
      return <BridgeInterface {...command.params} />;
    default:
      return <BlockchainMessageItem message={command.response} />;
  }
}
```

This architecture provides a comprehensive, scalable foundation for implementing all Cross SDK features with clean separation of concerns, reusable components, and seamless chat integration.