// Transaction types based on cross-wallet-desktop patterns

export interface TokenTransaction {
  amount?: string;
  blockNumber?: number;
  chainId?: number;
  from?: string;
  fromAlias?: string;
  gasPrice?: number;
  gasUsed?: number;
  logIndex?: number;
  maxFeePerGas?: number;
  method?: number[];
  methodAlias?: string;
  nonce?: number;
  removed?: boolean;
  status?: string;
  timestamp?: number;
  to?: string;
  toAlias?: string;
  token?: string;
  tx?: string;
  txIndex?: number;
}

export interface TransactionHistoryProps {
  className?: string;
  symbol: string;
  address: string;
  tokenAddress: string;
  chainId: number;
  deployed: boolean;
  transactions?: TokenTransaction[];
  isLoading?: boolean;
}

export interface TransactionItemProps {
  className?: string;
  transaction: TokenTransaction;
  symbol: string;
  tokenAddress: string;
  chainId: number;
  currentWalletAddress: string;
}

export type TransactionType = 'Send' | 'Receive' | 'Bridge In' | 'Bridge Out';
export type TransactionStatus = 'pending' | 'success' | 'failed' | 'fail';