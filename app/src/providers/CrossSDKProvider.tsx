"use client"

import { useEffect, ReactNode } from 'react'
import {
  initCrossSdkWithParams,
  crossMainnet,
  crossTestnet,
  AccountController,
  ConnectionController
} from '@to-nexus/sdk'

interface CrossSDKProviderProps {
  children: ReactNode
}

export function CrossSDKProvider({ children }: CrossSDKProviderProps) {
  useEffect(() => {
    const initializeCrossSDK = async () => {
      try {
        console.log('Initializing Cross SDK...')

        // Force clear any existing SDK instances before initialization
        try {
          // Clear all Cross-related storage
          const allCrossKeys = []
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i)
            if (key && (key.includes('cross') || key.includes('Cross') || key.includes('nexus') || key.includes('to-nexus'))) {
              allCrossKeys.push(key)
            }
          }
          allCrossKeys.forEach(key => localStorage.removeItem(key))

          // Clear only SDK instances, preserve wallet extension objects
          const preserveKeys = ['crossWallet', 'cross', 'Cross', 'CrossWallet'] // Preserve wallet extension objects
          const crossKeys = Object.keys(window as any).filter(key =>
            (key.toLowerCase().includes('cross') || key.toLowerCase().includes('nexus')) &&
            !preserveKeys.includes(key) &&
            (key.includes('SDK') || key.includes('sdk') || key.includes('App') || key.includes('Modal') || key.includes('Kit'))
          )
          crossKeys.forEach(key => {
            try {
              delete (window as any)[key]
            } catch (e) {
              // Some properties might be non-configurable
            }
          })

          console.log('Cleared existing Cross SDK instances before initialization')
        } catch (clearError) {
          console.log('Error clearing existing SDK instances:', clearError)
        }

        // Get environment variables
        const projectId = process.env.NEXT_PUBLIC_CROSS_PROJECT_ID
        const envMode = process.env.NEXT_PUBLIC_CROSS_ENV_MODE
        const redirectUrl = process.env.NEXT_PUBLIC_CROSS_REDIRECT_URL || 'http://localhost:3001'

        if (!projectId) {
          console.error('Cross SDK project ID not found in environment variables')
          return
        }

        // SDK metadata
        const metadata = {
          name: 'ARA Chat',
          description: 'ARA Chat - AI Assistant with Cross Wallet Integration',
          url: redirectUrl,
          icons: ['https://crosstoken.io/favicon.ico']
        }

        // Choose network based on environment - use mainnet like sample code
        const network = envMode === 'production' ? crossMainnet : crossMainnet

        // Fix chainId issue - use id if chainId is undefined
        const networkWithChainId = {
          ...network,
          chainId: network.chainId || network.id
        }

        console.log('Cross SDK configuration:', {
          projectId,
          redirectUrl,
          network: networkWithChainId.name,
          chainId: networkWithChainId.chainId
        })

        // Debug network object
        console.log('Network object details:', networkWithChainId)

        // Initialize Cross SDK with createAppKit - proper AppKit pattern
        try {
          console.log('Creating AppKit with configuration:', {
            projectId,
            redirectUrl,
            network: networkWithChainId.name,
            chainId: networkWithChainId.chainId
          })

          await initCrossSdkWithParams({
            projectId,
            redirectUrl,
            metadata,
            themeMode: 'dark',
            defaultNetwork: networkWithChainId
          })

          // Wait for initialization to complete
          await new Promise(resolve => setTimeout(resolve, 1000))

          console.log('✅ Cross SDK initialized successfully')

          // Mark SDK as ready globally
          if (typeof window !== 'undefined') {
            (window as any).crossSdkReady = true
          }
        } catch (initError) {
          console.error('❌ Cross SDK initialization failed:', initError)
          // Don't throw - let the app continue, just log the error
        }

        // Set up account change listeners with error handling
        const setupSDKListeners = () => {
          try {
            if (typeof window !== 'undefined') {
              // Listen for account changes through AccountController
              AccountController.subscribeKey('address', (address) => {
                console.log('Cross SDK address changed:', address)
              })

              // Note: AccountController may not have 'isConnected' key
              // Remove this listener for now
              // AccountController.subscribeKey('isConnected', (isConnected) => {
              //   console.log('Cross SDK connection status changed:', isConnected)
              // })
            }
          } catch (listenerError) {
            console.warn('Failed to setup SDK listeners:', listenerError)
          }
        }

        // Setup listeners after a delay to ensure SDK is ready
        setTimeout(setupSDKListeners, 2000)

      } catch (error) {
        console.error('Failed to initialize Cross SDK:', error)
      }
    }

    // Initialize SDK only on client side
    if (typeof window !== 'undefined') {
      // Immediate initialization
      initializeCrossSDK()
    }
  }, [])

  return <>{children}</>
}