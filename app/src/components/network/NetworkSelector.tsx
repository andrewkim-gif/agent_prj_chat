"use client"

import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { useNetworkStore, useCurrentNetwork, useNetworkConfig, useIsSwitchingNetwork } from '@/stores/networkStore'
import { NETWORK_CONFIGS } from '@/config/networks'

interface NetworkSelectorProps {
  onNetworkChange?: (networkId: string) => void
  disabled?: boolean
  showTestnets?: boolean
  className?: string
  variant?: 'dropdown' | 'compact' | 'badge'
}

export function NetworkSelector({
  onNetworkChange,
  disabled = false,
  showTestnets = true,
  className = '',
  variant = 'dropdown'
}: NetworkSelectorProps) {
  const currentNetwork = useCurrentNetwork()
  const currentConfig = useNetworkConfig()
  const isSwitching = useIsSwitchingNetwork()
  const { switchNetwork } = useNetworkStore()

  const availableNetworks = Object.values(NETWORK_CONFIGS).filter(
    config => showTestnets || !config.testnet
  )

  const handleNetworkSelect = async (networkId: string) => {
    if (networkId === currentNetwork) {
      return
    }

    try {
      await switchNetwork(networkId)
      onNetworkChange?.(networkId)
    } catch (error) {
      console.error('Failed to switch network:', error)
    }
  }

  if (variant === 'badge') {
    return (
      <div className={cn(
        "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium",
        currentConfig?.testnet ? "bg-yellow-500/10 text-yellow-600 border border-yellow-500/20" : "bg-green-500/10 text-green-600 border border-green-500/20",
        className
      )}>
        <span className="text-lg">{currentConfig?.icon}</span>
        <span>{currentConfig?.displayName}</span>
        {currentConfig?.testnet && (
          <Icon name="alert-triangle" className="h-3 w-3" />
        )}
      </div>
    )
  }

  if (variant === 'compact') {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            disabled={disabled || isSwitching}
            className={cn("h-8 gap-2", className)}
          >
            {isSwitching ? (
              <Icon name="spinner" className="h-3 w-3 animate-spin" />
            ) : (
              <span className="text-sm">{currentConfig?.icon}</span>
            )}
            <span className="text-xs">{currentConfig?.displayName}</span>
            <Icon name="chevron-down" className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[180px]">
          <DropdownMenuLabel>네트워크 선택</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {availableNetworks.map((network) => (
            <DropdownMenuItem
              key={network.id}
              onClick={() => handleNetworkSelect(network.id)}
              className="flex items-center gap-2"
            >
              <span className="text-sm">{network.icon}</span>
              <span className="flex-1">{network.displayName}</span>
              {network.testnet && (
                <Icon name="alert-triangle" className="h-3 w-3 text-yellow-500" />
              )}
              {network.id === currentNetwork && (
                <Icon name="check" className="h-3 w-3 text-green-500" />
              )}
            </DropdownMenuItem>
          ))}
          {showTestnets && (
            <>
              <DropdownMenuSeparator />
              <div className="px-2 py-1.5 text-xs text-muted-foreground">
                ⚠️ 테스트넷은 테스트 목적으로만 사용하세요
              </div>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  // Default dropdown variant
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled || isSwitching}
          className={cn("min-w-[160px] justify-between", className)}
        >
          <div className="flex items-center gap-2">
            {isSwitching ? (
              <Icon name="spinner" className="h-4 w-4 animate-spin" />
            ) : (
              <span className="text-lg">{currentConfig?.icon}</span>
            )}
            <span className="font-medium">{currentConfig?.displayName}</span>
            {currentConfig?.testnet && (
              <Icon name="alert-triangle" className="h-4 w-4 text-yellow-500" />
            )}
          </div>
          <Icon name="chevron-down" className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[240px]">
        <DropdownMenuLabel>네트워크 선택</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {availableNetworks.map((network) => (
          <DropdownMenuItem
            key={network.id}
            onClick={() => handleNetworkSelect(network.id)}
            className="flex items-center gap-3 py-3"
          >
            <span className="text-lg">{network.icon}</span>
            <div className="flex-1">
              <div className="font-medium">{network.displayName}</div>
              <div className="text-xs text-muted-foreground">
                Chain ID: {network.chainId}
              </div>
            </div>
            {network.testnet && (
              <div className="flex items-center gap-1 text-yellow-600">
                <Icon name="alert-triangle" className="h-4 w-4" />
                <span className="text-xs">Testnet</span>
              </div>
            )}
            {network.id === currentNetwork && (
              <Icon name="check" className="h-4 w-4 text-green-500" />
            )}
          </DropdownMenuItem>
        ))}
        {showTestnets && (
          <>
            <DropdownMenuSeparator />
            <div className="px-3 py-2">
              <div className="flex items-start gap-2">
                <Icon name="info" className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-muted-foreground">
                  <p className="font-medium mb-1">테스트넷 주의사항</p>
                  <p>테스트넷의 토큰은 실제 가치가 없으며, 테스트 목적으로만 사용됩니다.</p>
                </div>
              </div>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}