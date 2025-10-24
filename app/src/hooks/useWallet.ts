// Custom hook for wallet management and connection

"use client"

import { useState, useEffect, useCallback } from 'react'
import { WalletInfo, WalletConnectionState } from '@/lib/types/wallet'
import { CrossscanApiService } from '@/lib/services/crossscan-api'

interface UseWalletOptions {
  onConnectionSuccess?: (address: string) => void
}

export function useWallet(options?: UseWalletOptions) {
  const { onConnectionSuccess } = options || {}
  const [isInitialized, setIsInitialized] = useState(false)
  const [walletState, setWalletState] = useState<WalletConnectionState>({
    isConnecting: false,
    isConnected: false,
    address: null,
    error: null
  })

  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Manual connect wallet function - ONLY this triggers the auto-chat
  const connectWallet = useCallback(async (address: string, isManualConnection: boolean = true) => {
    if (!CrossscanApiService.isValidAddress(address)) {
      setWalletState(prev => ({
        ...prev,
        error: 'Invalid wallet address format'
      }))
      return
    }

    setWalletState(prev => ({
      ...prev,
      isConnecting: true,
      error: null
    }))

    setIsLoading(true)

    try {
      const info = await CrossscanApiService.getWalletInfo(address)

      setWalletInfo(info)
      setWalletState({
        isConnecting: false,
        isConnected: true,
        address: address,
        error: null
      })

      // Save to localStorage
      localStorage.setItem('ara-wallet-address', address)

      // ONLY trigger auto-chat for manual connections, NOT for localStorage restore
      if (onConnectionSuccess && isManualConnection && isInitialized) {
        onConnectionSuccess(address)
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error)
      setWalletState({
        isConnecting: false,
        isConnected: false,
        address: null,
        error: error instanceof Error ? error.message : 'Failed to connect wallet'
      })
      setWalletInfo(null)
    } finally {
      setIsLoading(false)
    }
  }, [onConnectionSuccess, isInitialized])

  // Disconnect wallet
  const disconnectWallet = useCallback(() => {
    setWalletState({
      isConnecting: false,
      isConnected: false,
      address: null,
      error: null
    })
    setWalletInfo(null)
    localStorage.removeItem('ara-wallet-address')
  }, [])

  // Refresh wallet data
  const refreshWalletData = useCallback(async () => {
    if (!walletState.address) return

    setIsLoading(true)
    try {
      const info = await CrossscanApiService.getWalletInfo(walletState.address)
      setWalletInfo(info)
      setWalletState(prev => ({ ...prev, error: null }))
    } catch (error) {
      console.error('Failed to refresh wallet data:', error)
      setWalletState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to refresh wallet data'
      }))
    } finally {
      setIsLoading(false)
    }
  }, [walletState.address])

  // Load saved wallet from localStorage on mount (NO auto-message)
  useEffect(() => {
    const savedAddress = localStorage.getItem('ara-wallet-address')
    if (savedAddress && CrossscanApiService.isValidAddress(savedAddress)) {
      // Restore wallet silently WITHOUT triggering auto-chat
      setIsLoading(true)
      setWalletState(prev => ({
        ...prev,
        isConnecting: true,
        error: null
      }))

      CrossscanApiService.getWalletInfo(savedAddress)
        .then(info => {
          setWalletInfo(info)
          setWalletState({
            isConnecting: false,
            isConnected: true,
            address: savedAddress,
            error: null
          })
        })
        .catch(error => {
          console.error('Failed to restore wallet from localStorage:', error)
          setWalletState({
            isConnecting: false,
            isConnected: false,
            address: null,
            error: error instanceof Error ? error.message : 'Failed to restore wallet'
          })
          setWalletInfo(null)
          localStorage.removeItem('ara-wallet-address')
        })
        .finally(() => {
          setIsLoading(false)
        })
    }

    // Mark as initialized after attempting restore
    setIsInitialized(true)
  }, []) // NO dependencies to prevent re-execution

  // Auto-refresh wallet data every 30 seconds if connected
  useEffect(() => {
    if (!walletState.isConnected || !walletState.address) return

    const interval = setInterval(refreshWalletData, 30000)
    return () => clearInterval(interval)
  }, [walletState.isConnected, walletState.address, refreshWalletData])

  return {
    // State
    walletState,
    walletInfo,
    isLoading,

    // Actions
    connectWallet,
    disconnectWallet,
    refreshWalletData,

    // Utilities
    isValidAddress: CrossscanApiService.isValidAddress,
    shortenAddress: CrossscanApiService.shortenAddress
  }
}