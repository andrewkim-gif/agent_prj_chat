"use client"

import { useCallback } from 'react'
import { useBlockchainState } from '@/providers/BlockchainStateProvider'
import { WalletType } from '@/types/blockchain'
import {
  useAppKit,
  useAppKitAccount,
  useAppKitNetwork,
  useAppKitWallet,
  useDisconnect
} from '@to-nexus/sdk/react'
import {
  AccountController,
  ConnectionController
} from '@to-nexus/sdk'
import { resetCrossWalletState, showResetInstructions } from '@/utils/crossWalletReset'

// Address validation function
const isValidEthereumAddress = (address: string): boolean => {
  return /^0x[a-fA-F0-9]{40}$/.test(address)
}


export function useBlockchainWallet() {
  const { state, dispatch } = useBlockchainState()

  // Cross SDK hooks - must be called unconditionally (Rules of Hooks)
  const appKit = useAppKit()
  const account = useAppKitAccount()
  const network = useAppKitNetwork()
  const walletHook = useAppKitWallet()
  const disconnectHook = useDisconnect()

  // Extract methods safely
  const connect = walletHook?.connect
  const crossDisconnect = disconnectHook?.disconnect

  const connectWallet = useCallback(async (type: WalletType) => {
    dispatch({ type: 'WALLET_CONNECT_START', payload: { type } })

    try {
      // Clear any previous wallet connections first
      if (typeof window !== 'undefined') {
        // Clear localStorage wallet data before connecting
        localStorage.removeItem('walletconnect')
        localStorage.removeItem('metamask-connected')
        localStorage.removeItem('cross-wallet-connected')

        // Clear Cross SDK cache before connecting to ensure fresh session
        if (type === 'cross') {
          // Clear ALL Cross-related storage before connecting
          const allCrossKeys = []
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i)
            if (key && (key.includes('cross') || key.includes('Cross') || key.includes('nexus') || key.includes('to-nexus'))) {
              allCrossKeys.push(key)
            }
          }
          allCrossKeys.forEach(key => localStorage.removeItem(key))

          // Clear all sessionStorage Cross-related keys
          const allSessionKeys = []
          for (let i = 0; i < sessionStorage.length; i++) {
            const key = sessionStorage.key(i)
            if (key && (key.includes('cross') || key.includes('Cross') || key.includes('nexus') || key.includes('to-nexus'))) {
              allSessionKeys.push(key)
            }
          }
          allSessionKeys.forEach(key => sessionStorage.removeItem(key))

          // Force clear only SDK-specific objects, preserve wallet extension objects
          try {
            const windowKeys = Object.keys(window as any)
            const preserveKeys = ['crossWallet', 'cross', 'Cross', 'CrossWallet'] // Preserve wallet extension objects
            windowKeys.forEach(key => {
              if (key.toLowerCase().includes('cross') &&
                  !preserveKeys.includes(key) &&
                  (key.includes('SDK') || key.includes('sdk') || key.includes('App') || key.includes('Modal'))) {
                try {
                  delete (window as any)[key]
                } catch (e) {
                  // Some properties might be non-configurable
                }
              }
            })
          } catch (e) {
            // Ignore errors
          }

          console.log('Cross SDK cache completely cleared before connection attempt')

          // Longer delay to ensure complete cache clearing
          await new Promise(resolve => setTimeout(resolve, 500))
        }
      }

      // Cross SDK integration
      if (typeof window !== 'undefined') {
        if (type === 'cross') {
          try {
            console.log('Attempting Cross Wallet connection...')

            // Enhanced Cross Wallet detection - check multiple possible names
            const possibleNames = ['crossWallet', 'cross', 'Cross', 'CrossWallet']
            let crossWallet = null

            for (const name of possibleNames) {
              const wallet = (window as any)[name]
              if (wallet && typeof wallet.request === 'function') {
                crossWallet = wallet
                console.log(`✅ Found Cross Wallet at window.${name}`)
                break
              }
            }

            if (!crossWallet) {
              throw new Error('Cross Wallet is not installed. Please install Cross Wallet extension from the official website and try again.')
            }

            // Force disconnect and clean all pending requests
            try {
              console.log('🧹 Clearing all existing Cross Wallet connections and pending requests...')

              // 1. Try to disconnect using Cross SDK
              try {
                if (crossDisconnect) {
                  await crossDisconnect()
                  console.log('Cross SDK disconnect successful')
                } else {
                  console.log('Cross SDK disconnect not available')
                }
              } catch (sdkDisconnectError) {
                console.log('Cross SDK disconnect failed (continuing):', sdkDisconnectError)
              }

              // 2. Try multiple wallet-level disconnect methods
              const disconnectMethods = [
                'wallet_disconnect',
                'wallet_revokePermissions',
                'wallet_clearSession',
                'eth_accounts'  // This can reset pending states
              ]

              for (const method of disconnectMethods) {
                try {
                  console.log(`Trying ${method}...`)
                  await crossWallet.request({ method }).catch(() => {
                    // Method might not exist or fail, continue
                  })
                } catch (e) {
                  // Continue with other methods
                }
              }

              // 3. Force clear any cached accounts and states
              try {
                if (typeof crossWallet._state !== 'undefined') {
                  crossWallet._state = {}
                }
                if (typeof crossWallet.selectedAddress !== 'undefined') {
                  crossWallet.selectedAddress = null
                }
                if (typeof crossWallet._pendingRequests !== 'undefined') {
                  crossWallet._pendingRequests = []
                }
                if (typeof crossWallet._requests !== 'undefined') {
                  crossWallet._requests = new Map()
                }
              } catch (stateError) {
                console.log('State clearing error (continuing):', stateError)
              }

              // 4. Wait for any pending operations to complete
              console.log('⏳ Waiting for pending operations to complete...')
              await new Promise(resolve => setTimeout(resolve, 1000))

              console.log('✅ All existing connections and pending requests cleared')
            } catch (forceDisconnectError) {
              console.log('⚠️ Force disconnect error (continuing):', forceDisconnectError)
            }

            // Try direct extension connection first
            try {
              console.log('Trying direct Cross Wallet extension connection...')

              // Force fresh account request (this should always prompt user)
              const accounts = await crossWallet.request({
                method: 'eth_requestAccounts'
              })

              if (!accounts || accounts.length === 0) {
                throw new Error('No accounts found in Cross Wallet')
              }

              const address = accounts[0]
              if (!isValidEthereumAddress(address)) {
                throw new Error(`Invalid address format: ${address}`)
              }

              const chainId = await crossWallet.request({
                method: 'eth_chainId'
              }).catch(() => 4157)

              console.log('Direct Cross Wallet connection successful:', { address, chainId })

              dispatch({
                type: 'WALLET_CONNECT_SUCCESS',
                payload: {
                  isConnected: true,
                  address: address,
                  chainId: typeof chainId === 'string' ? parseInt(chainId, 16) : chainId,
                  type: 'cross',
                  balance: '0'
                }
              })

              return // Success, exit early
            } catch (directError) {
              console.log('Direct connection failed, trying SDK method:', directError)
            }

            // Fallback to SDK connection using the correct method
            try {
              console.log('Attempting Cross Wallet connection via SDK with connect method...')

              // Use the same pattern as in the sample code
              await connect('cross_wallet')

              // Wait for connection with appropriate timeout
              let retries = 0
              const maxRetries = 20
              const retryDelay = 250

              while (!account?.isConnected && retries < maxRetries) {
                await new Promise(resolve => setTimeout(resolve, retryDelay))
                retries++
                console.log(`Connection retry ${retries}/${maxRetries}...`)
              }

              if (!account?.isConnected) {
                console.log('SDK connection timeout, trying AppKit connect...')

                // Try AppKit connect as fallback
                if (appKit) {
                  await appKit.connect()

                  // Wait again for AppKit connection
                  retries = 0
                  while (!account?.isConnected && retries < maxRetries) {
                    await new Promise(resolve => setTimeout(resolve, retryDelay))
                    retries++
                  }
                }

                if (!account?.isConnected) {
                  throw new Error('SDK connection timeout after trying both methods')
                }
              }

              const address = account.address
              const chainId = network?.chainId || 4157

              if (!address || !isValidEthereumAddress(address)) {
                throw new Error(`Invalid address format received: ${address}`)
              }

              console.log('✅ Cross Wallet SDK connection successful:', {
                address,
                chainId,
                network: network?.name,
                balance: account.balance
              })

              dispatch({
                type: 'WALLET_CONNECT_SUCCESS',
                payload: {
                  isConnected: true,
                  address: address,
                  chainId: chainId,
                  type: 'cross',
                  balance: account.balance || '0'
                }
              })
            } catch (sdkError) {
              console.error('SDK connection failed:', sdkError)

              // Check if it's a "Connection declined" error
              const errorMessage = typeof sdkError === 'object' && sdkError !== null ?
                (sdkError as any).message || String(sdkError) : String(sdkError)

              if (errorMessage.toLowerCase().includes('connection declined') ||
                  errorMessage.toLowerCase().includes('previous request is still active')) {
                console.log('🔄 Connection declined detected - initiating reset...')

                // Perform reset and show instructions
                await resetCrossWalletState()
                showResetInstructions()

                throw new Error('Connection was declined due to a previous active request. Please refresh the page and try again.')
              }

              throw new Error('Cross Wallet connection failed. Please ensure Cross Wallet is properly installed and try again.')
            }

          } catch (error) {
            console.error('Cross Wallet connection error:', error)

            let errorMessage = 'Cross Wallet connection failed.'
            if (error instanceof Error) {
              errorMessage = error.message
            }

            throw new Error(errorMessage)
          }
        } else if (type === 'metamask') {
          // MetaMask connection - force fresh account request
          if (window.ethereum?.isMetaMask) {
            // Always request fresh accounts (forces user confirmation)
            const accounts = await window.ethereum.request({
              method: 'eth_requestAccounts'
            })
            const chainId = await window.ethereum.request({
              method: 'eth_chainId'
            })

            if (accounts[0]) {
              // Validate MetaMask address format
              if (!isValidEthereumAddress(accounts[0])) {
                throw new Error(`Invalid MetaMask address format: ${accounts[0]}`)
              }

              dispatch({
                type: 'WALLET_CONNECT_SUCCESS',
                payload: {
                  isConnected: true,
                  address: accounts[0],
                  chainId: parseInt(chainId, 16),
                  type: 'metamask'
                }
              })
            } else {
              throw new Error('No accounts found in MetaMask')
            }
          } else {
            throw new Error('MetaMask not found')
          }
        } else if (type === 'walletconnect') {
          // WalletConnect integration would go here
          throw new Error('WalletConnect not implemented yet')
        } else if (type === 'hardware') {
          // Hardware wallet integration would go here
          throw new Error('Hardware wallet not implemented yet')
        }
      }
    } catch (error) {
      console.error(`Wallet connection failed for ${type}:`, error)

      let errorMessage = 'Failed to connect wallet.'

      if (error instanceof Error) {
        errorMessage = error.message
      } else if (typeof error === 'string') {
        errorMessage = error
      }

      // Add specific error context
      if (type === 'cross') {
        errorMessage = `Cross Wallet connection failed: ${errorMessage}`
      } else if (type === 'metamask') {
        errorMessage = `MetaMask connection failed: ${errorMessage}`
      }

      dispatch({
        type: 'WALLET_CONNECT_ERROR',
        payload: errorMessage
      })

      dispatch({
        type: 'UI_ADD_NOTIFICATION',
        payload: {
          type: 'error',
          message: errorMessage
        }
      })

      throw error
    }
  }, [dispatch])

  const disconnectWallet = useCallback(async () => {
    try {
      // Clear browser storage and cached connections
      if (typeof window !== 'undefined') {
        // Clear localStorage wallet data
        localStorage.removeItem('walletconnect')
        localStorage.removeItem('metamask-connected')
        localStorage.removeItem('cross-wallet-connected')

        // Clear Cross SDK specific cache data
        localStorage.removeItem('cross-sdk-session')
        localStorage.removeItem('cross-sdk-cache')
        localStorage.removeItem('cross-sdk-accounts')
        localStorage.removeItem('cross-sdk-network')
        localStorage.removeItem('@to-nexus/core')
        localStorage.removeItem('@to-nexus/modal')
        localStorage.removeItem('cross-modal-session')

        // Clear sessionStorage as well
        sessionStorage.removeItem('cross-wallet-session')
        sessionStorage.removeItem('cross-sdk-state')
        sessionStorage.removeItem('cross-connection-cache')

        // Clear any cached wallet permissions/accounts
        if (state.wallet.type === 'metamask' && window.ethereum?.isMetaMask) {
          // Force MetaMask to forget cached permissions
          try {
            await window.ethereum.request({
              method: 'wallet_requestPermissions',
              params: [{ eth_accounts: {} }]
            }).catch(() => {
              // If this fails, that's okay - MetaMask might not support this method
            })
          } catch (error) {
            console.log('Could not clear MetaMask permissions:', error)
          }
        }

        // Cross Wallet comprehensive disconnect and cache clearing
        if (state.wallet.type === 'cross') {
          try {
            // First, try SDK disconnect
            if (crossDisconnect) {
              await crossDisconnect()
              console.log('Cross Wallet disconnected successfully via SDK')
            } else {
              console.log('Cross SDK disconnect not available')
            }

            // Clear ALL possible Cross SDK storage locations
            const allCrossKeys = []
            for (let i = 0; i < localStorage.length; i++) {
              const key = localStorage.key(i)
              if (key && (key.includes('cross') || key.includes('Cross') || key.includes('nexus') || key.includes('to-nexus'))) {
                allCrossKeys.push(key)
              }
            }
            allCrossKeys.forEach(key => localStorage.removeItem(key))

            // Clear all sessionStorage Cross-related keys
            const allSessionKeys = []
            for (let i = 0; i < sessionStorage.length; i++) {
              const key = sessionStorage.key(i)
              if (key && (key.includes('cross') || key.includes('Cross') || key.includes('nexus') || key.includes('to-nexus'))) {
                allSessionKeys.push(key)
              }
            }
            allSessionKeys.forEach(key => sessionStorage.removeItem(key))

            // Clear Cross SDK Controllers cache
            try {
              // Reset AccountController state
              if (AccountController) {
                if (typeof AccountController.resetState === 'function') {
                  AccountController.resetState()
                }
                if (typeof AccountController.reset === 'function') {
                  AccountController.reset()
                }
                // Force clear address and connection state
                if (typeof AccountController.setAddress === 'function') {
                  AccountController.setAddress('')
                }
                if (typeof AccountController.setIsConnected === 'function') {
                  AccountController.setIsConnected(false)
                }
              }

              // Reset ConnectionController state
              if (ConnectionController) {
                if (typeof ConnectionController.resetState === 'function') {
                  ConnectionController.resetState()
                }
                if (typeof ConnectionController.reset === 'function') {
                  ConnectionController.reset()
                }
                if (typeof ConnectionController.disconnect === 'function') {
                  await ConnectionController.disconnect()
                }
              }

              console.log('Cross SDK Controllers cache cleared')
            } catch (controllerError) {
              console.log('Could not reset SDK controllers:', controllerError)
            }

            // Clear browser extension cache and force disconnect
            // Enhanced Cross Wallet detection - check multiple possible names
            const possibleNames = ['crossWallet', 'cross', 'Cross', 'CrossWallet']
            let crossWallet = null

            for (const name of possibleNames) {
              const wallet = (window as any)[name]
              if (wallet && typeof wallet.request === 'function') {
                crossWallet = wallet
                break
              }
            }

            if (crossWallet) {
              try {
                // Multiple disconnect attempts with different methods
                const disconnectMethods = [
                  'wallet_disconnect',
                  'wallet_clearSession',
                  'wallet_revokePermissions',
                  'wallet_requestPermissions',
                  'eth_requestAccounts'
                ]

                for (const method of disconnectMethods) {
                  try {
                    if (method === 'wallet_requestPermissions') {
                      await crossWallet.request({
                        method: method,
                        params: [{ eth_accounts: {} }]
                      })
                    } else if (method === 'eth_requestAccounts') {
                      // Force a fresh account request to reset cached accounts
                      await crossWallet.request({
                        method: method
                      }).catch(() => {
                        // This might fail, which is expected after disconnect
                      })
                    } else {
                      await crossWallet.request({
                        method: method
                      })
                    }
                  } catch (methodError) {
                    // Method might not exist, continue trying others
                  }
                }

                // Clear any wallet event listeners
                if (crossWallet.removeAllListeners) {
                  crossWallet.removeAllListeners()
                }

              } catch (extensionError) {
                console.log('Could not clear extension session:', extensionError)
              }
            }

          } catch (error) {
            console.log('Cross Wallet SDK disconnect error:', error)
          }

          // Clear only SDK objects, preserve wallet extension objects
          try {
            const windowKeys = Object.keys(window as any)
            const preserveKeys = ['crossWallet', 'cross', 'Cross', 'CrossWallet'] // Preserve wallet extension objects
            windowKeys.forEach(key => {
              if ((key.toLowerCase().includes('cross') || key.toLowerCase().includes('nexus')) &&
                  !preserveKeys.includes(key) &&
                  (key.includes('SDK') || key.includes('sdk') || key.includes('App') || key.includes('Modal') || key.includes('Kit'))) {
                try {
                  delete (window as any)[key]
                } catch (e) {
                  // Some properties might be non-configurable
                }
              }
            })

            // Clear only SDK-specific objects, not wallet extension
            const knownSDKObjects = [
              'crossSdk', 'crossModal', 'crossState', 'crossApp', 'crossKit', 'toNexus'
            ]
            knownSDKObjects.forEach(obj => {
              try {
                if ((window as any)[obj]) {
                  delete (window as any)[obj]
                }
              } catch (e) {
                // Property might be non-configurable
              }
            })

          } catch (globalError) {
            console.log('Could not clear global Cross SDK objects:', globalError)
          }

          // Force page reload to completely reset SDK state (as last resort)
          console.log('Cross Wallet completely disconnected and cache cleared')
        }
      }

      dispatch({ type: 'WALLET_DISCONNECT' })

      dispatch({
        type: 'UI_ADD_NOTIFICATION',
        payload: {
          type: 'info',
          message: 'Wallet has been disconnected and cache cleared.'
        }
      })
    } catch (error) {
      console.error('Wallet disconnect error:', error)
    }
  }, [dispatch, state.wallet.type, crossDisconnect])

  const switchWallet = useCallback(async (type: WalletType) => {
    await disconnectWallet()
    await connectWallet(type)
  }, [connectWallet, disconnectWallet])

  const refreshBalances = useCallback(async () => {
    if (!state.wallet.isConnected || !state.wallet.address) {
      return
    }

    try {
      dispatch({
        type: 'UI_ADD_NOTIFICATION',
        payload: {
          type: 'info',
          message: 'Updating balance...'
        }
      })

      if (state.wallet.type === 'cross') {
        // Get native token balance from Cross SDK
        const nativeBalance = account?.balance || '0'

        // Get token balances using Cross SDK
        const chainIdHex = `0x${network?.chainId?.toString(16)}` as `0x${string}`

        try {
          const tokens = await ConnectionController.walletGetAssets({
            account: state.wallet.address as `0x${string}`,
            chainFilter: [chainIdHex],
            assetTypeFilter: ['NATIVE', 'ERC20']
          })

          console.log('Updated balance info:', {
            nativeBalance,
            tokens,
            chainId: network?.chainId
          })

          // Update state with new balance
          dispatch({
            type: 'WALLET_UPDATE_BALANCE',
            payload: {
              balance: nativeBalance,
              tokenBalances: tokens
            }
          })

          dispatch({
            type: 'UI_ADD_NOTIFICATION',
            payload: {
              type: 'success',
              message: 'Balance updated successfully!'
            }
          })

        } catch (tokenError) {
          console.log('Token balance fetch failed, using native balance only:', tokenError)

          // Update state with native balance only
          dispatch({
            type: 'WALLET_UPDATE_BALANCE',
            payload: {
              balance: nativeBalance
            }
          })

          dispatch({
            type: 'UI_ADD_NOTIFICATION',
            payload: {
              type: 'info',
              message: 'Native balance updated!'
            }
          })
        }
      } else {
        // Handle other wallet types (MetaMask, etc.)
        dispatch({
          type: 'UI_ADD_NOTIFICATION',
          payload: {
            type: 'info',
            message: 'Balance refresh not implemented for this wallet type.'
          }
        })
      }

    } catch (error) {
      console.error('Balance refresh error:', error)
      dispatch({
        type: 'UI_ADD_NOTIFICATION',
        payload: {
          type: 'error',
          message: 'Failed to update balance.'
        }
      })
    }
  }, [state.wallet.isConnected, state.wallet.address, state.wallet.type, account?.balance, network?.chainId, dispatch])

  // Sign message function using Cross SDK
  const signMessage = useCallback(async (message: string): Promise<string> => {
    if (!state.wallet.isConnected || state.wallet.type !== 'cross') {
      throw new Error('Cross Wallet not connected')
    }

    try {
      const signedMessage = await ConnectionController.signMessage({
        message: message,
        customData: {
          metadata: 'Message signed via ARA Chat'
        }
      })

      dispatch({
        type: 'UI_ADD_NOTIFICATION',
        payload: {
          type: 'success',
          message: 'Message signed successfully!'
        }
      })

      return signedMessage
    } catch (error) {
      console.error('Sign message error:', error)
      dispatch({
        type: 'UI_ADD_NOTIFICATION',
        payload: {
          type: 'error',
          message: 'Failed to sign message.'
        }
      })
      throw error
    }
  }, [state.wallet.isConnected, state.wallet.type, dispatch])

  // Send native token function
  const sendNativeToken = useCallback(async (toAddress: string, amount: string): Promise<string> => {
    if (!state.wallet.isConnected || state.wallet.type !== 'cross') {
      throw new Error('Cross Wallet not connected')
    }

    try {
      const { SendController } = await import('@to-nexus/sdk/react')

      const result = await SendController.sendNativeToken({
        receiverAddress: toAddress,
        sendTokenAmount: parseFloat(amount),
        decimals: '18',
        data: '0x',
        customData: {
          metadata: 'Transaction sent via ARA Chat'
        }
      })

      dispatch({
        type: 'UI_ADD_NOTIFICATION',
        payload: {
          type: 'success',
          message: 'Transaction sent successfully!'
        }
      })

      // Refresh balances after successful transaction
      setTimeout(() => refreshBalances(), 2000)

      return result.hash || 'Transaction sent'
    } catch (error) {
      console.error('Send transaction error:', error)
      dispatch({
        type: 'UI_ADD_NOTIFICATION',
        payload: {
          type: 'error',
          message: 'Failed to send transaction.'
        }
      })
      throw error
    }
  }, [state.wallet.isConnected, state.wallet.type, dispatch, refreshBalances])

  return {
    wallet: state.wallet,
    connectWallet,
    disconnectWallet,
    switchWallet,
    refreshBalances,
    signMessage,
    sendNativeToken,
    isLoading: state.wallet.isConnecting,
    // Cross SDK account info
    crossAccount: account,
    crossNetwork: network,
    // Token creation에서 필요한 속성들
    isConnected: state.wallet.isConnected,
    walletAddress: state.wallet.address
  }
}