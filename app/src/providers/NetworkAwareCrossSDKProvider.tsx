"use client"

import { useEffect, ReactNode, useCallback, useState } from 'react'
import {
  initCrossSdk,
  AccountController,
  ConnectionController,
  useAppKitAccount,
  useAppKitNetwork
} from '@to-nexus/sdk/react'
import { useNetworkStore } from '@/stores/networkStore'
import { getNetworkConfig, DEFAULT_NETWORK } from '@/config/networks'

interface NetworkAwareCrossSDKProviderProps {
  children: ReactNode
  defaultNetwork?: string
  allowNetworkSwitching?: boolean
  autoConnect?: boolean
}

export function NetworkAwareCrossSDKProvider({
  children,
  defaultNetwork = DEFAULT_NETWORK,
  allowNetworkSwitching = true,
  autoConnect = false
}: NetworkAwareCrossSDKProviderProps) {
  const {
    currentNetwork,
    switchingNetwork,
    initializeNetwork,
    setSwitchingNetwork,
    setNetworkError,
    setConnected
  } = useNetworkStore()

  // Use AppKit hooks for proper Cross SDK integration
  const { address, isConnected } = useAppKitAccount()
  const { chainId, switchNetwork } = useAppKitNetwork()

  // Initialize Cross SDK once with default network (following cross-sdk-js-sample pattern)
  const initializeCrossSDK = useCallback(async () => {
    try {
      console.log('🚀 Initializing Cross SDK with default network')

      // Get environment variables
      const projectId = process.env.NEXT_PUBLIC_CROSS_PROJECT_ID
      const redirectUrl = process.env.NEXT_PUBLIC_CROSS_REDIRECT_URL || 'http://localhost:3001'

      if (!projectId) {
        throw new Error('Cross SDK project ID not found in environment variables')
      }

      // SDK metadata
      const metadata = {
        name: 'ARA Chat',
        description: 'ARA Chat - Cross Network Integration',
        url: redirectUrl,
        icons: ['https://crosstoken.io/favicon.ico']
      }

      // Use default network (mainnet) for initial SDK setup
      const defaultNetworkConfig = getNetworkConfig(DEFAULT_NETWORK)
      const defaultCrossNetwork = defaultNetworkConfig?.crossSdkNetwork

      if (!defaultCrossNetwork) {
        throw new Error('Default Cross SDK network configuration not found')
      }

      console.log('Cross SDK initialization:', {
        projectId,
        redirectUrl,
        defaultNetwork: DEFAULT_NETWORK,
        chainId: defaultCrossNetwork.chainId || defaultCrossNetwork.id
      })

      // Initialize Cross SDK once with default network (correct pattern)
      await initCrossSdk(
        projectId,
        redirectUrl,
        metadata,
        'dark',
        defaultCrossNetwork
      )

      // Wait for initialization to complete (reduced wait time)
      await new Promise(resolve => setTimeout(resolve, 500))

      console.log('✅ Cross SDK initialized successfully with default network')

      // Mark SDK as ready globally
      if (typeof window !== 'undefined') {
        (window as any).crossSdkReady = true;
        (window as any).crossSdkNetwork = DEFAULT_NETWORK
      }

      setConnected(true)
      setNetworkError(undefined)

      // Note: Network switching will be handled by the separate useEffect

    } catch (error) {
      console.error('❌ Cross SDK initialization failed:', error)
      setNetworkError(error instanceof Error ? error.message : 'Failed to initialize Cross SDK')
      setConnected(false)
    }
  }, [currentNetwork, setConnected, setNetworkError])

  // Handle network switching using switchNetwork (correct pattern)
  const handleNetworkSwitch = useCallback(async (networkId: string) => {
    if (!allowNetworkSwitching) {
      console.warn('Network switching is disabled')
      return
    }

    try {
      setSwitchingNetwork(true)

      console.log(`🔄 Switching Cross SDK to network: ${networkId}`)

      // Get target network configuration
      const targetNetworkConfig = getNetworkConfig(networkId)
      if (!targetNetworkConfig) {
        throw new Error(`Network configuration not found: ${networkId}`)
      }

      const targetCrossNetwork = targetNetworkConfig.crossSdkNetwork
      if (!targetCrossNetwork) {
        throw new Error(`Cross SDK network not found for: ${networkId}`)
      }

      // Use switchNetwork hook from useAppKitNetwork (correct pattern)
      console.log('Calling switchNetwork with:', {
        network: targetNetworkConfig.displayName,
        chainId: targetCrossNetwork.chainId || targetCrossNetwork.id,
        testnet: targetNetworkConfig.testnet
      })

      await switchNetwork(targetCrossNetwork)

      // Wait for switch to complete
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Update global SDK network state
      if (typeof window !== 'undefined') {
        (window as any).crossSdkNetwork = networkId
      }

      console.log(`✅ Successfully switched to ${targetNetworkConfig.displayName}`)
      setNetworkError(undefined)

    } catch (error) {
      console.error('❌ Failed to switch network:', error)
      setNetworkError(error instanceof Error ? error.message : 'Failed to switch network')
    } finally {
      setSwitchingNetwork(false)
    }
  }, [allowNetworkSwitching, setSwitchingNetwork, setNetworkError])

  // Initialize network store on mount
  useEffect(() => {
    initializeNetwork(defaultNetwork)
  }, [defaultNetwork, initializeNetwork])

  // SDK 초기화 상태 관리
  const [isSDKReady, setIsSDKReady] = useState(false)

  // Initialize SDK once on mount
  useEffect(() => {
    const initSDK = async () => {
      try {
        await initializeCrossSDK()
        setIsSDKReady(true)
      } catch (error) {
        console.warn('Cross SDK initialization failed:', error)
        setIsSDKReady(true) // 에러가 있어도 앱은 로드
      }
    }
    initSDK()
  }, [initializeCrossSDK])

  // Handle network switching after SDK is initialized
  useEffect(() => {
    if (isSDKReady && currentNetwork && currentNetwork !== DEFAULT_NETWORK && !switchingNetwork) {
      console.log(`🌐 Current network (${currentNetwork}) differs from default (${DEFAULT_NETWORK}), switching...`)
      handleNetworkSwitch(currentNetwork)
    }
  }, [isSDKReady, currentNetwork, switchingNetwork, handleNetworkSwitch])

  // Listen for network changes in store
  useEffect(() => {
    if (!isSDKReady) return

    const unsubscribe = useNetworkStore.subscribe(
      (state) => state.currentNetwork,
      (newNetwork, previousNetwork) => {
        if (newNetwork !== previousNetwork && allowNetworkSwitching) {
          handleNetworkSwitch(newNetwork)
        }
      }
    )

    return unsubscribe
  }, [allowNetworkSwitching, handleNetworkSwitch, isSDKReady])

  // Set up account change listeners with error handling
  useEffect(() => {
    if (!isSDKReady) return

    const setupSDKListeners = () => {
      try {
        if (typeof window !== 'undefined') {
          // Listen for account changes through AccountController
          const unsubscribeAddress = AccountController.subscribeKey('address', (address) => {
            console.log('Cross SDK address changed:', address, 'on network:', currentNetwork)
          })

          return unsubscribeAddress
        }
      } catch (listenerError) {
        console.warn('Failed to setup SDK listeners:', listenerError)
      }
    }

    const cleanup = setupSDKListeners()
    return cleanup
  }, [currentNetwork, isSDKReady])

  // 매우 빠른 초기화 후 앱 로드 (보통 500ms 이하)
  if (!isSDKReady) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
      </div>
    )
  }

  return <>{children}</>
}