// Crossscan API service for wallet and transaction data

import { WalletInfo, Transaction, TokenBalance, CrossscanApiResponse, WalletStats } from '@/lib/types/wallet'

export class CrossscanApiService {
  private static readonly BASE_URL = 'https://www.crossscan.io/api'
  private static readonly API_KEY = process.env.NEXT_PUBLIC_CROSSSCAN_API_KEY || ''

  // Utility to format wei to ETH/CROSS
  private static formatBalance(wei: string, decimals: number = 18): string {
    const balance = parseFloat(wei) / Math.pow(10, decimals)
    return balance.toFixed(6)
  }

  // Get wallet balance
  static async getBalance(address: string): Promise<string> {
    try {
      const response = await fetch(
        `${this.BASE_URL}?module=account&action=balance&address=${address}&tag=latest&apikey=${this.API_KEY}`
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: CrossscanApiResponse<string> = await response.json()

      if (data.status !== '1') {
        throw new Error(data.message || 'Failed to fetch balance')
      }

      return data.result
    } catch (error) {
      console.error('Error fetching balance:', error)
      throw error
    }
  }

  // Get wallet transaction history
  static async getTransactions(
    address: string,
    page: number = 1,
    offset: number = 10
  ): Promise<Transaction[]> {
    try {
      const response = await fetch(
        `${this.BASE_URL}?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=${page}&offset=${offset}&sort=desc&apikey=${this.API_KEY}`
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: CrossscanApiResponse<Transaction[]> = await response.json()

      if (data.status !== '1') {
        throw new Error(data.message || 'Failed to fetch transactions')
      }

      return data.result
    } catch (error) {
      console.error('Error fetching transactions:', error)
      throw error
    }
  }

  // Get token balances (if supported)
  static async getTokenBalances(address: string): Promise<TokenBalance[]> {
    try {
      const response = await fetch(
        `${this.BASE_URL}?module=account&action=tokenlist&address=${address}&apikey=${this.API_KEY}`
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: CrossscanApiResponse<TokenBalance[]> = await response.json()

      if (data.status !== '1') {
        // Return empty array if token balances not supported
        return []
      }

      return data.result.map(token => ({
        ...token,
        balanceFormatted: this.formatBalance(token.balance, parseInt(token.tokenDecimal))
      }))
    } catch (error) {
      console.error('Error fetching token balances:', error)
      return [] // Return empty array on error
    }
  }

  // Get comprehensive wallet info
  static async getWalletInfo(address: string): Promise<WalletInfo> {
    try {
      const balance = await this.getBalance(address)
      const balanceFormatted = this.formatBalance(balance)

      return {
        address,
        balance,
        balanceFormatted,
        isConnected: true,
        network: 'CROSS Chain',
        lastUpdated: new Date()
      }
    } catch (error) {
      console.error('Error fetching wallet info:', error)
      throw error
    }
  }

  // Get wallet statistics
  static async getWalletStats(address: string): Promise<WalletStats> {
    try {
      const transactions = await this.getTransactions(address, 1, 100)

      const totalTransactions = transactions.length
      const totalValue = transactions
        .reduce((sum, tx) => sum + parseFloat(tx.value), 0)
        .toString()

      const averageGasUsed = totalTransactions > 0
        ? (transactions.reduce((sum, tx) => sum + parseFloat(tx.gasUsed), 0) / totalTransactions).toString()
        : '0'

      const lastTransactionTime = transactions.length > 0
        ? new Date(parseInt(transactions[0].timeStamp) * 1000).toISOString()
        : new Date().toISOString()

      return {
        totalTransactions,
        totalValue,
        averageGasUsed,
        lastTransactionTime
      }
    } catch (error) {
      console.error('Error fetching wallet stats:', error)
      return {
        totalTransactions: 0,
        totalValue: '0',
        averageGasUsed: '0',
        lastTransactionTime: new Date().toISOString()
      }
    }
  }

  // Validate address format
  static isValidAddress(address: string): boolean {
    return /^0x[a-fA-F0-9]{40}$/.test(address)
  }

  // Shorten address for display
  static shortenAddress(address: string): string {
    if (!address) return ''
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }
}