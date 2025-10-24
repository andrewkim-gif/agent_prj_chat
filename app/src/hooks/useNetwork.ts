"use client"

import { useCallback } from 'react'
import { useBlockchainState } from '@/providers/BlockchainStateProvider'
import { NetworkInfo, GasInfo } from '@/types/blockchain'

export function useNetwork() {
  const { state, dispatch } = useBlockchainState()

  const switchNetwork = useCallback(async (chainId: number) => {
    if (!state.wallet.isConnected) {
      throw new Error('지갑이 연결되지 않았습니다.')
    }

    dispatch({ type: 'NETWORK_SWITCH_START', payload: chainId })

    try {
      const targetNetwork = state.network.supported.find(n => n.chainId === chainId)
      if (!targetNetwork) {
        throw new Error('지원하지 않는 네트워크입니다.')
      }

      if (typeof window !== 'undefined') {
        if (state.wallet.type === 'cross') {
          // Cross SDK network switching
          const { AppKit } = await import('@to-nexus/sdk')
          // Implementation would go here
          // await appKit.switchNetwork(chainId)

        } else if (state.wallet.type === 'metamask') {
          // MetaMask network switching
          try {
            await window.ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: `0x${chainId.toString(16)}` }]
            })
          } catch (error: any) {
            // Network not added to MetaMask, try to add it
            if (error.code === 4902) {
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [{
                  chainId: `0x${chainId.toString(16)}`,
                  chainName: targetNetwork.name,
                  nativeCurrency: {
                    name: targetNetwork.symbol,
                    symbol: targetNetwork.symbol,
                    decimals: 18
                  },
                  rpcUrls: [targetNetwork.rpcUrl],
                  blockExplorerUrls: targetNetwork.blockExplorer ? [targetNetwork.blockExplorer] : undefined
                }]
              })
            } else {
              throw error
            }
          }
        }
      }

      dispatch({
        type: 'NETWORK_SWITCH_SUCCESS',
        payload: targetNetwork
      })

      dispatch({
        type: 'UI_ADD_NOTIFICATION',
        payload: {
          type: 'success',
          message: `${targetNetwork.name} 네트워크로 전환되었습니다.`
        }
      })

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '네트워크 전환에 실패했습니다.'

      dispatch({
        type: 'NETWORK_SWITCH_ERROR',
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
  }, [state.wallet.isConnected, state.wallet.type, state.network.supported, dispatch])

  const addNetwork = useCallback(async (network: NetworkInfo) => {
    try {
      if (typeof window !== 'undefined' && state.wallet.type === 'metamask') {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: `0x${network.chainId.toString(16)}`,
            chainName: network.name,
            nativeCurrency: {
              name: network.symbol,
              symbol: network.symbol,
              decimals: 18
            },
            rpcUrls: [network.rpcUrl],
            blockExplorerUrls: network.blockExplorer ? [network.blockExplorer] : undefined
          }]
        })

        dispatch({
          type: 'UI_ADD_NOTIFICATION',
          payload: {
            type: 'success',
            message: `${network.name} 네트워크가 추가되었습니다.`
          }
        })
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '네트워크 추가에 실패했습니다.'

      dispatch({
        type: 'UI_ADD_NOTIFICATION',
        payload: {
          type: 'error',
          message: errorMessage
        }
      })

      throw error
    }
  }, [state.wallet.type, dispatch])

  const getGasPrice = useCallback(async (): Promise<GasInfo> => {
    try {
      if (typeof window !== 'undefined') {
        if (state.wallet.type === 'cross') {
          // Cross SDK gas price
          // const { AppKit } = await import('@to-nexus/sdk')
          // return await appKit.getGasPrice()

          // Mock gas prices for Cross Chain
          return {
            slow: '1000000000',    // 1 gwei
            standard: '2000000000', // 2 gwei
            fast: '3000000000',     // 3 gwei
            instant: '5000000000'   // 5 gwei
          }
        } else if (state.wallet.type === 'metamask') {
          // Get current gas price from network
          const gasPrice = await window.ethereum.request({
            method: 'eth_gasPrice'
          })

          const basePrice = parseInt(gasPrice, 16)

          return {
            slow: Math.floor(basePrice * 0.8).toString(),
            standard: basePrice.toString(),
            fast: Math.floor(basePrice * 1.2).toString(),
            instant: Math.floor(basePrice * 1.5).toString()
          }
        }
      }

      // Default gas prices (mainnet-like)
      return {
        slow: '20000000000',    // 20 gwei
        standard: '25000000000', // 25 gwei
        fast: '30000000000',     // 30 gwei
        instant: '40000000000'   // 40 gwei
      }
    } catch (error) {
      console.error('Gas price error:', error)

      // Fallback gas prices
      return {
        slow: '20000000000',
        standard: '25000000000',
        fast: '30000000000',
        instant: '40000000000'
      }
    }
  }, [state.wallet.type])

  const updateGasPrice = useCallback(async () => {
    try {
      const gasInfo = await getGasPrice()

      dispatch({
        type: 'NETWORK_UPDATE_GAS_PRICE',
        payload: gasInfo.standard
      })

      return gasInfo
    } catch (error) {
      console.error('Gas price update error:', error)
    }
  }, [getGasPrice, dispatch])

  const getNetworkStatus = useCallback(() => {
    return {
      current: state.network.current,
      isConnected: state.wallet.isConnected && state.network.current.chainId === state.wallet.chainId,
      gasPrice: state.network.gasPrice,
      isLoading: state.network.isConnecting
    }
  }, [state.network, state.wallet])

  return {
    currentNetwork: state.network.current,
    supportedNetworks: state.network.supported,
    isLoading: state.network.isConnecting,
    gasPrice: state.network.gasPrice,
    switchNetwork,
    addNetwork,
    getGasPrice,
    updateGasPrice,
    getNetworkStatus
  }
}