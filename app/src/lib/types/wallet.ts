// Wallet-related TypeScript interfaces and types

export interface WalletInfo {
  address: string
  balance: string // in wei
  balanceFormatted: string // in ETH/CROSS
  isConnected: boolean
  network?: string
  lastUpdated: Date
}

export interface Transaction {
  hash: string
  blockNumber: string
  timeStamp: string
  from: string
  to: string
  value: string
  gas: string
  gasPrice: string
  isError: string
  txreceipt_status: string
  input: string
  contractAddress: string
  cumulativeGasUsed: string
  gasUsed: string
  confirmations: string
}

export interface TokenBalance {
  contractAddress: string
  tokenName: string
  tokenSymbol: string
  tokenDecimal: string
  balance: string
  balanceFormatted: string
}

export interface CrossscanApiResponse<T> {
  status: string
  message: string
  result: T
}

export interface WalletConnectionState {
  isConnecting: boolean
  isConnected: boolean
  address: string | null
  error: string | null
}

export interface WalletStats {
  totalTransactions: number
  totalValue: string
  averageGasUsed: string
  lastTransactionTime: string
}