// Main wallet section component that combines connection and info display

"use client"

import { useCallback, useRef } from 'react'
import { useWallet } from '@/hooks/useWallet'
import { WalletConnection } from './WalletConnection'
import { WalletInfo } from './WalletInfo'

interface WalletSectionProps {
  onSendMessage?: (message: string) => void
}

export function WalletSection({ onSendMessage }: WalletSectionProps) {
  // Stabilize the callback to prevent infinite loops - use ref to avoid dependency changes
  const onSendMessageRef = useRef(onSendMessage)
  onSendMessageRef.current = onSendMessage

  const handleConnectionSuccess = useCallback((address: string) => {
    if (onSendMessageRef.current) {
      const analysisMessage = `${address} 이 지갑을 요약해줘`
      console.log('🚀 Auto-sending wallet analysis message:', analysisMessage)
      onSendMessageRef.current(analysisMessage)
    }
  }, []) // NO dependencies - completely stable callback

  const {
    walletState,
    walletInfo,
    isLoading,
    connectWallet,
    disconnectWallet,
    refreshWalletData
  } = useWallet({
    onConnectionSuccess: handleConnectionSuccess
  })

  if (walletState.isConnected && walletInfo) {
    return (
      <WalletInfo
        walletInfo={walletInfo}
        onDisconnect={disconnectWallet}
        onRefresh={refreshWalletData}
        isLoading={isLoading}
      />
    )
  }

  return (
    <WalletConnection
      onConnect={connectWallet}
      isConnecting={walletState.isConnecting}
      error={walletState.error}
    />
  )
}