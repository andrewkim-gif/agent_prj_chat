"use client"

import { useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { useCrossWallet } from '@/providers/CrossWalletProvider';
import { getCurrencySymbol } from '@/stores/crossWalletStore';
import { Send, Eye, EyeOff } from '@mynaui/icons-react';

interface CompactTotalAssetsProps {
  className?: string;
  onSendClick?: () => void;
  showSendButton?: boolean;
  compact?: boolean;
}

export function CompactTotalAssets({
  className = '',
  onSendClick,
  showSendButton = true,
  compact = false
}: CompactTotalAssetsProps) {
  const {
    formattedTotalAssets,
    totalAssetsValue,
    currency,
    isShowTotalAssets,
    toggleShowTotalAssets,
    isConnected,
    isLoadingBalance,
  } = useCrossWallet();

  const handleSendClick = useCallback(() => {
    if (onSendClick) {
      onSendClick();
    } else {
      // 기본 송금 액션 (모달 열기 등)
      console.log('Send button clicked');
    }
  }, [onSendClick]);

  const currencySymbol = getCurrencySymbol(currency);

  if (!isConnected) {
    return (
      <div className={`w-full rounded-2xl bg-muted/30 p-4 ${className}`}>
        <div className="flex items-center justify-center">
          <p className="text-sm text-muted-foreground">
            Connect your wallet to see assets
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full rounded-2xl bg-card border border-border/40 p-4 ${className}`}>
      <div className="flex items-center justify-between gap-3">
        {/* 자산 정보 섹션 */}
        <div className="flex-1 min-w-0">
          {/* 헤더 */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-medium text-muted-foreground">
              Total Assets {currency}
            </span>
            <button
              type="button"
              onClick={toggleShowTotalAssets}
              className="p-0.5 rounded hover:bg-muted/50 transition-colors"
              aria-label={isShowTotalAssets ? 'Hide assets' : 'Show assets'}
            >
              {isShowTotalAssets ? (
                <Eye className="w-3.5 h-3.5 text-muted-foreground" />
              ) : (
                <EyeOff className="w-3.5 h-3.5 text-muted-foreground" />
              )}
            </button>
          </div>

          {/* 금액 표시 */}
          <div className="flex items-baseline gap-1">
            {isLoadingBalance ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                <span className="text-sm text-muted-foreground">Loading...</span>
              </div>
            ) : (
              <>
                {isShowTotalAssets ? (
                  <span className={`font-semibold text-foreground ${compact ? 'text-lg' : 'text-2xl'}`}>
                    {formattedTotalAssets}
                  </span>
                ) : (
                  <span className={`font-semibold text-foreground ${compact ? 'text-lg' : 'text-2xl'}`}>
                    {currencySymbol}••••
                  </span>
                )}
              </>
            )}
          </div>

          {/* 추가 정보 (compact 모드가 아닐 때만) */}
          {!compact && (
            <div className="mt-1">
              <span className="text-xs text-muted-foreground">
                Last updated: {new Date().toLocaleTimeString()}
              </span>
            </div>
          )}
        </div>

        {/* 송금 버튼 */}
        {showSendButton && isConnected && (
          <div className="flex-shrink-0">
            <Button
              onClick={handleSendClick}
              size="sm"
              className="h-9 w-9 p-0 rounded-lg"
              disabled={isLoadingBalance || totalAssetsValue === '0'}
              aria-label="Send tokens"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      {/* 연결 상태 표시 (compact 모드가 아닐 때만) */}
      {!compact && (
        <div className="mt-3 pt-3 border-t border-border/40">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span className="text-xs text-muted-foreground">
              Wallet Connected
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// 더 작은 버전을 위한 컴포넌트
export function CompactTotalAssetsMinimal({
  className = '',
  onSendClick,
}: Pick<CompactTotalAssetsProps, 'className' | 'onSendClick'>) {
  return (
    <CompactTotalAssets
      className={className}
      onSendClick={onSendClick}
      showSendButton={true}
      compact={true}
    />
  );
}

export default CompactTotalAssets;