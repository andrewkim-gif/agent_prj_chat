// Cross Wallet Desktop에서 사용하는 토큰 목록
// 모든 지원되는 토큰들의 기본 정보

import type { TokenWithChainInfo } from '@/types/crossWallet';

export interface BaseTokenInfo {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  chainId: number;
  image?: string;
  deployed: boolean;
  category?: string;
  enabled?: boolean;
  required?: boolean;
  sortingValue?: number;
}

// Cross 체인 (체인 ID 1020)의 주요 토큰들 - 실제 crossscan.io 데이터 기반
export const CROSS_CHAIN_TOKENS: BaseTokenInfo[] = [
  {
    address: "0x52D3256c7d6C7522C6D593b2aC662dBF610E6813", // Real CROSS token from crossscan
    name: "CrossDEX Wrapped CROSS",
    symbol: "CROSS",
    decimals: 18,
    chainId: 1020,
    image: "/tokens/cross.png",
    deployed: true,
    category: "native",
    enabled: true,
    required: true,
    sortingValue: 1
  },
  {
    address: "0x5B1579a758916560F00212B78a7AF728eAA0ffa9", // Real MGT (MGold) token from crossscan
    name: "MGold",
    symbol: "MGT",
    decimals: 18,
    chainId: 1020,
    image: "/tokens/mgt.png",
    deployed: true,
    category: "token",
    enabled: true,
    required: false,
    sortingValue: 2
  },
  {
    address: "0xe9013a5231BEB721f4F801F2d07516b8ca19d953", // Real ZENY token from crossscan
    name: "Zeny",
    symbol: "ZENY",
    decimals: 18,
    chainId: 1020,
    image: "/tokens/zeny.png",
    deployed: true,
    category: "token",
    enabled: true,
    required: false,
    sortingValue: 3
  },
  {
    address: "0x3456789012345678901234567890123456789012", // Mock USDT address
    name: "Tether USD",
    symbol: "USDT",
    decimals: 6,
    chainId: 1020,
    image: "/tokens/usdt.png",
    deployed: true,
    category: "stablecoin",
    enabled: true,
    required: false,
    sortingValue: 4
  },
  {
    address: "0x4567890123456789012345678901234567890123", // Mock USDC address
    name: "USD Coin",
    symbol: "USDC",
    decimals: 6,
    chainId: 1020,
    image: "/tokens/usdc.png",
    deployed: true,
    category: "stablecoin",
    enabled: true,
    required: false,
    sortingValue: 5
  },
  {
    address: "0x3Ead8192316d86Bc6Ea5Edaf1Ee98eA785C57047", // Real BNGO (Bingo) token - most popular with 40k+ holders
    name: "Bingo",
    symbol: "BNGO",
    decimals: 18,
    chainId: 1020,
    image: "/tokens/bngo.png",
    deployed: true,
    category: "token",
    enabled: true,
    required: false,
    sortingValue: 6
  },
  {
    address: "0x6789012345678901234567890123456789012345", // Mock SHOUT address
    name: "Shout Token",
    symbol: "SHOUT",
    decimals: 18,
    chainId: 1020,
    image: "/tokens/shout.png",
    deployed: true,
    category: "token",
    enabled: true,
    required: false,
    sortingValue: 7
  },
  {
    address: "0x7890123456789012345678901234567890123456", // Mock DeFi token
    name: "DeFi Coin",
    symbol: "DEFI",
    decimals: 18,
    chainId: 1020,
    image: "/tokens/defi.png",
    deployed: true,
    category: "defi",
    enabled: true,
    required: false,
    sortingValue: 8
  },
  {
    address: "0x8901234567890123456789012345678901234567", // Mock Gaming token
    name: "Game Token",
    symbol: "GAME",
    decimals: 18,
    chainId: 1020,
    image: "/tokens/game.png",
    deployed: true,
    category: "gaming",
    enabled: true,
    required: false,
    sortingValue: 9
  },
  {
    address: "0x9012345678901234567890123456789012345678", // Mock NFT token
    name: "NFT Coin",
    symbol: "NFTC",
    decimals: 18,
    chainId: 1020,
    image: "/tokens/nftc.png",
    deployed: true,
    category: "nft",
    enabled: true,
    required: false,
    sortingValue: 10
  }
];

