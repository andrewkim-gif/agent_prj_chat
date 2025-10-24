import React from 'react'
import { cn } from '@/lib/utils'

interface IconProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  name: string
  size?: number
  fallback?: string
}

// 개선된 아이콘 매핑 시스템
// 실제 존재하는 파일들과 매핑
const iconMap: Record<string, string> = {
  // 실제 존재하는 파일들
  'message': '/assets/icons/message.svg',
  'message-check': '/assets/icons/message-check.svg',
  'message-dots': '/assets/icons/message-dots.svg',
  'message-plus': '/assets/icons/message-plus.svg',
  'message-reply': '/assets/icons/message-reply.svg',
  'message-x': '/assets/icons/message-x.svg',

  // Arrow 계열 - 실제 존재
  'arrow-up': '/assets/icons/arrow-up.svg',
  'arrow-down': '/assets/icons/arrow-down.svg',
  'arrow-left': '/assets/icons/arrow-left.svg',
  'arrow-right': '/assets/icons/arrow-right.svg',
  'arrow-up-down': '/assets/icons/arrow-up-down.svg',
  'arrow-left-right': '/assets/icons/arrow-left-right.svg',

  // Chevron 계열 - 실제 존재
  'chevron-up': '/assets/icons/chevron-up.svg',
  'chevron-down': '/assets/icons/chevron-down.svg',
  'chevron-left': '/assets/icons/chevron-left.svg',
  'chevron-right': '/assets/icons/chevron-right.svg',
  'chevron-up-down': '/assets/icons/chevron-up-down.svg',

  // Chart 계열 - 실제 존재
  'chart-bar': '/assets/icons/chart-bar.svg',
  'chart-line': '/assets/icons/chart-line.svg',
  'chart-pie': '/assets/icons/chart-pie.svg',
  'chart-area': '/assets/icons/chart-area.svg',

  // Check 계열 - 실제 존재
  'check': '/assets/icons/check.svg',
  'check-circle': '/assets/icons/check-circle.svg',
  'check-square': '/assets/icons/check-square.svg',

  // Activity 계열 - 실제 존재
  'activity': '/assets/icons/activity.svg',
  'activity-square': '/assets/icons/activity-square.svg',

  // Brand 계열 - 실제 존재
  'brand-x': '/assets/icons/brand-x.svg',

  // 매핑이 필요한 아이콘들 (별칭 사용)
  'network': '/assets/icons/chart-network.svg',        // chart-network.svg 존재
  'fuel': '/assets/icons/fuel.svg',                    // 존재하지 않음 -> 다른 아이콘 사용
  'switch-horizontal': '/assets/icons/arrow-left-right.svg', // arrow-left-right.svg 사용
  'help-circle': '/assets/icons/help-circle.svg',      // 확인 필요
  'repeat': '/assets/icons/repeat.svg',                // 확인 필요
  'settings': '/assets/icons/settings.svg',            // 확인 필요
  'external-link': '/assets/icons/external-link.svg',  // 확인 필요
  'copy': '/assets/icons/copy.svg',                    // 확인 필요
  'info': '/assets/icons/info.svg',                    // 확인 필요
  'alert-circle': '/assets/icons/alert-circle.svg',    // 확인 필요

  // UI Controls
  'x': '/assets/icons/x.svg',
  'x-circle': '/assets/icons/x-circle.svg',
  'circle': '/assets/icons/circle.svg',

  // Business/Financial
  'dollar': '/assets/icons/dollar.svg',
  'coins': '/assets/icons/coins.svg',
  'credit-card': '/assets/icons/credit-card.svg',

  // Trending
  'trending-up': '/assets/icons/trending-up.svg',
  'trending-down': '/assets/icons/trending-down.svg',

  // Common UI
  'globe': '/assets/icons/globe.svg',
  'shield': '/assets/icons/shield.svg',
  'zap': '/assets/icons/zap.svg',
  'heart': '/assets/icons/heart.svg',
  'sparkles': '/assets/icons/sparkles.svg',

  // Navigation
  'send': '/assets/icons/send.svg',
  'menu': '/assets/icons/menu.svg',
  'refresh': '/assets/icons/refresh.svg',

  // User/Social
  'user': '/assets/icons/user.svg',
  'users': '/assets/icons/users.svg',

  // Time/Clock
  'clock': '/assets/icons/clock.svg',
  'clock-two': '/assets/icons/clock-two.svg',

  // Technology
  'robot': '/assets/icons/robot.svg',
  'controller': '/assets/icons/controller.svg',
  'gamepad': '/assets/icons/gamepad.svg',
  'spinner': '/assets/icons/spinner.svg',

  // Mobile/Device
  'mobile': '/assets/icons/mobile.svg',
  'qr-code': '/assets/icons/qr-code.svg',

  // Additional
  'lightning': '/assets/icons/lightning.svg',
  'bolt': '/assets/icons/bolt.svg',
  'shopping-bag': '/assets/icons/shopping-bag.svg',
  'click': '/assets/icons/click.svg',
  'message-circle': '/assets/icons/message-circle.svg',

  // Wallet specific icons (fallback to available icons)
  'cross-wallet': '/assets/icons/credit-card.svg',     // Use credit-card as fallback
  'walletconnect': '/assets/icons/zap.svg',            // Use zap as shown in system reminder
  'metamask': '/assets/icons/shield.svg',              // Use shield as fallback
  'wallet': '/assets/icons/credit-card.svg',           // Use credit-card as fallback
  'ethereum': '/assets/icons/circle.svg',              // Use circle as fallback
  'binance': '/assets/icons/coins.svg',                // Use coins as fallback
  'coinbase': '/assets/icons/credit-card.svg'          // Use credit-card as fallback
}

