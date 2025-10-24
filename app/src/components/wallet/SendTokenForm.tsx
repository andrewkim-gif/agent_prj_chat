"use client"

import { useState, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Copy, X, ArrowLeft } from '@mynaui/icons-react';
import { getCurrencySymbol, formatNumber } from '@/stores/crossWalletStore';
import type { TokenWithChainInfo } from '@/types/crossWallet';
import Decimal from 'decimal.js';
import { cn } from '@/lib/utils';

interface SendTokenFormProps {
  token: TokenWithChainInfo;
  onClose: () => void;
  onBack?: () => void;
  className?: string;
}

// Address validation function
const isValidEthereumAddress = (address: string): boolean => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

// Format address for display
const formatAddress = (address: string): string => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export function SendTokenForm({
  token,
  onClose,
  onBack,
  className = ""
}: SendTokenFormProps) {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{
    recipient?: string;
    amount?: string;
  }>({});

  const currency = token?.currency || 'USD';
  const currencySymbol = getCurrencySymbol(currency);

  // Calculate token balance
  const tokenBalance = useMemo(() => {
    if (!token || !token.deployed) return { amount: '0', value: '0', raw: '0' };

    try {
      const balance = new Decimal(token.balance || '0');
      const divisor = new Decimal(10).pow(token.decimals || 18);
      const tokenAmount = balance.div(divisor);

      const totalValue = token.totalCurrencyPrice || '0';

      return {
        amount: formatNumber(tokenAmount.toNumber(), true),
        value: formatNumber(Number(totalValue), true),
        raw: tokenAmount.toString()
      };
    } catch (error) {
      console.error('Error calculating token balance:', error);
      return { amount: '0', value: '0', raw: '0' };
    }
  }, [token]);

  // Calculate USD value of entered amount
  const enteredAmountValue = useMemo(() => {
    if (!amount || !token?.stats?.convertedPrice) return '0';

    try {
      const amountDecimal = new Decimal(amount);
      const price = new Decimal(token.stats.convertedPrice);
      const value = amountDecimal.mul(price);
      return formatNumber(value.toNumber(), true);
    } catch {
      return '0';
    }
  }, [amount, token?.stats?.convertedPrice]);

  // Validation
  const validateForm = useCallback(() => {
    const newErrors: typeof errors = {};

    // Validate recipient address
    if (!recipient.trim()) {
      newErrors.recipient = 'Recipient address is required';
    } else if (!isValidEthereumAddress(recipient.trim())) {
      newErrors.recipient = 'Please enter a valid Ethereum address';
    }

    // Validate amount
    if (!amount.trim()) {
      newErrors.amount = 'Amount is required';
    } else {
      try {
        const amountDecimal = new Decimal(amount);
        const balanceDecimal = new Decimal(tokenBalance.raw);

        if (amountDecimal.lte(0)) {
          newErrors.amount = 'Amount must be greater than 0';
        } else if (amountDecimal.gt(balanceDecimal)) {
          newErrors.amount = 'Insufficient balance';
        }
      } catch {
        newErrors.amount = 'Please enter a valid amount';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [recipient, amount, tokenBalance.raw]);

  // Handle form submission
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // Mock sending transaction - in real implementation, this would call the wallet SDK
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Show success message (in real implementation, you'd show a transaction hash)
      alert(`Successfully sent ${amount} ${token.symbol} to ${formatAddress(recipient)}`);

      // Close the form
      onClose();
    } catch (error) {
      console.error('Send transaction failed:', error);
      alert('Transaction failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [validateForm, amount, token.symbol, recipient, onClose]);

  // Handle max button click
  const handleMaxClick = useCallback(() => {
    setAmount(tokenBalance.raw);
  }, [tokenBalance.raw]);

  // Handle recipient address paste
  const handlePaste = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      setRecipient(text.trim());
    } catch (error) {
      console.error('Failed to paste from clipboard:', error);
    }
  }, []);

  const isFormValid = useMemo(() => {
    return recipient.trim() &&
           amount.trim() &&
           isValidEthereumAddress(recipient.trim()) &&
           !Object.keys(errors).length;
  }, [recipient, amount, errors]);

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        {onBack && (
          <button
            onClick={onBack}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        <h3 className="text-lg font-semibold text-foreground">
          Send {token.symbol}
        </h3>
        <div className="w-9" /> {/* Spacer for centered title */}
      </div>

      {/* Token Info */}
      <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-xl">
        <Avatar className="size-10 rounded-full">
          <AvatarImage src={token.image} alt={`${token.name} icon`} />
          <AvatarFallback className="text-sm">
            {token.symbol?.charAt(0) || '?'}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="font-medium text-foreground">{token.name}</div>
          <div className="text-sm text-muted-foreground">
            Balance: {tokenBalance.amount} {token.symbol}
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-muted-foreground">
            ≈ {currencySymbol}{tokenBalance.value}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Recipient Address */}
        <div className="space-y-2">
          <Label htmlFor="recipient" className="text-sm font-medium">
            Recipient Address
          </Label>
          <div className="relative">
            <Input
              id="recipient"
              type="text"
              placeholder="0x..."
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className={cn(
                "pr-20",
                errors.recipient && "border-red-500 focus:border-red-500"
              )}
            />
            <button
              type="button"
              onClick={handlePaste}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 text-xs bg-muted text-muted-foreground hover:bg-muted/80 rounded transition-colors"
            >
              Paste
            </button>
          </div>
          {errors.recipient && (
            <div className="flex items-center gap-1 text-xs text-red-600">
              <X className="w-3 h-3" />
              {errors.recipient}
            </div>
          )}
        </div>

        {/* Amount */}
        <div className="space-y-2">
          <Label htmlFor="amount" className="text-sm font-medium">
            Amount
          </Label>
          <div className="relative">
            <Input
              id="amount"
              type="number"
              step="any"
              placeholder="0.0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={cn(
                "pr-16",
                errors.amount && "border-red-500 focus:border-red-500"
              )}
            />
            <button
              type="button"
              onClick={handleMaxClick}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 text-xs bg-primary text-primary-foreground hover:bg-primary/90 rounded transition-colors"
            >
              MAX
            </button>
          </div>
          {amount && !errors.amount && (
            <div className="text-xs text-muted-foreground">
              ≈ {currencySymbol}{enteredAmountValue}
            </div>
          )}
          {errors.amount && (
            <div className="flex items-center gap-1 text-xs text-red-600">
              <X className="w-3 h-3" />
              {errors.amount}
            </div>
          )}
        </div>

        {/* Transaction Summary */}
        {recipient && amount && isFormValid && (
          <div className="p-4 bg-muted/30 rounded-xl space-y-3">
            <div className="text-sm font-medium text-foreground">Transaction Summary</div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Sending</span>
                <span className="text-foreground">{amount} {token.symbol}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">To</span>
                <span className="text-foreground font-mono">{formatAddress(recipient)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Value</span>
                <span className="text-foreground">≈ {currencySymbol}{enteredAmountValue}</span>
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={!isFormValid || isLoading}
          className="w-full py-3 text-base font-medium"
        >
          {isLoading ? 'Sending...' : `Send ${token.symbol}`}
        </Button>
      </form>
    </div>
  );
}