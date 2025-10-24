"use client"

import { useCallback, useMemo } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { getCurrencySymbol, formatNumber } from '@/stores/crossWalletStore';
import { getTokenImageUrl } from '@/services/crossWalletApi';
import { cn } from '@/lib/utils';
import type { TokenWithChainInfo } from '@/types/crossWallet';
import Decimal from 'decimal.js';

interface CompactTokenListItemProps {
  token: TokenWithChainInfo;
  onTokenClick?: (token: TokenWithChainInfo) => void;
  onSendClick?: (token: TokenWithChainInfo) => void;
  showPercentChange?: boolean;
  compact?: boolean;
  showSendButton?: boolean;
  className?: string;
}

export function CompactTokenListItem({
  token,
  onTokenClick,
  onSendClick,
  showPercentChange = true,
  compact = false,
  showSendButton = true,
  className = ""
}: CompactTokenListItemProps) {
  const currency = token.currency || 'USD';
  const currencySymbol = getCurrencySymbol(currency);

  // Get proper token image URL (server or fallback)
  const tokenImageUrl = useMemo(() => {
    return getTokenImageUrl(token);
  }, [token]);

  const isPositiveChange = useMemo(() => {
    const numValue = Number(token.stats?.percentChange24h || 0);
    return numValue > 0;
  }, [token.stats?.percentChange24h]);

  const percentChange24h = useMemo(() => {
    if (!token.stats?.percentChange24h) return null;
    const formatted = formatNumber(Number(token.stats.percentChange24h), false, 2);
    return isPositiveChange ? `+${formatted}%` : `${formatted}%`;
  }, [token.stats?.percentChange24h, isPositiveChange]);

  // 개당 가격 결정 (cross-wallet-desktop 로직)
  const displayUnitPrice = useMemo(() => {
    return token.stats?.convertedPrice || '0';
  }, [token.stats?.convertedPrice]);

  const formattedBalance = useMemo(() => {
    try {
      if (!token.balance || !token.deployed) return '0';

      const balance = new Decimal(token.balance);
      const divisor = new Decimal(10).pow(token.decimals || 18);
      const tokenAmount = balance.div(divisor);

      return formatNumber(tokenAmount.toNumber(), true);
    } catch (error) {
      console.error('Error formatting token balance:', error);
      return '0';
    }
  }, [token.balance, token.decimals, token.deployed]);

  // 총 가격 계산 (cross-wallet-desktop 로직 참고)
  const getDisplayTotalPrice = useCallback(() => {
    // 기존 totalCurrencyPrice가 있으면 사용, 없으면 직접 계산
    if (token.totalCurrencyPrice) {
      return token.totalCurrencyPrice;
    }

    // Decimal.js를 사용하여 정확한 계산
    try {
      const unitPrice = new Decimal(displayUnitPrice || '0');
      const balance = new Decimal(token.balance || '0');
      const divisor = new Decimal(10).pow(token.decimals || 18);
      const tokenBalance = balance.div(divisor);

      const totalPrice = unitPrice.mul(tokenBalance);
      return totalPrice.toString();
    } catch (error) {
      return '0';
    }
  }, [displayUnitPrice, token.balance, token.decimals, token.totalCurrencyPrice]);

  const handleTokenClick = useCallback(() => {
    if (onTokenClick) {
      onTokenClick(token);
    }
  }, [onTokenClick, token]);

  const handleSendClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSendClick) {
      onSendClick(token);
    }
  }, [onSendClick, token]);

  // cross-wallet-desktop 스타일의 컴팩트 모드
  if (compact) {
    return (
      <button
        onClick={handleTokenClick}
        className={cn(
          'w-full h-12 px-1 inline-flex justify-start items-center gap-3 hover:bg-muted/50 transition-colors cursor-pointer bg-transparent text-left rounded-lg',
          className
        )}
      >
        <div className="flex-1 self-stretch flex justify-start items-center gap-3">
          <div className="flex-1 flex justify-start items-center gap-2">
            {/* 토큰 아이콘 영역 */}
            <div className="size-6 flex justify-center items-center">
              <Avatar className="size-6 rounded-full">
                <AvatarImage src={tokenImageUrl} alt={`${token.name} icon`} />
                <AvatarFallback className="text-xs">
                  {token.symbol?.charAt(0) || '?'}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* 토큰 정보 영역 */}
            <div className="inline-flex flex-col justify-center items-start gap-0.5">
              <div className="text-foreground text-xs font-semibold leading-tight truncate">
                {token.symbol}
              </div>
              <div className="text-muted-foreground text-xs font-normal leading-none">
                {currencySymbol}{formatNumber(Number(displayUnitPrice), true)}
              </div>
            </div>
          </div>

          {/* 토큰 수량 영역 */}
          <div className="w-16 inline-flex flex-col justify-center items-end gap-0.5">
            <div className="text-right text-foreground text-xs font-semibold leading-tight">
              {token.deployed ? formattedBalance : '0'}
            </div>
            {token.deployed && (
              <div className="opacity-80 text-right text-muted-foreground text-xs font-normal leading-none">
                {currencySymbol}{formatNumber(Number(getDisplayTotalPrice()), true)}
              </div>
            )}
          </div>
        </div>
      </button>
    );
  }

  // cross-wallet-desktop 스타일의 전체 모드
  return (
    <button
      onClick={handleTokenClick}
      className={cn(
        'w-full h-16 px-1 inline-flex justify-start items-center gap-5 hover:bg-muted/50 transition-colors cursor-pointer bg-transparent text-left rounded-lg',
        className
      )}
    >
      <div className="flex-1 self-stretch flex justify-start items-center gap-5">
        <div className="flex-1 flex justify-start items-center gap-3">
          {/* 토큰 아이콘 영역 */}
          <div className="self-stretch flex justify-start items-center gap-1">
            <div className="size-8 flex justify-end items-end">
              <div className="size-8 relative">
                <Avatar className="size-8 rounded-full">
                  <AvatarImage src={tokenImageUrl} alt={`${token.name} icon`} />
                  <AvatarFallback className="text-sm">
                    {token.symbol?.charAt(0) || '?'}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>
          </div>

          {/* 토큰 정보 영역 */}
          <div className="inline-flex flex-col justify-center items-start gap-1">
            <div className="justify-center text-foreground text-sm font-semibold leading-tight">
              {token.name}
            </div>
            <div className="self-stretch inline-flex justify-start items-center gap-1">
              <div className="justify-center text-muted-foreground text-xs font-normal leading-none">
                {currencySymbol}{formatNumber(Number(displayUnitPrice), true)}
              </div>
              {showPercentChange && percentChange24h && (
                <div
                  className={cn(
                    'justify-center text-xs font-normal leading-none',
                    isPositiveChange ? 'text-point-green' : 'text-point-red'
                  )}
                >
                  {percentChange24h}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 토큰 수량 및 총 가치 영역 */}
        <div className="w-20 inline-flex flex-col justify-center items-end gap-1">
          <div className="text-right justify-start text-foreground text-sm font-semibold leading-tight">
            {token.deployed ? formattedBalance : '0'}
          </div>
          <div className="opacity-80 text-right justify-start text-muted-foreground text-xs font-normal leading-none">
            {token.deployed &&
              `${currencySymbol}${formatNumber(Number(getDisplayTotalPrice()), true)}`}
          </div>
        </div>
      </div>
    </button>
  );
}

export default CompactTokenListItem;