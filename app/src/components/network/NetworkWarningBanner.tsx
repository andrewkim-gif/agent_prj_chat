"use client"

import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { cn } from '@/lib/utils'
import { useNetworkConfig, useNetworkStore } from '@/stores/networkStore'
import { getNetworkWarnings, DEFAULT_NETWORK } from '@/config/networks'

interface NetworkWarningBannerProps {
  className?: string
  showSwitchButton?: boolean
  dismissible?: boolean
  onDismiss?: () => void
}

export function NetworkWarningBanner({
  className = '',
  showSwitchButton = true,
  dismissible = false,
  onDismiss
}: NetworkWarningBannerProps) {
  const networkConfig = useNetworkConfig()
  const { switchNetwork, switchingNetwork } = useNetworkStore()

  // Only show for testnet
  if (!networkConfig?.testnet) {
    return null
  }

  const warnings = getNetworkWarnings(networkConfig.id)

  const handleSwitchToMainnet = async () => {
    try {
      await switchNetwork(DEFAULT_NETWORK)
    } catch (error) {
      console.error('Failed to switch to mainnet:', error)
    }
  }

  return (
    <div className={cn(
      "relative flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg",
      "dark:bg-yellow-500/10 dark:border-yellow-500/20",
      className
    )}>
      {/* Warning Icon */}
      <Icon name="alert-triangle" className="h-5 w-5 text-yellow-600 dark:text-yellow-500 mt-0.5 flex-shrink-0" />

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-2">
          <h4 className="font-semibold text-yellow-800 dark:text-yellow-400">
            {networkConfig.displayName} 테스트넷에 연결됨
          </h4>
          <span className="text-lg">{networkConfig.icon}</span>
        </div>

        <div className="space-y-1 mb-3">
          {warnings.map((warning, index) => (
            <p key={index} className="text-sm text-yellow-700 dark:text-yellow-300">
              • {warning}
            </p>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {showSwitchButton && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleSwitchToMainnet}
              disabled={switchingNetwork}
              className="bg-white dark:bg-background border-yellow-300 text-yellow-800 hover:bg-yellow-50 dark:hover:bg-yellow-500/20"
            >
              {switchingNetwork ? (
                <>
                  <Icon name="spinner" className="h-3 w-3 mr-2 animate-spin" />
                  전환 중...
                </>
              ) : (
                <>
                  <Icon name="arrow-right" className="h-3 w-3 mr-2" />
                  메인넷으로 전환
                </>
              )}
            </Button>
          )}

          <a
            href={networkConfig.blockExplorer}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-yellow-700 dark:text-yellow-300 hover:underline"
          >
            블록 익스플로러 보기
            <Icon name="external-link" className="h-3 w-3 ml-1 inline" />
          </a>
        </div>
      </div>

      {/* Dismiss Button */}
      {dismissible && onDismiss && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onDismiss}
          className="text-yellow-600 dark:text-yellow-500 hover:bg-yellow-100 dark:hover:bg-yellow-500/20 p-1 h-auto"
        >
          <Icon name="x" className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}