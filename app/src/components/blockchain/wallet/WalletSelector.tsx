"use client"

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Icon } from '@/components/ui/icon'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { WalletSelectorProps, WalletType, SUPPORTED_WALLETS } from '@/types/blockchain'
import { useBlockchainState } from '@/providers/BlockchainStateProvider'
import { useBlockchainWallet } from '@/hooks/useBlockchainWallet'
import { performCompleteReset } from '@/utils/crossWalletReset'

export function WalletSelector({
  isOpen,
  onClose,
  onWalletSelect,
  supportedWallets = ['metamask', 'cross', 'walletconnect', 'hardware']
}: WalletSelectorProps) {
  const { state, dispatch } = useBlockchainState()
  const { connectWallet } = useBlockchainWallet()
  const [connecting, setConnecting] = useState<WalletType | null>(null)

  const availableWallets = SUPPORTED_WALLETS.filter(wallet =>
    supportedWallets.includes(wallet.type)
  )

  const handleWalletClick = async (walletType: WalletType) => {
    setConnecting(walletType)

    try {
      await connectWallet(walletType)

      // Add success notification
      dispatch({
        type: 'UI_ADD_NOTIFICATION',
        payload: {
          type: 'success',
          message: `${walletType} wallet connected successfully.`
        }
      })

      // Call the optional callback
      if (onWalletSelect) {
        onWalletSelect(walletType)
      }

      onClose()
    } catch (error) {
      dispatch({
        type: 'UI_ADD_NOTIFICATION',
        payload: {
          type: 'error',
          message: `Failed to connect ${walletType} wallet.`
        }
      })
    } finally {
      setConnecting(null)
    }
  }

  const renderWalletOption = (wallet: typeof SUPPORTED_WALLETS[0]) => {
    const isAvailable = wallet.isAvailable()
    const isConnecting = connecting === wallet.type
    const isCurrentWallet = state.wallet.type === wallet.type && state.wallet.isConnected

    return (
      <Card
        key={wallet.type}
        className={`p-4 cursor-pointer transition-all duration-200 hover:shadow-md border ${
          isCurrentWallet
            ? 'border-primary bg-primary/5'
            : 'border-border hover:border-primary/50'
        } ${!isAvailable ? 'opacity-50 cursor-not-allowed' : ''}`}
        onClick={() => isAvailable && !isConnecting && handleWalletClick(wallet.type)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Wallet Icon */}
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
              {wallet.type === 'metamask' && (
                <Icon name="zap" size={24} className="text-orange-500" />
              )}
              {wallet.type === 'cross' && (
                <Icon name="zap" size={24} className="text-primary" />
              )}
              {wallet.type === 'walletconnect' && (
                <Icon name="zap" size={24} className="text-blue-500" />
              )}
              {wallet.type === 'hardware' && (
                <Icon name="shield" size={24} className="text-gray-600" />
              )}
            </div>

            {/* Wallet Info */}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-foreground">{wallet.name}</h3>
                {isCurrentWallet && (
                  <Badge className="bg-primary/10 text-primary text-xs">Connected</Badge>
                )}
                {!isAvailable && (
                  <Badge variant="outline" className="text-xs">Unavailable</Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{wallet.description}</p>
            </div>
          </div>

          {/* Connection Status */}
          <div className="flex items-center">
            {isConnecting ? (
              <Icon name="spinner" size={16} className="animate-spin text-primary" />
            ) : isCurrentWallet ? (
              <Icon name="check-circle" size={16} className="text-primary" />
            ) : isAvailable ? (
              <Icon name="arrow-right" size={16} className="text-muted-foreground" />
            ) : (
              <Icon name="x-circle" size={16} className="text-muted-foreground" />
            )}
          </div>
        </div>

        {/* Additional Info for Specific Wallets */}
        {wallet.type === 'walletconnect' && (
          <div className="mt-3 pt-3 border-t border-border/50">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Icon name="zap" size={12} />
              <span>Connect with mobile wallet via QR code</span>
            </div>
          </div>
        )}

        {wallet.type === 'hardware' && (
          <div className="mt-3 pt-3 border-t border-border/50">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Icon name="shield" size={12} />
              <span>Support for Ledger, Trezor and other hardware wallets</span>
            </div>
          </div>
        )}
      </Card>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="credit-card" size={20} />
            Connect Wallet
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Connection Status */}
          {state.wallet.isConnecting && (
            <Card className="p-3 bg-primary/5 border-primary/20">
              <div className="flex items-center gap-3">
                <Icon name="spinner" size={16} className="animate-spin text-primary" />
                <span className="text-sm text-primary">Connecting wallet...</span>
              </div>
            </Card>
          )}

          {/* Error Display */}
          {state.wallet.error && (
            <Card className="p-3 bg-destructive/5 border-destructive/20">
              <div className="flex items-center gap-3">
                <Icon name="alert-circle" size={16} className="text-destructive" />
                <span className="text-sm text-destructive">{state.wallet.error}</span>
              </div>
            </Card>
          )}

          {/* Wallet Options */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">Available Wallets</h4>
            {availableWallets.map(renderWalletOption)}
          </div>

          <Separator />

          {/* Security Notice */}
          <Card className="p-3 bg-muted/50">
            <div className="flex items-start gap-3">
              <Icon name="shield" size={16} className="text-primary mt-0.5" />
              <div className="text-xs text-muted-foreground">
                <p className="font-medium text-foreground mb-1">Security Notice</p>
                <p>Private keys are never stored in ARA Chat when connecting your wallet.</p>
                <p>All transactions are approved directly in your connected wallet.</p>
              </div>
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={state.wallet.isConnecting}
            >
              Cancel
            </Button>

            {/* Reset Cross Wallet button */}
            <Button
              variant="outline"
              onClick={async () => {
                try {
                  await performCompleteReset()
                } catch (error) {
                  console.error('Reset failed:', error)
                }
              }}
              className="flex-1"
              disabled={state.wallet.isConnecting}
              title="Reset Cross Wallet state if connection issues occur"
            >
              <Icon name="refresh-cw" size={16} className="mr-2" />
              Reset Cross
            </Button>

            {/* Quick Connect to Cross Wallet if available */}
            {SUPPORTED_WALLETS.find(w => w.type === 'cross')?.isAvailable() && (
              <Button
                onClick={() => handleWalletClick('cross')}
                className="flex-1"
                disabled={state.wallet.isConnecting}
              >
                <Icon name="zap" size={16} className="mr-2" />
                Cross Wallet
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}