"use client"

import { useCallback, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Icon } from '@/components/ui/icon';
import { cn } from '@/lib/utils';
import { getCurrencySymbol, formatNumber } from '@/stores/crossWalletStore';
import type { TokenWithChainInfo } from '@/types/crossWallet';
import type { TokenTransaction } from '@/types/transactions';
import { TransactionHistory } from './TransactionHistory';
import { TokenPriceChart } from './TokenPriceChart';
import Decimal from 'decimal.js';

interface TokenDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  token: TokenWithChainInfo | null;
  onSendClick?: (token: TokenWithChainInfo) => void;
  className?: string;
}

export function TokenDetailModal({
  isOpen,
  onClose,
  token,
  onSendClick,
  className = ""
}: TokenDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'chart' | 'transactions'>('overview');

  // Mock transaction data - in real implementation, this would come from API
  const mockTransactions: TokenTransaction[] = useMemo(() => [
    {
      tx: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
      amount: '1500000000000000000',
      from: '0xabcdef1234567890abcdef1234567890abcdef12',
      to: '0x1234567890123456789012345678901234567890',
      timestamp: Math.floor(Date.now() / 1000) - 3600,
      status: 'success',
      chainId: token?.chainId || 1,
      blockNumber: 18500000,
      gasUsed: 21000,
      gasPrice: 20000000000
    },
    {
      tx: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
      amount: '500000000000000000',
      from: '0x1234567890123456789012345678901234567890',
      to: '0xabcdef1234567890abcdef1234567890abcdef12',
      timestamp: Math.floor(Date.now() / 1000) - 7200,
      status: 'success',
      chainId: token?.chainId || 1,
      blockNumber: 18499500,
      gasUsed: 21000,
      gasPrice: 18000000000
    },
    {
      tx: '0xfedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321',
      amount: '2000000000000000000',
      from: '0x9876543210987654321098765432109876543210',
      to: '0x1234567890123456789012345678901234567890',
      timestamp: Math.floor(Date.now() / 1000) - 86400,
      status: 'success',
      chainId: token?.chainId || 1,
      blockNumber: 18495000,
      gasUsed: 21000,
      gasPrice: 22000000000
    }
  ], [token?.chainId]);

  const currency = token?.currency || 'USD';
  const currencySymbol = getCurrencySymbol(currency);

  // 토큰 잔액 계산
  const tokenBalance = useMemo(() => {
    if (!token || !token.deployed) return { amount: '0', value: '0' };

    try {
      const balance = new Decimal(token.balance || '0');
      const divisor = new Decimal(10).pow(token.decimals || 18);
      const tokenAmount = balance.div(divisor);

      const totalValue = token.totalCurrencyPrice || '0';

      return {
        amount: formatNumber(tokenAmount.toNumber(), true),
        value: formatNumber(Number(totalValue), true)
      };
    } catch (error) {
      console.error('Error calculating token balance:', error);
      return { amount: '0', value: '0' };
    }
  }, [token]);

  // 가격 변화 정보
  const priceChange = useMemo(() => {
    if (!token?.stats?.percentChange24h) return null;

    const change = Number(token.stats.percentChange24h);
    const isPositive = change > 0;
    const formatted = formatNumber(Math.abs(change), false, 2);

    return {
      isPositive,
      formatted: `${isPositive ? '+' : '-'}${formatted}%`,
      className: isPositive ? 'text-point-green' : 'text-point-red'
    };
  }, [token?.stats?.percentChange24h]);

  // 현재 가격
  const currentPrice = useMemo(() => {
    if (!token?.stats?.convertedPrice) return '0';
    return formatNumber(Number(token.stats.convertedPrice), true);
  }, [token?.stats?.convertedPrice]);

  // 송금 버튼 클릭 핸들러
  const handleSendClick = useCallback(() => {
    if (token && onSendClick) {
      onSendClick(token);
      onClose();
    }
  }, [token, onSendClick, onClose]);

  // 탐색기에서 보기
  const handleViewOnExplorer = useCallback(() => {
    if (!token?.address || !token?.chainId) return;

    // Cross mainnet explorer URL
    const explorerUrl = `https://scan.crosstoken.io/token/${token.address}`;
    window.open(explorerUrl, '_blank', 'noopener,noreferrer');
  }, [token?.address, token?.chainId]);

  if (!token) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn("max-w-4xl w-full max-h-[90vh] overflow-hidden", className)}>
        <DialogHeader className="border-b border-border pb-4">
          <DialogTitle className="flex items-center gap-3">
            <Avatar className="size-8 rounded-full">
              <AvatarImage src={token.image} alt={`${token.name} icon`} />
              <AvatarFallback className="text-sm">
                {token.symbol?.charAt(0) || '?'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="text-lg font-semibold text-foreground">{token.name}</div>
              <div className="text-sm text-muted-foreground">{token.symbol}</div>
            </div>
            <button
              onClick={handleViewOnExplorer}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
              title="View on Explorer"
            >
              <Icon name="external-link" size={16} className="text-muted-foreground" />
            </button>
          </DialogTitle>
        </DialogHeader>

        <div className="overflow-y-auto flex-1">
          {/* 탭 네비게이션 */}
          <div className="flex border-b border-border mb-4">
            <button
              onClick={() => setActiveTab('overview')}
              className={cn(
                "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
                activeTab === 'overview'
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('chart')}
              className={cn(
                "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
                activeTab === 'chart'
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              Price Chart
            </button>
            <button
              onClick={() => setActiveTab('transactions')}
              className={cn(
                "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
                activeTab === 'transactions'
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              Transactions
            </button>
          </div>

          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* 현재 가격 */}
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Current Price</div>
                <div className="flex items-center gap-2">
                  <div className="text-2xl font-bold text-foreground">
                    {currencySymbol}{currentPrice}
                  </div>
                  {priceChange && (
                    <div className={cn("text-sm font-medium", priceChange.className)}>
                      {priceChange.formatted}
                    </div>
                  )}
                </div>
              </div>

              {/* 보유 수량 */}
              <div className="bg-muted/50 rounded-xl p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <div className="text-sm font-medium text-foreground">My Balance</div>
                  {token.deployed && (
                    <button
                      onClick={handleSendClick}
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                    >
                      Send
                    </button>
                  )}
                </div>
                <div className="space-y-1">
                  <div className="text-xl font-semibold text-foreground">
                    {tokenBalance.amount} {token.symbol}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    ≈ {currencySymbol}{tokenBalance.value}
                  </div>
                </div>
              </div>

              {/* 토큰 정보 */}
              <div className="space-y-4">
                <div className="text-sm font-medium text-foreground">Token Information</div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Contract Address</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono text-foreground">
                        {token.address ? `${token.address.slice(0, 6)}...${token.address.slice(-4)}` : 'N/A'}
                      </span>
                      {token.address && (
                        <button
                          onClick={() => navigator.clipboard.writeText(token.address)}
                          className="p-1 hover:bg-muted rounded transition-colors"
                          title="Copy address"
                        >
                          <Icon name="copy" size={12} className="text-muted-foreground" />
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Decimals</span>
                    <span className="text-sm text-foreground">{token.decimals || 18}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Chain ID</span>
                    <span className="text-sm text-foreground">{token.chainId || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Status</span>
                    <span className={cn(
                      "text-sm font-medium",
                      token.deployed ? "text-point-green" : "text-muted-foreground"
                    )}>
                      {token.deployed ? 'Deployed' : 'Not Deployed'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'chart' && (
            <div className="space-y-4">
              <TokenPriceChart
                tokenAddress={token.address || ''}
                tokenSymbol={token.symbol || ''}
                tokenName={token.name || ''}
                currency={currency}
              />
            </div>
          )}

          {activeTab === 'transactions' && (
            <div className="space-y-4">
              <TransactionHistory
                symbol={token.symbol || ''}
                address={token.address || ''}
                tokenAddress={token.address || ''}
                chainId={token.chainId || 1}
                deployed={token.deployed || false}
                transactions={mockTransactions}
                isLoading={false}
              />
            </div>
          )}
        </div>

        {/* 하단 액션 버튼들 */}
        {token.deployed && (
          <div className="border-t border-border pt-4 flex gap-3">
            <button
              onClick={handleSendClick}
              className="flex-1 bg-primary text-primary-foreground py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              Send {token.symbol}
            </button>
            <button
              onClick={handleViewOnExplorer}
              className="px-4 py-3 border border-border rounded-lg font-medium hover:bg-muted transition-colors"
            >
              <Icon name="external-link" size={16} />
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default TokenDetailModal;