// 아이콘 존재 여부를 확인하는 헬퍼 함수
const checkIconExists = async (path: string): Promise<boolean> => {
  try {
    const response = await fetch(path, { method: 'HEAD' })
    return response.ok
  } catch {
    return false
  }
}

// Fallback 아이콘 계층구조
const fallbackHierarchy: Record<string, string[]> = {
  // 네트워크 관련
  'network': ['chart-network', 'globe', 'circle', 'message'],
  'fuel': ['zap', 'lightning', 'bolt', 'circle', 'message'],
  'switch-horizontal': ['arrow-left-right', 'arrow-up-down', 'refresh', 'message'],

  // 지갑 관련
  'cross-wallet': ['credit-card', 'wallet', 'circle', 'message'],
  'walletconnect': ['zap', 'lightning', 'circle', 'message'],
  'metamask': ['shield', 'circle', 'message'],
  'wallet': ['credit-card', 'circle', 'message'],
  'ethereum': ['circle', 'message'],
  'binance': ['coins', 'circle', 'message'],
  'coinbase': ['credit-card', 'circle', 'message'],

  // UI 관련
  'help-circle': ['info', 'circle', 'message'],
  'repeat': ['refresh', 'arrow-up-down', 'circle', 'message'],
  'settings': ['circle', 'message'],
  'external-link': ['arrow-right', 'message'],
  'copy': ['circle', 'message'],
  'alert-circle': ['info', 'circle', 'message']
}

export function Icon({ name, size = 24, className, fallback, ...props }: IconProps) {
  const [iconPath, setIconPath] = React.useState<string | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState(false)

  React.useEffect(() => {
    const loadIcon = async () => {
      setIsLoading(true)
      setError(false)

      // 1. 직접 매핑된 아이콘 확인
      if (iconMap[name]) {
        const exists = await checkIconExists(iconMap[name])
        if (exists) {
          setIconPath(iconMap[name])
          setIsLoading(false)
          return
        }
      }

      // 2. Fallback 계층구조 확인
      if (fallbackHierarchy[name]) {
        for (const fallbackName of fallbackHierarchy[name]) {
          if (iconMap[fallbackName]) {
            const exists = await checkIconExists(iconMap[fallbackName])
            if (exists) {
              setIconPath(iconMap[fallbackName])
              setIsLoading(false)
              return
            }
          }
        }
      }

      // 3. 사용자 지정 fallback 확인
      if (fallback && iconMap[fallback]) {
        const exists = await checkIconExists(iconMap[fallback])
        if (exists) {
          setIconPath(iconMap[fallback])
          setIsLoading(false)
          return
        }
      }

      // 4. 기본 message 아이콘 사용
      const messageExists = await checkIconExists(iconMap['message'])
      if (messageExists) {
        setIconPath(iconMap['message'])
      } else {
        setError(true)
      }

      setIsLoading(false)
    }

    loadIcon()
  }, [name, fallback])

  // 로딩 중일 때
  if (isLoading) {
    return (
      <div
        className={cn('inline-flex items-center justify-center bg-muted/50 rounded animate-pulse', className)}
        style={{ width: size, height: size }}
        title={`Loading icon: ${name}`}
      >
        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse" />
      </div>
    )
  }

  // 에러가 발생했을 때
  if (error || !iconPath) {
    console.warn(`Icon "${name}" not found and no fallback available`)
    return (
      <div
        className={cn('inline-flex items-center justify-center bg-muted rounded text-xs text-muted-foreground border border-dashed border-muted-foreground', className)}
        style={{ width: size, height: size }}
        title={`Missing icon: ${name}`}
      >
        ?
      </div>
    )
  }

  return (
    <img
      src={iconPath}
      alt={name}
      width={size}
      height={size}
      className={cn('inline-block', className)}
      onError={() => {
        console.warn(`Icon file failed to load: ${iconPath}`)
        setError(true)
      }}
      {...props}
    />
  )
}

// 아이콘 존재 여부를 미리 확인하는 유틸리티 함수
export const preloadIcons = async (iconNames: string[]): Promise<Record<string, boolean>> => {
  const results: Record<string, boolean> = {}

  for (const name of iconNames) {
    if (iconMap[name]) {
      results[name] = await checkIconExists(iconMap[name])
    } else {
      results[name] = false
    }
  }

  return results
}

// 사용 가능한 모든 아이콘 이름을 반환하는 함수
export const getAvailableIcons = (): string[] => {
  return Object.keys(iconMap)
}

// 아이콘 시스템 상태를 확인하는 디버그 함수
export const debugIconSystem = async () => {
  const allIcons = Object.keys(iconMap)
  const results = await preloadIcons(allIcons)

  const available = Object.entries(results).filter(([_, exists]) => exists)
  const missing = Object.entries(results).filter(([_, exists]) => !exists)

  console.group('Icon System Debug')
  console.log('Total icons:', allIcons.length)
  console.log('Available:', available.length)
  console.log('Missing:', missing.length)
  console.log('Available icons:', available.map(([name]) => name))
  console.log('Missing icons:', missing.map(([name]) => name))
  console.groupEnd()

  return { available, missing, total: allIcons.length }
}