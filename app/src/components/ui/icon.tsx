import React from 'react'
import { cn } from '@/lib/utils'

// Import MynaUI icons as specified in CLAUDE.md
import * as MynaIcons from '@mynaui/icons-react'

interface IconProps extends React.HTMLAttributes<HTMLElement> {
  name: string
  size?: number
}

// MynaUI icon mapping - VERIFIED AVAILABLE ICONS
const iconMapping: Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
  // ✅ CONFIRMED AVAILABLE IN @mynaui/icons-react

  // Core icons
  'message': MynaIcons.Message,
  'send': MynaIcons.Send,
  'menu': MynaIcons.Menu,
  'x': MynaIcons.X,
  'zap': MynaIcons.Zap,
  'user': MynaIcons.User,
  'users': MynaIcons.Users,
  'check': MynaIcons.Check,
  'check-circle': MynaIcons.CheckCircle,
  'activity': MynaIcons.Activity,

  // Arrow family
  'arrow-up': MynaIcons.ArrowUp,
  'arrow-down': MynaIcons.ArrowDown,
  'arrow-left': MynaIcons.ArrowLeft,
  'arrow-right': MynaIcons.ArrowRight,
  'arrow-up-down': MynaIcons.ArrowUpDown,

  // Chevron family
  'chevron-up': MynaIcons.ChevronUp,
  'chevron-down': MynaIcons.ChevronDown,
  'chevron-left': MynaIcons.ChevronLeft,
  'chevron-right': MynaIcons.ChevronRight,

  // Business & UI
  'credit-card': MynaIcons.CreditCard,
  'dollar': MynaIcons.Dollar,
  'trending-up': MynaIcons.TrendingUp,
  'trending-down': MynaIcons.TrendingDown,
  'chart-bar': MynaIcons.ChartBar,
  'shopping-bag': MynaIcons.ShoppingBag,
  'globe': MynaIcons.Globe,
  'shield': MynaIcons.Shield,
  'heart': MynaIcons.Heart,
  'sparkles': MynaIcons.Sparkles,
  'lightning': MynaIcons.Lightning,
  'external-link': MynaIcons.ExternalLink,
  'copy': MynaIcons.Copy,
  'refresh': MynaIcons.Refresh,
  'circle': MynaIcons.Circle,
  'x-circle': MynaIcons.XCircle,
  'info': MynaIcons.Info,
  'mobile': MynaIcons.Mobile,
  'click': MynaIcons.Click,

  // Clock family - Clock doesn't exist in MynaUI, use ClockTwo
  'clock': MynaIcons.ClockTwo,
  'clock-two': MynaIcons.ClockTwo,

  // Smart mappings for commonly used icons that don't exist
  'robot': MynaIcons.User,                // Robot → User (closest match)
  'controller': MynaIcons.Controller,     // Controller → Controller
  'spinner': MynaIcons.Circle,            // Spinner → Circle (loading indicator)
  'gamepad': MynaIcons.Controller,        // Gamepad → Controller (gaming device)
  'brand-x': MynaIcons.BrandX,
  'coins': MynaIcons.Dollar,              // Coins → Dollar (financial)
  'alert-circle': MynaIcons.Info,         // AlertCircle → Info
  'qr-code': MynaIcons.Square,            // QrCode → Square
  'message-circle': MynaIcons.Message,    // MessageCircle → Message

  // Network & Analysis (smart substitutions)
  'network': MynaIcons.Globe,             // Network → Globe
  'fuel': MynaIcons.Zap,                  // Fuel → Zap (energy)
  'switch-horizontal': MynaIcons.ArrowLeftRight, // Switch → ArrowLeftRight
  'help-circle': MynaIcons.Info,          // Help → Info
  'repeat': MynaIcons.Refresh,            // Repeat → Refresh
  'settings': MynaIcons.Cog,              // Settings → Cog

  // Wallet icons (smart fallbacks)
  'cross-wallet': MynaIcons.CreditCard,   // Wallet → CreditCard
  'walletconnect': MynaIcons.Zap,         // WalletConnect → Zap
  'metamask': MynaIcons.Shield,           // MetaMask → Shield
  'wallet': MynaIcons.CreditCard,         // Wallet → CreditCard
  'ethereum': MynaIcons.Circle,           // Ethereum → Circle
  'binance': MynaIcons.Dollar,            // Binance → Dollar
  'coinbase': MynaIcons.CreditCard        // Coinbase → CreditCard
}

// Fallback hierarchy for icons that might not exist in MynaUI
const fallbackHierarchy: Record<string, string[]> = {
  'network': ['Globe', 'Activity', 'Circle'],
  'fuel': ['Zap', 'Lightning', 'Activity'],
  'switch-horizontal': ['ArrowUpDown', 'Refresh', 'Activity'],
  'help-circle': ['Info', 'AlertCircle', 'Circle'],
  'repeat': ['Refresh', 'Activity', 'Circle'],
  'settings': ['Cog', 'Activity', 'Circle'],
  'bolt': ['Lightning', 'Zap', 'Activity'],
  'qr-code': ['QrCode', 'Square', 'Circle'],
  'message-circle': ['Message', 'Circle'],
  'alert-circle': ['AlertCircle', 'Info', 'Circle']
}

function resolveIcon(name: string): React.ComponentType<React.SVGProps<SVGSVGElement>> | null {
  // Guard against undefined/null/empty name
  if (!name || typeof name !== 'string') {
    return null
  }

  // 1. Direct mapping
  if (iconMapping[name]) {
    return iconMapping[name]
  }

  // 2. Try to find in MynaIcons directly (for exact name matches)
  const mynaIconsRecord = MynaIcons as Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>>
  const directIcon = mynaIconsRecord[name] || mynaIconsRecord[name.charAt(0).toUpperCase() + name.slice(1)]
  if (directIcon) {
    return directIcon
  }

  // 3. Fallback hierarchy
  if (fallbackHierarchy[name]) {
    for (const fallbackName of fallbackHierarchy[name]) {
      const fallbackIcon = mynaIconsRecord[fallbackName]
      if (fallbackIcon) {
        console.info(`Icon "${name}" → fallback to "${fallbackName}"`)
        return fallbackIcon
      }
    }
  }

  // 4. Ultimate fallback to Circle or Info
  return MynaIcons.Circle || MynaIcons.Info || null
}

export function Icon({ name, size = 24, className, ...props }: IconProps) {
  const IconComponent = resolveIcon(name)

  if (!IconComponent) {
    // Complete failure - show error indicator
    console.error(`Icon system failure: "${name}" has no available component`)
    return (
      <div
        className={cn(
          'inline-flex items-center justify-center bg-destructive/10 border border-destructive/20 rounded text-xs text-destructive',
          className
        )}
        style={{ width: size, height: size }}
        title={`Icon error: ${name}`}
      >
        ⚠
      </div>
    )
  }

  return (
    <IconComponent
      className={cn('inline-block', className)}
      style={{ width: size, height: size, ...props.style }}
      {...props}
    />
  )
}

// Debug utility to check available icons
export const debugIconSystem = () => {
  const allIcons = Object.keys(iconMapping)
  const mynaIconKeys = Object.keys(MynaIcons)

  console.group('Icon System Debug (MynaUI)')
  console.log('Mapped icons:', allIcons.length)
  console.log('Available MynaUI icons:', mynaIconKeys.length)
  console.log('Mapped icon names:', allIcons)
  console.groupEnd()

  return { mapped: allIcons, available: mynaIconKeys }
}

// Export for development use
export const getAvailableIcons = (): string[] => Object.keys(iconMapping)