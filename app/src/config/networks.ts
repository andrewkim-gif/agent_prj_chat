import { crossMainnet, crossTestnet } from '@to-nexus/sdk'

export interface NetworkConfig {
  id: string
  name: string
  displayName: string
  chainId: number
  rpcUrl: string
  blockExplorer: string
  nativeCurrency: {
    name: string
    symbol: string
    decimals: number
  }
  testnet: boolean
  crossSdkNetwork: unknown // crossMainnet | crossTestnet from @to-nexus/sdk
  icon?: string
}

export const NETWORK_CONFIGS: Record<string, NetworkConfig> = {
  'cross-mainnet': {
    id: 'cross-mainnet',
    name: 'cross-mainnet',
    displayName: 'Cross Mainnet',
    chainId: 4157,
    rpcUrl: 'https://rpc.crosstoken.io',
    blockExplorer: 'https://crossscan.io',
    nativeCurrency: {
      name: 'Cross',
      symbol: 'CROSS',
      decimals: 18
    },
    testnet: false,
    crossSdkNetwork: crossMainnet,
    icon: '🌐'
  },
  'cross-testnet': {
    id: 'cross-testnet',
    name: 'cross-testnet',
    displayName: 'Cross Testnet',
    chainId: 4158, // Testnet chain ID (to be confirmed)
    rpcUrl: 'https://rpc-testnet.crosstoken.io',
    blockExplorer: 'https://testnet.crossscan.io',
    nativeCurrency: {
      name: 'Cross Test',
      symbol: 'tCROSS',
      decimals: 18
    },
    testnet: true,
    crossSdkNetwork: crossTestnet,
    icon: '🧪'
  }
}

export const DEFAULT_NETWORK = 'cross-mainnet'
export const SUPPORTED_NETWORKS = Object.keys(NETWORK_CONFIGS)

// Helper functions
export function getNetworkConfig(networkId: string): NetworkConfig | null {
  return NETWORK_CONFIGS[networkId] || null
}

export function isValidNetwork(networkId: string): boolean {
  return SUPPORTED_NETWORKS.includes(networkId)
}

export function getNetworkByChainId(chainId: number): NetworkConfig | null {
  return Object.values(NETWORK_CONFIGS).find(config => config.chainId === chainId) || null
}

export function getNetworkWarnings(networkId: string): string[] {
  const config = getNetworkConfig(networkId)
  const warnings: string[] = []

  if (config?.testnet) {
    warnings.push('이 네트워크의 토큰은 실제 가치가 없습니다')
    warnings.push('테스트 목적으로만 사용하세요')
    warnings.push('실제 거래는 메인넷을 사용하세요')
  }

  return warnings
}

export function validateNetworkOperation(
  operation: 'token-creation' | 'wallet-connect' | 'transaction',
  networkId: string
): boolean {
  const config = getNetworkConfig(networkId)
  if (!config) return false

  // Additional validation per operation type
  switch (operation) {
    case 'token-creation':
      return config.crossSdkNetwork !== undefined
    case 'wallet-connect':
      return SUPPORTED_NETWORKS.includes(networkId)
    default:
      return true
  }
}