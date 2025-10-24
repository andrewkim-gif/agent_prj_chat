"use client"

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { Badge } from '@/components/ui/badge'
import { useBlockchainState } from '@/providers/BlockchainStateProvider'
import { useBlockchainWallet } from '@/hooks/useBlockchainWallet'
import { NetworkInfo, SUPPORTED_NETWORKS } from '@/types/blockchain'
import { cn } from '@/lib/utils'

interface NetworkManagerProps {
  className?: string
  showHeader?: boolean
  compact?: boolean
}

export function NetworkManager({
  className,
  showHeader = true,
  compact = false
}: NetworkManagerProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [switchingTo, setSwitchingTo] = useState<number | null>(null)

  const { state, dispatch } = useBlockchainState()
  const { wallet } = useBlockchainWallet()

  const switchNetwork = async (network: NetworkInfo) => {
    if (!wallet.isConnected) {
      dispatch({
        type: 'UI_ADD_NOTIFICATION',
        payload: {
          type: 'error',
          message: 'Please connect your wallet first'
        }
      })
      return
    }

    setSwitchingTo(network.chainId)
    setIsLoading(true)

    try {
      dispatch({
        type: 'NETWORK_SWITCH_START',
        payload: network.chainId
      })

      // Mock network switch - replace with real wallet integration
      await new Promise(resolve => setTimeout(resolve, 2000))

      dispatch({
        type: 'NETWORK_SWITCH_SUCCESS',
        payload: network
      })

      dispatch({
        type: 'UI_ADD_NOTIFICATION',
        payload: {
          type: 'success',
          message: `Switched to ${network.name}`
        }
      })
    } catch (error) {
      console.error('Failed to switch network:', error)
      dispatch({
        type: 'NETWORK_SWITCH_ERROR',
        payload: 'Failed to switch network'
      })

      dispatch({
        type: 'UI_ADD_NOTIFICATION',
        payload: {
          type: 'error',
          message: `Failed to switch to ${network.name}`
        }
      })
    } finally {
      setIsLoading(false)
      setSwitchingTo(null)
    }
  }

  const getNetworkStatus = (network: NetworkInfo) => {
    const isCurrent = state.network.current.chainId === network.chainId
    const isConnected = wallet.isConnected && isCurrent

    if (isConnected) return 'connected'
    if (isCurrent) return 'selected'
    return 'available'
  }

  const getNetworkStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-green-500'
      case 'selected': return 'bg-blue-500'
      default: return 'bg-gray-400'
    }
  }

  const formatChainId = (chainId: number) => {
    return `Chain ID: ${chainId}`
  }

  const formatBlockTime = (blockTime?: number) => {
    if (!blockTime) return 'Unknown'
    return `~${blockTime}s`
  }

  if (compact) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <div className="flex items-center gap-2">
          <div className={cn("w-2 h-2 rounded-full", getNetworkStatusColor(getNetworkStatus(state.network.current)))} />
          <span className="text-sm font-medium">{state.network.current.name}</span>
        </div>
        {wallet.isConnected && (
          <Button
            variant="outline"
            size="sm"
            disabled={isLoading}
            onClick={() => {}} // This would open network selector
          >
            <Icon name="chevron-down" size={14} />
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className={cn("space-y-4", className)}>
      {showHeader && (
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold">Network Manager</h2>
              <p className="text-sm text-muted-foreground">
                Manage your blockchain network connections
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled={isLoading}
              onClick={() => window.location.reload()}
            >
              <Icon name="refresh" size={16} className={cn("mr-1", isLoading && "animate-spin")} />
              Refresh
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="text-lg font-semibold">{state.network.current.name}</div>
              <div className="text-sm text-muted-foreground">Current Network</div>
            </div>
            <div>
              <div className="text-lg font-semibold">{state.network.supported.length}</div>
              <div className="text-sm text-muted-foreground">Supported Networks</div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <div className={cn("w-2 h-2 rounded-full", getNetworkStatusColor(getNetworkStatus(state.network.current)))} />
                <span className="text-lg font-semibold">
                  {wallet.isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              <div className="text-sm text-muted-foreground">Connection Status</div>
            </div>
          </div>
        </Card>
      )}

      <Card className="p-4">
        <h3 className="font-semibold mb-4">Available Networks</h3>
        <div className="space-y-3">
          {SUPPORTED_NETWORKS.map((network) => {
            const status = getNetworkStatus(network)
            const isSwitching = switchingTo === network.chainId

            return (
              <div
                key={network.chainId}
                className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      {network.logoUrl ? (
                        <img src={network.logoUrl} alt={network.name} className="w-6 h-6" />
                      ) : (
                        <Icon name="globe" size={20} className="text-primary" />
                      )}
                    </div>
                    <div className={cn(
                      "absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-background",
                      getNetworkStatusColor(status)
                    )} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{network.name}</h4>
                      {network.isTestnet && (
                        <Badge variant="outline" className="text-xs">
                          Testnet
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatChainId(network.chainId)} • Block time: {formatBlockTime(network.blockTime)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {status === 'connected' && 'Connected'}
                      {status === 'selected' && 'Selected'}
                      {status === 'available' && 'Available'}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {network.symbol}
                    </div>
                  </div>

                  {status !== 'connected' && (
                    <Button
                      variant={status === 'selected' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => switchNetwork(network)}
                      disabled={isLoading || !wallet.isConnected}
                    >
                      {isSwitching ? (
                        <>
                          <Icon name="spinner" size={14} className="mr-1 animate-spin" />
                          Switching...
                        </>
                      ) : status === 'selected' ? (
                        'Connect'
                      ) : (
                        'Switch'
                      )}
                    </Button>
                  )}

                  {status === 'connected' && (
                    <Badge variant="default" className="text-xs">
                      <Icon name="check" size={12} className="mr-1" />
                      Active
                    </Badge>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      {/* Network Details */}
      <Card className="p-4">
        <h3 className="font-semibold mb-4">Current Network Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-muted-foreground">Network Name</div>
            <div className="font-medium">{state.network.current.name}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Chain ID</div>
            <div className="font-medium">{state.network.current.chainId}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Native Token</div>
            <div className="font-medium">{state.network.current.symbol}</div>
          </div>
          <div>
            <div className="text-muted-foreground">RPC URL</div>
            <div className="font-mono text-xs">{state.network.current.rpcUrl}</div>
          </div>
          {state.network.current.blockExplorer && (
            <div className="md:col-span-2">
              <div className="text-muted-foreground">Block Explorer</div>
              <a
                href={state.network.current.blockExplorer}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline font-mono text-xs"
              >
                {state.network.current.blockExplorer}
              </a>
            </div>
          )}
        </div>
      </Card>

      {!wallet.isConnected && (
        <Card className="p-6 text-center">
          <Icon name="credit-card" size={48} className="mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Connect Your Wallet</h3>
          <p className="text-muted-foreground mb-4">
            Connect your wallet to switch between networks
          </p>
        </Card>
      )}
    </div>
  )
}