// Cross Wallet SDK 타입 정의

export interface CrossWalletToken {
  address: string
  name: string
  symbol: string
  decimals: number
  logoUrl?: string
  chainId?: number
}

export interface CrossWalletPriceInfo {
  price: string
  percentChange24h: string
  volume24h?: string
  marketCap?: string
}

export interface CrossWalletAPI {
  // 지갑 연결 관련
  connect(): Promise<string>
  disconnect(): Promise<void>
  isConnected(): Promise<boolean>
  getAccount(): Promise<string>

  // 토큰 관련 - network-aware API
  getTokenList(options?: { chainId?: number }): Promise<CrossWalletToken[]>
  getBalance(address: string, options?: { chainId?: number }): Promise<Record<string, string>>
  getTokenPrice(symbol: string, options?: { chainId?: number }): Promise<CrossWalletPriceInfo>

  // 거래 관련
  sendTransaction(params: {
    to: string
    value: string
    tokenAddress?: string
    chainId?: number
  }): Promise<string>

  // 네트워크 관련
  getChainId(): Promise<number>
  switchChain(chainId: number): Promise<void>
}

// Window 객체 확장
declare global {
  interface Window {
    cross?: CrossWalletAPI
  }
}

export {}