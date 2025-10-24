import { useCallback, useMemo } from 'react';
import { Copy, ExternalLink } from '@mynaui/icons-react';
import type { TransactionItemProps, TransactionType, TransactionStatus } from '@/types/transactions';

// Format functions based on cross-wallet-desktop
const formatAddress = (address: string): string => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

const formatTokenUnits = (amount: string, decimals: number = 18, showDecimals: boolean = true): string => {
  if (!amount) return '0';

  try {
    const value = parseFloat(amount) / Math.pow(10, decimals);
    return showDecimals ? value.toFixed(6).replace(/\.?0+$/, '') : value.toFixed(0);
  } catch {
    return '0';
  }
};

const formatRelativeTime = (timestamp: number): string => {
  if (!timestamp) return '';

  try {
    const now = Date.now();
    const date = new Date(timestamp * 1000);
    const diffMs = now - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) return 'just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHour < 24) return `${diffHour}h ago`;
    if (diffDay < 30) return `${diffDay}d ago`;

    return date.toLocaleDateString();
  } catch {
    return '';
  }
};

export function TransactionHistoryItem({
  className = "",
  transaction,
  symbol,
  currentWalletAddress
}: TransactionItemProps) {

  // Copy functionality
  const handleCopyTxHash = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (transaction.tx) {
      try {
        await navigator.clipboard.writeText(transaction.tx);
        // Could add toast notification here
      } catch (error) {
        console.error('Failed to copy transaction hash:', error);
      }
    }
  }, [transaction.tx]);

  // Status configuration
  const getStatusConfig = useCallback((status: string | undefined) => {
    switch (status) {
      case 'pending':
        return {
          text: 'Pending',
          textColor: 'text-orange-500',
        };
      case 'success':
        return {
          text: 'Completed',
          textColor: 'text-green-600',
        };
      case 'failed':
      case 'fail':
        return {
          text: 'Failed',
          textColor: 'text-red-600',
        };
      default:
        return {
          text: 'Completed',
          textColor: 'text-green-600',
        };
    }
  }, []);

  const statusConfig = useMemo(
    () => getStatusConfig(transaction.status),
    [getStatusConfig, transaction.status]
  );

  const timeText = useMemo(
    () => transaction.timestamp ? formatRelativeTime(transaction.timestamp) : '',
    [transaction.timestamp]
  );

  const addressText = useMemo(
    () => transaction.tx ? formatAddress(transaction.tx) : '',
    [transaction.tx]
  );

  const valueText = useMemo(
    () => transaction.amount ? formatTokenUnits(transaction.amount, 18, true) : '0',
    [transaction.amount]
  );

  // Determine if this is a send or receive transaction
  const isTransfer = useMemo(() => {
    return currentWalletAddress.toLowerCase() !== (transaction?.to || '').toLowerCase();
  }, [currentWalletAddress, transaction?.to]);

  // Determine transaction type
  const transferType: TransactionType = useMemo(() => {
    if (transaction.toAlias && transaction.toAlias.toLowerCase().includes('bridge')) {
      return 'Bridge Out';
    }
    if (transaction.fromAlias && transaction.fromAlias.toLowerCase().includes('bridge')) {
      return 'Bridge In';
    }
    return isTransfer ? 'Send' : 'Receive';
  }, [transaction, isTransfer]);

  return (
    <div
      className={`w-full p-4 bg-card rounded-xl border border-border/40 flex justify-start items-center gap-4 cursor-pointer hover:bg-muted/30 transition-colors ${className}`}
    >
      <div className="flex-1 flex flex-col justify-start items-start gap-1.5">
        {/* First line: Transfer type | TX Hash + Copy button */}
        <div className="w-full flex justify-between items-center">
          <div className="text-muted-foreground text-xs font-normal">
            {transferType}
          </div>
          <div className="flex justify-center items-center gap-1">
            <div className="text-primary text-xs font-normal">
              {addressText}
            </div>
            {transaction.tx && (
              <button
                onClick={handleCopyTxHash}
                className="p-1 rounded hover:bg-muted/50 transition-colors"
                title="Copy transaction hash"
              >
                <Copy className="w-3 h-3 text-muted-foreground hover:text-foreground" />
              </button>
            )}
          </div>
        </div>

        {/* Second line: Status • Time | Amount */}
        <div className="w-full flex justify-between items-center gap-2">
          <div className="flex justify-start items-center gap-1">
            <div className={`text-xs font-normal ${statusConfig.textColor}`}>
              {statusConfig.text}
            </div>
            <div className="w-[3px] h-[3px] bg-muted-foreground rounded-full" />
            <div className="text-muted-foreground text-xs font-normal">
              {timeText}
            </div>
          </div>
          <div className="text-right text-foreground text-xs font-semibold">
            {isTransfer ? '-' : '+'}{valueText} {symbol}
          </div>
        </div>
      </div>
    </div>
  );
}