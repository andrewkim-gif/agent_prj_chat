"use client"

import React from 'react';
import { cn } from '@/lib/utils';
import { Icon } from '@/components/ui/icon';
import { useNetworkTokens, useTokenCounts } from '@/providers/NetworkTokenProvider';

interface TokenDisplayModeToggleProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showCounts?: boolean;
  orientation?: 'horizontal' | 'vertical';
}

export function TokenDisplayModeToggle({
  className = '',
  size = 'md',
  showCounts = true,
  orientation = 'horizontal'
}: TokenDisplayModeToggleProps) {
  const { displayMode, setDisplayMode, isRefreshing } = useNetworkTokens();
  const { totalCount, ownedCount } = useTokenCounts();

  // Size configurations
  const sizeConfig = {
    sm: {
      button: 'px-3 py-1.5 text-xs',
      icon: 16,
      gap: 'gap-1'
    },
    md: {
      button: 'px-4 py-2 text-sm',
      icon: 18,
      gap: 'gap-2'
    },
    lg: {
      button: 'px-5 py-2.5 text-base',
      icon: 20,
      gap: 'gap-3'
    }
  };

  const config = sizeConfig[size];

  // Toggle options
  const toggleOptions = [
    {
      mode: 'owned' as const,
      label: '보유 토큰',
      icon: 'CreditCard',
      count: ownedCount,
      description: '잔액이 있는 토큰만 표시'
    },
    {
      mode: 'all' as const,
      label: '전체 토큰',
      icon: 'Coins',
      count: totalCount,
      description: '네트워크에서 지원하는 모든 토큰 표시'
    }
  ];

  const handleModeChange = (mode: 'owned' | 'all') => {
    if (isRefreshing) return; // 새로고침 중에는 모드 변경 방지
    setDisplayMode(mode);
  };

  return (
    <div className={cn('space-y-2', className)}>
      {/* Toggle Buttons */}
      <div className={cn(
        'flex bg-muted rounded-lg p-1',
        orientation === 'vertical' ? 'flex-col' : 'flex-row'
      )}>
        {toggleOptions.map(({ mode, label, icon, count }) => {
          const isActive = displayMode === mode;
          const isDisabled = isRefreshing;

          return (
            <button
              key={mode}
              onClick={() => handleModeChange(mode)}
              disabled={isDisabled}
              className={cn(
                'flex items-center justify-center rounded-md transition-all duration-200',
                config.button,
                config.gap,
                orientation === 'vertical' ? 'w-full' : 'flex-1',
                isActive
                  ? 'bg-background text-foreground shadow-sm border border-border'
                  : 'text-muted-foreground hover:text-foreground hover:bg-background/50',
                isDisabled && 'opacity-50 cursor-not-allowed'
              )}
              title={toggleOptions.find(opt => opt.mode === mode)?.description}
            >
              {/* Icon */}
              <Icon
                name={icon as any}
                size={config.icon}
                className={cn(
                  'transition-colors',
                  isActive ? 'text-primary' : 'text-muted-foreground'
                )}
              />

              {/* Label */}
              <span className="font-medium">
                {label}
              </span>

              {/* Count Badge */}
              {showCounts && (
                <span className={cn(
                  'px-1.5 py-0.5 rounded-full text-xs font-medium transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'bg-muted-foreground/10 text-muted-foreground'
                )}>
                  {isRefreshing ? '...' : count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Mode Description */}
      <div className="text-xs text-muted-foreground px-1">
        {isRefreshing ? (
          <div className="flex items-center gap-1">
            <Icon name="Spinner" size={12} className="animate-spin" />
            <span>토큰 목록을 새로고침 중...</span>
          </div>
        ) : (
          toggleOptions.find(opt => opt.mode === displayMode)?.description
        )}
      </div>
    </div>
  );
}

// Compact version for small spaces
export function TokenDisplayModeToggleCompact({
  className = '',
  showLabels = false
}: {
  className?: string;
  showLabels?: boolean;
}) {
  const { displayMode, setDisplayMode, isRefreshing } = useNetworkTokens();
  const { totalCount, ownedCount } = useTokenCounts();

  const handleToggle = () => {
    if (isRefreshing) return;
    setDisplayMode(displayMode === 'owned' ? 'all' : 'owned');
  };

  const currentCount = displayMode === 'owned' ? ownedCount : totalCount;
  const currentIcon = displayMode === 'owned' ? 'CreditCard' : 'Coins';
  const currentLabel = displayMode === 'owned' ? '보유' : '전체';

  return (
    <button
      onClick={handleToggle}
      disabled={isRefreshing}
      className={cn(
        'flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-200',
        'bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground',
        'border border-transparent hover:border-border',
        isRefreshing && 'opacity-50 cursor-not-allowed',
        className
      )}
      title={displayMode === 'owned' ? '전체 토큰 보기' : '보유 토큰만 보기'}
    >
      <Icon
        name={isRefreshing ? 'Spinner' : currentIcon as any}
        size={16}
        className={cn(
          'transition-colors',
          isRefreshing && 'animate-spin'
        )}
      />

      {showLabels && (
        <span className="text-sm font-medium">
          {currentLabel}
        </span>
      )}

      <span className="px-1.5 py-0.5 bg-background rounded-full text-xs font-medium">
        {isRefreshing ? '...' : currentCount}
      </span>
    </button>
  );
}

// Mini version for very compact layouts
export function TokenDisplayModeToggleMini({
  className = ''
}: {
  className?: string;
}) {
  const { displayMode, setDisplayMode, isRefreshing } = useNetworkTokens();
  const { totalCount, ownedCount } = useTokenCounts();

  const handleToggle = () => {
    if (isRefreshing) return;
    setDisplayMode(displayMode === 'owned' ? 'all' : 'owned');
  };

  const currentCount = displayMode === 'owned' ? ownedCount : totalCount;

  return (
    <button
      onClick={handleToggle}
      disabled={isRefreshing}
      className={cn(
        'flex items-center justify-center w-8 h-8 rounded-full transition-all duration-200',
        'bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground',
        isRefreshing && 'opacity-50 cursor-not-allowed',
        className
      )}
      title={displayMode === 'owned' ? '전체 토큰 보기' : '보유 토큰만 보기'}
    >
      {isRefreshing ? (
        <Icon name="Spinner" size={14} className="animate-spin" />
      ) : (
        <span className="text-xs font-bold">
          {currentCount}
        </span>
      )}
    </button>
  );
}

export default TokenDisplayModeToggle;