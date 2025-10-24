"use client"

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { Badge } from '@/components/ui/badge'
import { useTransactionState } from '@/providers/BlockchainStateProvider'
import { useBlockchainWallet } from '@/hooks/useBlockchainWallet'
import { Transaction } from '@/types/blockchain'
import { cn } from '@/lib/utils'

interface TransactionHistoryProps {
  className?: string
  showHeader?: boolean
  limit?: number
  compact?: boolean
  filterType?: 'all' | 'send' | 'receive' | 'swap' | 'bridge'
}

export function TransactionHistory({
  className,
  showHeader = true,
  limit,
  compact = false,
  filterType = 'all'
}: TransactionHistoryProps) {
  const [selectedFilter, setSelectedFilter] = useState<string>(filterType)
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest')
  const [expandedTx, setExpandedTx] = useState<string | null>(null)

  const transactions = useTransactionState()
  const { wallet } = useBlockchainWallet()

  const getTransactionIcon = (type?: string) => {
    switch (type) {
      case 'send': return 'arrow-right'
      case 'receive': return 'arrow-left'
      case 'swap': return 'arrow-up-down'
      case 'bridge': return 'bridge'
      default: return 'transaction'
    }
  }

  const getTransactionColor = (type?: string) => {
    switch (type) {
      case 'send': return 'text-red-500'
      case 'receive': return 'text-green-500'
      case 'swap': return 'text-blue-500'
      case 'bridge': return 'text-purple-500'
      default: return 'text-foreground'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-500'
      case 'pending': return 'bg-yellow-500'
      case 'failed': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const formatAmount = (amount: string, symbol: string, type?: string) => {
    const num = parseFloat(amount)
    const sign = type === 'receive' ? '+' : type === 'send' ? '-' : ''
    return `${sign}${num.toFixed(6)} ${symbol}`
  }

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - timestamp.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return timestamp.toLocaleDateString()
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const filteredTransactions = () => {
    let filtered = [...transactions.history]

    if (selectedFilter !== 'all') {
      filtered = filtered.filter(tx => tx.type === selectedFilter)
    }

    filtered.sort((a, b) => {
      return sortOrder === 'newest' ?
        b.timestamp.getTime() - a.timestamp.getTime() :
        a.timestamp.getTime() - b.timestamp.getTime()
    })

    if (limit) {
      filtered = filtered.slice(0, limit)
    }

    return filtered
  }

  const openTransactionInExplorer = (tx: Transaction) => {
    if (tx.hash) {
      // This would open the transaction in a block explorer
      console.log(`Opening transaction ${tx.hash} in explorer`)
    }
  }

  if (!wallet.isConnected) {
    return (
      <Card className={cn("p-6 text-center", className)}>
        <Icon name="clock-two" size={48} className="mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">Connect Your Wallet</h3>
        <p className="text-muted-foreground">
          Connect your wallet to view your transaction history
        </p>
      </Card>
    )
  }

  return (
    <div className={cn("space-y-4", className)}>
      {showHeader && (
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold">Transaction History</h2>
              <p className="text-sm text-muted-foreground">
                Your recent blockchain transactions
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest')}
              >
                <Icon name="clock-two" size={16} className="mr-1" />
                {sortOrder === 'newest' ? 'Newest' : 'Oldest'}
              </Button>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            {['all', 'send', 'receive', 'swap', 'bridge'].map((filter) => (
              <Button
                key={filter}
                variant={selectedFilter === filter ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedFilter(filter)}
              >
                <Icon name={getTransactionIcon(filter === 'all' ? undefined : filter)} size={16} className="mr-1" />
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </Button>
            ))}
          </div>
        </Card>
      )}

      <Card className="p-4">
        {transactions.pending.length > 0 && (
          <div className="mb-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Pending Transactions</h3>
            <div className="space-y-2">
              {transactions.pending.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className={cn("w-2 h-2 rounded-full animate-pulse", getStatusColor(tx.status))} />
                    <Icon name={getTransactionIcon(tx.type)} size={16} className={getTransactionColor(tx.type)} />
                    <div>
                      <div className="font-medium text-sm">
                        {formatAmount(tx.amount, tx.symbol, tx.type)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {tx.type === 'send' ? `To ${formatAddress(tx.to)}` : `From ${formatAddress(tx.from)}`}
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    Pending
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-2">
          {filteredTransactions().length === 0 ? (
            <div className="text-center py-8">
              <Icon name="clock-two" size={32} className="mx-auto mb-2 text-muted-foreground" />
              <p className="text-muted-foreground">No transactions found</p>
            </div>
          ) : (
            filteredTransactions().map((tx) => (
              <div key={tx.id} className="border border-border rounded-lg">
                <div
                  className="flex items-center justify-between p-3 hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => setExpandedTx(expandedTx === tx.id ? null : tx.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn("w-2 h-2 rounded-full", getStatusColor(tx.status))} />
                    <Icon name={getTransactionIcon(tx.type)} size={16} className={getTransactionColor(tx.type)} />
                    <div>
                      <div className={cn("font-medium text-sm", getTransactionColor(tx.type))}>
                        {formatAmount(tx.amount, tx.symbol, tx.type)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {tx.type === 'send' ? `To ${formatAddress(tx.to)}` : `From ${formatAddress(tx.from)}`}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground">
                      {formatTimestamp(tx.timestamp)}
                    </div>
                    <Badge
                      variant={tx.status === 'confirmed' ? 'default' : 'outline'}
                      className="text-xs"
                    >
                      {tx.status}
                    </Badge>
                  </div>
                </div>

                {expandedTx === tx.id && (
                  <div className="px-3 pb-3 border-t border-border bg-muted/20">
                    <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                      <div>
                        <div className="text-muted-foreground">Transaction ID</div>
                        <div className="font-mono text-xs">{tx.id}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Block Number</div>
                        <div className="font-mono text-xs">{tx.blockNumber || 'Pending'}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Gas Used</div>
                        <div className="font-mono text-xs">{tx.gasUsed || 'N/A'}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Gas Price</div>
                        <div className="font-mono text-xs">{tx.gasPrice || 'N/A'} Gwei</div>
                      </div>
                      {tx.description && (
                        <div className="col-span-2">
                          <div className="text-muted-foreground">Description</div>
                          <div className="text-xs">{tx.description}</div>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 mt-3">
                      {tx.hash && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openTransactionInExplorer(tx)}
                        >
                          <Icon name="external-link" size={14} className="mr-1" />
                          View in Explorer
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigator.clipboard.writeText(tx.hash || tx.id)}
                      >
                        <Icon name="copy" size={14} className="mr-1" />
                        Copy Hash
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {limit && filteredTransactions().length >= limit && (
          <div className="text-center mt-4">
            <Button variant="outline" size="sm">
              View All Transactions
            </Button>
          </div>
        )}
      </Card>
    </div>
  )
}