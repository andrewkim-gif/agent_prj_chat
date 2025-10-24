"use client"

import { useState } from 'react'
import { WalletSelector } from '@/components/blockchain/wallet/WalletSelector'
import { UnifiedWalletDashboard } from '@/components/wallet/UnifiedWalletDashboard'
import { useBlockchainWallet } from '@/hooks/useBlockchainWallet'
import { useCrossWallet } from '@/providers/CrossWalletProvider'
import { cn } from '@/lib/utils'
import type { TokenWithChainInfo } from '@/types/crossWallet'

interface ChatSidebarProps {
  onSendMessage: (message: string) => void
  className?: string
}


export function ChatSidebar({ onSendMessage, className }: ChatSidebarProps) {
  const [showWalletSelector, setShowWalletSelector] = useState(false)
  const { wallet, crossAccount, disconnectWallet: disconnectBlockchainWallet } = useBlockchainWallet()
  const { disconnectWallet } = useCrossWallet()

  const handleWalletAction = async (action: string) => {
    switch (action) {
      case 'send':
        onSendMessage('I want to send tokens from my wallet. Help me with the transfer process.')
        break
      case 'receive':
        onSendMessage('Show me my wallet address and how to receive tokens.')
        break
      case 'history':
        onSendMessage('Show me my transaction history and recent activity.')
        break
      case 'disconnect':
        // 실제 지갑 연결해제 수행
        try {
          console.log('🔌 ChatSidebar: Starting wallet disconnection...')
          await disconnectWallet()
          if (disconnectBlockchainWallet) {
            await disconnectBlockchainWallet()
          }
          console.log('✅ ChatSidebar: All wallets disconnected successfully')

          // 상태 업데이트 강제 트리거
          window.dispatchEvent(new CustomEvent('wallet-disconnected'))
        } catch (error) {
          console.error('❌ ChatSidebar: Failed to disconnect wallet:', error)
        }
        break
      default:
        console.log('Unknown wallet action:', action)
    }
  }

  const handleTokenClick = (token: TokenWithChainInfo) => {
    onSendMessage(`Tell me about ${token.name} (${token.symbol}) token. Show me its current price, market cap, and recent price movements.`)
  }

  const handleTokenSend = (token?: TokenWithChainInfo) => {
    if (token) {
      onSendMessage(`I want to send ${token.symbol} tokens from my wallet. Help me with the transfer process.`)
    } else {
      onSendMessage('I want to send tokens from my wallet. Help me choose which tokens to send.')
    }
  }

  return (
    <div className={cn("w-80 bg-card border-r border-border h-full flex flex-col pt-16", className)}>
      {/* Unified Wallet Dashboard */}
      <div className="p-4 border-b border-border">
        <UnifiedWalletDashboard
          compact={true}
          showActions={true}
          onActionClick={handleWalletAction}
          onConnectWallet={() => setShowWalletSelector(true)}
          onTokenClick={handleTokenClick}
          onSendClick={handleTokenSend}
          className="border-0 bg-muted/50"
        />
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto">
        {/* Additional content can be added here in the future */}
      </div>

      {/* Wallet Selector Modal */}
      <WalletSelector
        isOpen={showWalletSelector}
        onClose={() => setShowWalletSelector(false)}
        onWalletSelect={(type) => {
          // Get the connected wallet address
          // const walletAddress = crossAccount?.address || wallet.address

          // if (walletAddress) {
          //   onSendMessage(`${type} wallet has been connected. My wallet address is ${walletAddress}. Please analyze my wallet and provide insights about my holdings.`)
          // } else {
          //   onSendMessage(`${type} wallet connection initiated. Please wait for the connection to complete.`)
          // }
        }}
      />
    </div>
  )
}