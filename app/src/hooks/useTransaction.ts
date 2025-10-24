"use client"

import { useCallback, useState } from 'react'
import { useBlockchainState } from '@/providers/BlockchainStateProvider'
import { SendTransactionParams, Transaction } from '@/types/blockchain'

export function useTransaction() {
  const { state, dispatch } = useBlockchainState()
  const [isLoading, setIsLoading] = useState(false)

  const sendTransaction = useCallback(async (params: SendTransactionParams): Promise<string> => {
    if (!state.wallet.isConnected) {
      throw new Error('지갑이 연결되지 않았습니다.')
    }

    setIsLoading(true)

    try {
      let transactionHash = ''

      if (typeof window !== 'undefined') {
        if (state.wallet.type === 'cross') {
          // Cross SDK transaction
          const { AppKit } = await import('@to-nexus/sdk')
          // Implementation would go here
          // const result = await appKit.sendTransaction(params)
          // transactionHash = result.hash

          // Mock for now
          transactionHash = '0x' + Math.random().toString(16).substr(2, 64)
        } else if (state.wallet.type === 'metamask') {
          // MetaMask transaction
          const transactionParams = {
            from: state.wallet.address,
            to: params.to,
            value: '0x' + parseInt(params.amount).toString(16),
            gas: params.gasLimit || '0x5208',
            gasPrice: params.gasPrice || '0x9184e72a000'
          }

          transactionHash = await window.ethereum.request({
            method: 'eth_sendTransaction',
            params: [transactionParams]
          })
        }
      }

      // Create transaction record
      const transaction: Transaction = {
        id: Date.now().toString(),
        hash: transactionHash,
        from: state.wallet.address!,
        to: params.to,
        amount: params.amount,
        symbol: params.symbol,
        status: 'pending',
        timestamp: new Date(),
        type: 'send'
      }

      // Add to state
      dispatch({
        type: 'TRANSACTION_ADD',
        payload: transaction
      })

      // Add notification
      dispatch({
        type: 'UI_ADD_NOTIFICATION',
        payload: {
          type: 'info',
          message: `${params.amount} ${params.symbol} 전송이 시작되었습니다.`
        }
      })

      return transactionHash
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '거래 전송에 실패했습니다.'

      dispatch({
        type: 'UI_ADD_NOTIFICATION',
        payload: {
          type: 'error',
          message: errorMessage
        }
      })

      throw error
    } finally {
      setIsLoading(false)
    }
  }, [state.wallet, dispatch])

  const estimateGas = useCallback(async (params: SendTransactionParams): Promise<string> => {
    if (!state.wallet.isConnected) {
      throw new Error('지갑이 연결되지 않았습니다.')
    }

    try {
      if (typeof window !== 'undefined') {
        if (state.wallet.type === 'cross') {
          // Cross SDK gas estimation
          const { AppKit } = await import('@to-nexus/sdk')
          // Implementation would go here
          // return await appKit.estimateGas(params)

          // Mock estimation
          return '21000'
        } else if (state.wallet.type === 'metamask') {
          // MetaMask gas estimation
          const estimate = await window.ethereum.request({
            method: 'eth_estimateGas',
            params: [{
              from: state.wallet.address,
              to: params.to,
              value: '0x' + parseInt(params.amount).toString(16)
            }]
          })

          return parseInt(estimate, 16).toString()
        }
      }

      return '21000' // Default gas estimate
    } catch (error) {
      console.error('Gas estimation error:', error)
      return '21000' // Fallback
    }
  }, [state.wallet])

  const getTransactionHistory = useCallback(async (): Promise<Transaction[]> => {
    if (!state.wallet.isConnected || !state.wallet.address) {
      return []
    }

    try {
      // In real implementation, this would fetch from blockchain or API
      // For now, return transactions from state
      return state.transactions.history
    } catch (error) {
      console.error('Transaction history error:', error)
      return []
    }
  }, [state.wallet.isConnected, state.wallet.address, state.transactions.history])

  const updateTransactionStatus = useCallback((id: string, updates: Partial<Transaction>) => {
    dispatch({
      type: 'TRANSACTION_UPDATE',
      payload: { id, updates }
    })
  }, [dispatch])

  const watchTransaction = useCallback(async (hash: string, id: string) => {
    if (!hash || typeof window === 'undefined') return

    try {
      // Poll for transaction receipt
      const checkReceipt = async () => {
        try {
          let receipt = null

          if (state.wallet.type === 'metamask') {
            receipt = await window.ethereum.request({
              method: 'eth_getTransactionReceipt',
              params: [hash]
            })
          }
          // Add Cross SDK receipt checking here

          if (receipt) {
            const status = receipt.status === '0x1' ? 'confirmed' : 'failed'

            updateTransactionStatus(id, {
              status,
              blockNumber: receipt.blockNumber ? parseInt(receipt.blockNumber, 16) : undefined,
              gasUsed: receipt.gasUsed ? parseInt(receipt.gasUsed, 16).toString() : undefined
            })

            dispatch({
              type: 'UI_ADD_NOTIFICATION',
              payload: {
                type: status === 'confirmed' ? 'success' : 'error',
                message: status === 'confirmed' ? '거래가 완료되었습니다.' : '거래가 실패했습니다.'
              }
            })
          } else {
            // Transaction still pending, check again in 5 seconds
            setTimeout(checkReceipt, 5000)
          }
        } catch (error) {
          console.error('Receipt check error:', error)
          setTimeout(checkReceipt, 10000) // Retry in 10 seconds on error
        }
      }

      // Start watching
      setTimeout(checkReceipt, 2000) // Initial delay
    } catch (error) {
      console.error('Watch transaction error:', error)
    }
  }, [state.wallet.type, updateTransactionStatus, dispatch])

  return {
    transactions: state.transactions,
    pending: state.transactions.pending,
    isLoading,
    sendTransaction,
    estimateGas,
    getTransactionHistory,
    updateTransactionStatus,
    watchTransaction
  }
}