// Ethereum 메인넷 (체인 ID 1)의 주요 토큰들
export const ETHEREUM_TOKENS: BaseTokenInfo[] = [
  {
    address: "0x0000000000000000000000000000000000000000", // Native ETH
    name: "Ethereum",
    symbol: "ETH",
    decimals: 18,
    chainId: 1,
    image: "/tokens/eth.png",
    deployed: true,
    category: "native",
    enabled: true,
    required: true,
    sortingValue: 10
  },
  {
    address: "0xA0b86a33E6435b6fDBb5ffA0F463A9dd0bDA37C8", // BTC
    name: "Bitcoin",
    symbol: "BTC",
    decimals: 8,
    chainId: 1,
    image: "/tokens/btc.png",
    deployed: true,
    category: "token",
    enabled: true,
    required: false,
    sortingValue: 11
  },
  {
    address: "0xdAC17F958D2ee523a2206206994597C13D831ec7", // USDT
    name: "Tether USD",
    symbol: "USDT",
    decimals: 6,
    chainId: 1,
    image: "/tokens/usdt.png",
    deployed: true,
    category: "stablecoin",
    enabled: true,
    required: false,
    sortingValue: 12
  },
  {
    address: "0xA0b86a33E6435b6fDBb5ffA0F463A9dd0bDA37C9", // USDC
    name: "USD Coin",
    symbol: "USDC",
    decimals: 6,
    chainId: 1,
    image: "/tokens/usdc.png",
    deployed: true,
    category: "stablecoin",
    enabled: true,
    required: false,
    sortingValue: 13
  }
];

// 모든 토큰을 합친 목록
export const ALL_TOKENS: BaseTokenInfo[] = [
  ...CROSS_CHAIN_TOKENS,
  ...ETHEREUM_TOKENS
];

// 토큰 목록을 TokenWithChainInfo 형태로 변환하는 함수
export function convertToTokenWithChainInfo(
  baseTokens: BaseTokenInfo[],
  currency: string = 'USD'
): TokenWithChainInfo[] {
  return baseTokens.map(token => ({
    ...token,
    balance: '0', // 기본값
    totalCurrencyPrice: '0', // 기본값
    currency,
    stats: {
      price: '0', // Mock price
      convertedPrice: '0', // Mock converted price
      percentChange24h: 0, // Mock percent change
      volume24h: '0',
      marketCap: '0'
    },
    chainInfo: {
      chainId: token.chainId,
      name: token.chainId === 1020 ? 'Cross Chain' : 'Ethereum',
      symbol: token.chainId === 1020 ? 'CROSS' : 'ETH',
      rpcUrl: token.chainId === 1020 ? 'https://rpc.crosschain.network' : 'https://eth.llamarpc.com',
      blockExplorerUrl: token.chainId === 1020 ? 'https://scan.crosschain.network' : 'https://etherscan.io',
      nativeCurrency: {
        name: token.chainId === 1020 ? 'Cross' : 'Ethereum',
        symbol: token.chainId === 1020 ? 'CROSS' : 'ETH',
        decimals: 18
      },
      enabled: true,
      testnet: false,
      icon: token.chainId === 1020 ? '/chains/cross.png' : '/chains/ethereum.png'
    }
  }));
}

// 모든 토큰을 TokenWithChainInfo로 가져오는 함수
export function getAllTokensWithChainInfo(currency: string = 'USD'): TokenWithChainInfo[] {
  return convertToTokenWithChainInfo(ALL_TOKENS, currency);
}

// 특정 체인의 토큰만 가져오는 함수
export function getTokensByChain(chainId: number, currency: string = 'USD'): TokenWithChainInfo[] {
  const filteredTokens = ALL_TOKENS.filter(token => token.chainId === chainId);
  return convertToTokenWithChainInfo(filteredTokens, currency);
}