"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { WalletSelector } from '@/components/blockchain/wallet/WalletSelector'
import { WalletDashboard } from '@/components/blockchain/wallet/WalletDashboard'
import { WalletType } from '@/types/blockchain'

export function DemoWalletSelector() {
  const [isOpen, setIsOpen] = useState(false)

  const handleWalletSelect = (type: WalletType) => {
    console.log('Selected wallet:', type)
  }

  const handleWalletAction = (action: string) => {
    console.log('Wallet action:', action)
  }

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-semibold">블록체인 지갑 시스템 데모</h2>

      <div className="space-y-4">
        <Button onClick={() => setIsOpen(true)}>
          지갑 연결하기
        </Button>

        <WalletDashboard
          compact={false}
          showActions={true}
          onActionClick={handleWalletAction}
        />
      </div>

      <WalletSelector
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onWalletSelect={handleWalletSelect}
      />
    </div>
  )
}