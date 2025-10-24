import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import {
  NETWORK_CONFIGS,
  DEFAULT_NETWORK,
  getNetworkConfig,
  isValidNetwork
} from '@/config/networks'

interface NetworkState {
  currentNetwork: string
  isConnected: boolean
  switchingNetwork: boolean
  availableNetworks: string[]
  networkError?: string
  preferredNetwork?: string
}

interface NetworkActions {
  switchNetwork: (networkId: string) => Promise<void>
  initializeNetwork: (networkId?: string) => Promise<void>
  refreshNetworkState: () => Promise<void>
  resetNetworkError: () => void
  setPreferredNetwork: (networkId: string) => void
  clearPreferredNetwork: () => void
  setSwitchingNetwork: (switching: boolean) => void
  setNetworkError: (error?: string) => void
  setConnected: (connected: boolean) => void
}

type NetworkStore = NetworkState & NetworkActions

export const useNetworkStore = create<NetworkStore>()(
  persist(
    (set, get) => ({
      // Initial state
      currentNetwork: DEFAULT_NETWORK,
      isConnected: false,
      switchingNetwork: false,
      availableNetworks: Object.keys(NETWORK_CONFIGS),
      networkError: undefined,
      preferredNetwork: undefined,

      // Actions
      switchNetwork: async (networkId: string) => {
        if (!isValidNetwork(networkId)) {
          set({ networkError: `Unsupported network: ${networkId}` })
          return
        }

        const currentState = get()
        if (currentState.currentNetwork === networkId) {
          return // Already on this network
        }

        try {
          set({ switchingNetwork: true, networkError: undefined })

          // Get network configuration
          const networkConfig = getNetworkConfig(networkId)
          if (!networkConfig) {
            throw new Error(`Network configuration not found: ${networkId}`)
          }

          // Update current network
          set({
            currentNetwork: networkId,
            preferredNetwork: networkId
          })

          // The actual SDK switching will be handled by the provider
          console.log(`Switched to network: ${networkConfig.displayName}`)

        } catch (error) {
          console.error('Failed to switch network:', error)
          set({
            networkError: error instanceof Error ? error.message : 'Failed to switch network'
          })
        } finally {
          set({ switchingNetwork: false })
        }
      },

      initializeNetwork: async (networkId?: string) => {
        try {
          const { preferredNetwork } = get()
          const targetNetwork = networkId || preferredNetwork || DEFAULT_NETWORK

          if (!isValidNetwork(targetNetwork)) {
            console.warn(`Invalid network ${targetNetwork}, falling back to default`)
            set({ currentNetwork: DEFAULT_NETWORK })
            return
          }

          set({
            currentNetwork: targetNetwork,
            networkError: undefined
          })

          console.log(`Initialized network: ${getNetworkConfig(targetNetwork)?.displayName}`)

        } catch (error) {
          console.error('Failed to initialize network:', error)
          set({
            currentNetwork: DEFAULT_NETWORK,
            networkError: error instanceof Error ? error.message : 'Failed to initialize network'
          })
        }
      },

      refreshNetworkState: async () => {
        try {
          const { currentNetwork } = get()
          const config = getNetworkConfig(currentNetwork)

          if (!config) {
            set({
              currentNetwork: DEFAULT_NETWORK,
              networkError: 'Current network configuration not found'
            })
            return
          }

          // Network state is valid, clear any errors
          set({ networkError: undefined })

        } catch (error) {
          console.error('Failed to refresh network state:', error)
          set({
            networkError: error instanceof Error ? error.message : 'Failed to refresh network state'
          })
        }
      },

      resetNetworkError: () => {
        set({ networkError: undefined })
      },

      setPreferredNetwork: (networkId: string) => {
        if (isValidNetwork(networkId)) {
          set({ preferredNetwork: networkId })
        }
      },

      clearPreferredNetwork: () => {
        set({ preferredNetwork: undefined })
      },

      setSwitchingNetwork: (switching: boolean) => {
        set({ switchingNetwork: switching })
      },

      setNetworkError: (error?: string) => {
        set({ networkError: error })
      },

      setConnected: (connected: boolean) => {
        set({ isConnected: connected })
      }
    }),
    {
      name: 'network-store',
      storage: createJSONStorage(() => localStorage),
      // Only persist user preferences, not connection state
      partialize: (state) => ({
        preferredNetwork: state.preferredNetwork,
        currentNetwork: state.currentNetwork
      })
    }
  )
)

// Convenience hooks
export const useCurrentNetwork = () => useNetworkStore(state => state.currentNetwork)
export const useNetworkConfig = () => {
  const currentNetwork = useCurrentNetwork()
  return getNetworkConfig(currentNetwork)
}
export const useIsTestnet = () => {
  const config = useNetworkConfig()
  return config?.testnet || false
}
export const useNetworkError = () => useNetworkStore(state => state.networkError)
export const useIsSwitchingNetwork = () => useNetworkStore(state => state.switchingNetwork)