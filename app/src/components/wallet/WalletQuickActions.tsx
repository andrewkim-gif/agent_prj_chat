// Enhanced quick actions with wallet integration

"use client"

import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { useWallet } from '@/hooks/useWallet'

interface WalletQuickActionsProps {
  onSendMessage?: (message: string) => void
}

export function WalletQuickActions({ onSendMessage }: WalletQuickActionsProps) {
  const { walletState, walletInfo } = useWallet()

  // Base quick actions (always available)
  const baseActions = [
    {
      icon: "dollar",
      label: "Check Token Price",
      message: "What are the current prices and market trends for CrossToken and other gaming tokens?"
    },
    {
      icon: "activity",
      label: "Trading Analysis",
      message: "Can you provide a detailed trading analysis for CrossToken including volume, price movements, and market sentiment?"
    },
    {
      icon: "trending-up",
      label: "Market Trends",
      message: "What are the latest market trends in the gaming and DeFi sectors, particularly for cross-chain technologies?"
    }
  ]

  // Wallet-specific actions (only when wallet is connected)
  const walletActions = walletState.isConnected && walletInfo ? [
    {
      icon: "credit-card",
      label: "My Wallet Analysis",
      message: `Please analyze my wallet address ${walletInfo.address}. Show me my balance (${walletInfo.balanceFormatted} CROSS), recent transactions, and any insights about my wallet activity on the CROSS Chain.`
    },
    {
      icon: "activity",
      label: "Transaction History",
      message: `Can you help me understand my recent transaction history for wallet ${walletInfo.address}? Include any patterns, gas usage, and transaction frequency analysis.`
    },
    {
      icon: "shield",
      label: "Wallet Security",
      message: `Please provide security recommendations for my wallet ${walletInfo.address} and best practices for CROSS Chain transactions.`
    }
  ] : []

  const allActions = [...baseActions, ...walletActions]

  return (
    <div className="space-y-2">
      {allActions.map((action, index) => (
        <Button
          key={index}
          variant="outline"
          className="w-full justify-start hover-lift"
          size="sm"
          onClick={() => onSendMessage?.(action.message)}
        >
          <Icon name={action.icon as keyof typeof import('@mynaui/icons-react')} size={16} className="mr-2" />
          {action.label}
        </Button>
      ))}
    </div>
  )
}