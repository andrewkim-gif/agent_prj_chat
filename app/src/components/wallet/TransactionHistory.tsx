import { useMemo } from 'react';
import { ClockTwo, ExternalLink } from '@mynaui/icons-react';
import type { TransactionHistoryProps } from '@/types/transactions';
import { TransactionHistoryItem } from './TransactionHistoryItem';

// Loading skeleton component
const TransactionHistoryItemSkeleton = () => (
  <div className="w-full p-4 bg-card rounded-xl border border-border/40 animate-pulse">
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between items-center">
        <div className="h-3 bg-muted rounded w-16"></div>
        <div className="h-3 bg-muted rounded w-20"></div>
      </div>
      <div className="flex justify-between items-center">
        <div className="h-3 bg-muted rounded w-24"></div>
        <div className="h-3 bg-muted rounded w-16"></div>
      </div>
    </div>
  </div>
);

// Loading spinner component
const LoadingSpinner = () => (
  <div className="w-full h-16 p-4 rounded-xl flex justify-center items-center gap-4">
    <div className="w-6 h-6 relative">
      <div className="absolute inset-0 border-2 border-primary/20 rounded-full animate-spin border-t-primary"></div>
    </div>
  </div>
);

export function TransactionHistory({
  className = "",
  symbol,
  address,
  tokenAddress,
  chainId,
  deployed,
  transactions = [],
  isLoading = false
}: TransactionHistoryProps) {

  // Mock current wallet address - in real implementation, this would come from wallet context
  const currentWalletAddress = useMemo(() => {
    // This should be retrieved from the wallet context
    return '0x1234567890123456789012345678901234567890';
  }, []);

  // Handle explorer link click
  const handleExplorerClick = () => {
    // Mock explorer URL - in real implementation, this would be based on chain config
    const explorerUrl = `https://etherscan.io/address/${address}`;
    window.open(explorerUrl, '_blank', 'noopener,noreferrer');
  };

  if (isLoading) {
    return (
      <div className={`w-full py-5 flex flex-col justify-start items-start gap-5 ${className}`}>
        <div className="w-full h-6 px-2 bg-muted/30 flex justify-between items-center rounded">
          <div className="flex-1 text-foreground text-base font-semibold">
            Transaction History
          </div>
        </div>
        <div className="w-full px-5 flex flex-col justify-start items-start gap-2">
          {Array.from({ length: 3 }).map((_, index) => (
            <TransactionHistoryItemSkeleton key={index} />
          ))}
        </div>
      </div>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <div className={`w-full py-5 flex flex-col justify-start items-start gap-5 ${className}`}>
        <div className="w-full h-6 px-2 flex justify-between items-center">
          <div className="flex-1 text-foreground text-base font-semibold">
            Transaction History
          </div>
        </div>
        <div className="w-full px-5 flex flex-col justify-start items-start gap-2">
          <div className="w-full flex flex-col items-center justify-center py-12 gap-5">
            <ClockTwo className="w-8 h-8 text-muted-foreground" />
            <div className="text-center text-muted-foreground text-sm">
              No transactions found. Only transactions from the past 30 days are available.
            </div>
            <button
              onClick={handleExplorerClick}
              className="flex items-center gap-2 text-center text-primary text-sm font-normal hover:text-primary/80 transition-colors"
            >
              <span>View on block explorer</span>
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full flex flex-col justify-start items-start gap-5 ${className}`}>
      {/* Header */}
      <div className="w-full h-6 flex justify-between items-center">
        <div className="flex-1 text-foreground text-base font-semibold">
          Transaction History
        </div>
      </div>

      {/* Transaction list */}
      <div className="w-full flex flex-col justify-start items-start gap-2">
        {transactions.map((transaction, index) => (
          <TransactionHistoryItem
            key={`${transaction.tx}-${index}`}
            transaction={transaction}
            symbol={symbol}
            tokenAddress={tokenAddress}
            chainId={chainId}
            currentWalletAddress={currentWalletAddress}
          />
        ))}

        {/* Loading spinner for additional data */}
        {isLoading && <LoadingSpinner />}
      </div>
    </div>
  );
}