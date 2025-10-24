"use client"

import { Icon } from '@/components/ui/icon'
import { cn } from '@/lib/utils'
import { useCurrentNetwork, useNetworkConfig, useNetworkStore } from '@/stores/networkStore'

interface NetworkStatusIndicatorProps {
  className?: string
  showDetails?: boolean
  showChainId?: boolean
  variant?: 'full' | 'compact' | 'minimal'
}

export function NetworkStatusIndicator({
  className = '',
  showDetails = false,
  showChainId = false,
  variant = 'full'
}: NetworkStatusIndicatorProps) {
  const currentNetwork = useCurrentNetwork()
  const networkConfig = useNetworkConfig()
  const { isConnected, networkError } = useNetworkStore()

  if (!networkConfig) {
    return (
      <div className={cn("flex items-center gap-2 text-red-500", className)}>
        <Icon name="alert-triangle" className="h-4 w-4" />
        <span className="text-sm">Unknown Network</span>
      </div>
    )
  }

  const getStatusColor = () => {
    if (networkError) return 'text-red-500'
    if (!isConnected) return 'text-yellow-500'
    if (networkConfig.testnet) return 'text-yellow-600'
    return 'text-green-500'
  }

  const getStatusIcon = () => {
    if (networkError) return 'x-circle'
    if (!isConnected) return 'clock'
    return 'check-circle'
  }

  if (variant === 'minimal') {
    return (
      <div className={cn("flex items-center gap-1.5", className)}>
        <span className="text-sm">{networkConfig.icon}</span>
        <div className={cn("w-2 h-2 rounded-full", {
          'bg-green-500': isConnected && !networkConfig.testnet && !networkError,
          'bg-yellow-500': (isConnected && networkConfig.testnet) || !isConnected,
          'bg-red-500': networkError
        })} />
      </div>
    )
  }

  if (variant === 'compact') {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <span className="text-lg">{networkConfig.icon}</span>
        <div className="flex flex-col">
          <div className="flex items-center gap-1">
            <span className="text-sm font-medium">{networkConfig.displayName}</span>
            {networkConfig.testnet && (
              <Icon name="alert-triangle" className="h-3 w-3 text-yellow-500" />
            )}
          </div>
          <div className={cn("flex items-center gap-1 text-xs", getStatusColor())}>
            <Icon name={getStatusIcon()} className="h-3 w-3" />
            <span>
              {networkError ? 'Error' :
               !isConnected ? 'Connecting' :
               'Connected'}
            </span>
          </div>
        </div>
      </div>
    )
  }

  // Full variant
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="flex items-center gap-2">
        <span className="text-xl">{networkConfig.icon}</span>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold">{networkConfig.displayName}</span>
            {networkConfig.testnet && (
              <div className="flex items-center gap-1 px-2 py-0.5 bg-yellow-500/10 text-yellow-600 rounded-full text-xs">
                <Icon name="alert-triangle" className="h-3 w-3" />
                <span>Testnet</span>
              </div>
            )}
          </div>

          {showDetails && (
            <div className="text-xs text-muted-foreground space-y-1">
              {showChainId && (
                <div>Chain ID: {networkConfig.chainId}</div>
              )}
              <div>RPC: {networkConfig.rpcUrl}</div>
            </div>
          )}
        </div>
      </div>

      {/* Connection Status */}
      <div className={cn("flex items-center gap-1.5", getStatusColor())}>
        <Icon name={getStatusIcon()} className="h-4 w-4" />
        <span className="text-sm font-medium">
          {networkError ? 'Error' :
           !isConnected ? 'Connecting...' :
           'Connected'}
        </span>
      </div>

      {/* Error Display */}
      {networkError && (
        <div className="text-xs text-red-500 max-w-xs truncate" title={networkError}>
          {networkError}
        </div>
      )}
    </div>
  )
}