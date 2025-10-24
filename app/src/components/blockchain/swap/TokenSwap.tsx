"use client"

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { useTokenManager } from '@/hooks/useTokenManager'
import { useBlockchainWallet } from '@/hooks/useBlockchainWallet'
import { useBlockchainState } from '@/providers/BlockchainStateProvider'
import { TokenBalance } from '@/types/blockchain'
import { cn } from '@/lib/utils'

interface TokenSwapProps {
  className?: string
  onSwapComplete?: (fromToken: string, toToken: string, amount: string) => void
}

interface SwapQuote {
  fromAmount: string
  toAmount: string
  rate: number
  fees: {
    gas: string
    platform: string
    total: string
  }
  route: string[]
  slippage: number
  priceImpact: number
}

export function TokenSwap({ className, onSwapComplete }: TokenSwapProps) {
  const [fromToken, setFromToken] = useState<TokenBalance | null>(null)
  const [toToken, setToToken] = useState<TokenBalance | null>(null)
  const [fromAmount, setFromAmount] = useState('')
  const [toAmount, setToAmount] = useState('')
  const [quote, setQuote] = useState<SwapQuote | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSwapping, setIsSwapping] = useState(false)
  const [showTokenSelector, setShowTokenSelector] = useState<'from' | 'to' | null>(null)
  const [slippageTolerance, setSlippageTolerance] = useState(0.5)

  const { tokens, getTokenPrice } = useTokenManager()
  const { wallet } = useBlockchainWallet()
  const { state, dispatch } = useBlockchainState()

  const availableTokens = tokens.filter(token => parseFloat(token.balance) > 0)

  useEffect(() => {
    if (fromToken && toToken && fromAmount && parseFloat(fromAmount) > 0) {
      fetchQuote()
    } else {
      setQuote(null)
      setToAmount('')
    }
  }, [fromToken, toToken, fromAmount])

  const fetchQuote = async () => {
    if (!fromToken || !toToken) return

    setIsLoading(true)
    try {
      // Mock quote calculation - replace with real DEX API
      const fromPrice = await getTokenPrice(fromToken.symbol)
      const toPrice = await getTokenPrice(toToken.symbol)
      const rate = fromPrice / toPrice
      const calculatedToAmount = parseFloat(fromAmount) * rate

      // Add some slippage and fees
      const slippage = calculatedToAmount * (slippageTolerance / 100)
      const finalToAmount = calculatedToAmount - slippage

      const mockQuote: SwapQuote = {
        fromAmount,
        toAmount: finalToAmount.toFixed(6),
        rate,
        fees: {
          gas: '0.001',
          platform: '0.003',
          total: '0.004'
        },
        route: [fromToken.symbol, toToken.symbol],
        slippage: slippageTolerance,
        priceImpact: 0.1
      }

      setQuote(mockQuote)
      setToAmount(finalToAmount.toFixed(6))
    } catch (error) {
      console.error('Failed to fetch quote:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSwap = async () => {
    if (!fromToken || !toToken || !quote || !wallet.address) return

    setIsSwapping(true)
    try {
      // Mock swap transaction
      const transactionId = `swap_${Date.now()}`

      dispatch({
        type: 'TRANSACTION_ADD',
        payload: {
          id: transactionId,
          from: wallet.address,
          to: wallet.address, // Swap to self
          amount: fromAmount,
          symbol: fromToken.symbol,
          status: 'pending',
          timestamp: new Date(),
          type: 'swap',
          description: `Swap ${fromAmount} ${fromToken.symbol} for ${toAmount} ${toToken.symbol}`
        }
      })

      dispatch({
        type: 'UI_ADD_NOTIFICATION',
        payload: {
          type: 'success',
          message: `Swap transaction submitted: ${fromAmount} ${fromToken.symbol} → ${toAmount} ${toToken.symbol}`
        }
      })

      // Reset form
      setFromAmount('')
      setToAmount('')
      setQuote(null)

      onSwapComplete?.(fromToken.symbol, toToken.symbol, fromAmount)
    } catch (error) {
      console.error('Swap failed:', error)
      dispatch({
        type: 'UI_ADD_NOTIFICATION',
        payload: {
          type: 'error',
          message: 'Swap transaction failed'
        }
      })
    } finally {
      setIsSwapping(false)
    }
  }

  const handleFlipTokens = () => {
    const tempToken = fromToken
    setFromToken(toToken)
    setToToken(tempToken)
    setFromAmount(toAmount)
    setToAmount('')
  }

  const getMaxBalance = () => {
    if (!fromToken) return '0'
    return fromToken.balance
  }

  const setMaxAmount = () => {
    const maxBalance = getMaxBalance()
    setFromAmount(maxBalance)
  }

  const TokenSelector = ({ type }: { type: 'from' | 'to' }) => {
    const tokensToShow = type === 'from' ? availableTokens : tokens

    return (
      <div className="space-y-2 max-h-60 overflow-y-auto">
        {tokensToShow.map((token) => (
          <div
            key={token.symbol}
            className="flex items-center justify-between p-2 hover:bg-muted rounded-lg cursor-pointer"
            onClick={() => {
              if (type === 'from') {
                setFromToken(token)
              } else {
                setToToken(token)
              }
              setShowTokenSelector(null)
            }}
          >
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                {token.logoUrl ? (
                  <img src={token.logoUrl} alt={token.symbol} className="w-4 h-4" />
                ) : (
                  <Icon name="coins" size={12} className="text-primary" />
                )}
              </div>
              <div>
                <div className="font-medium text-sm">{token.symbol}</div>
                <div className="text-xs text-muted-foreground">{token.name}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm">{parseFloat(token.balance).toFixed(4)}</div>
              <div className="text-xs text-muted-foreground">
                {token.value ? `$${token.value.toFixed(2)}` : '-'}
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!wallet.isConnected) {
    return (
      <Card className={cn("p-6 text-center", className)}>
        <Icon name="arrow-up-down" size={48} className="mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">Connect Your Wallet</h3>
        <p className="text-muted-foreground">
          Connect your wallet to start swapping tokens
        </p>
      </Card>
    )
  }

  return (
    <Card className={cn("p-6", className)}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold">Token Swap</h2>
          <p className="text-sm text-muted-foreground">
            Exchange tokens at the best rates
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSlippageTolerance(slippageTolerance === 0.5 ? 1.0 : 0.5)}
        >
          <Icon name="settings" size={16} className="mr-1" />
          {slippageTolerance}% Slippage
        </Button>
      </div>

      {/* From Token */}
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">From</label>
            {fromToken && (
              <button
                onClick={setMaxAmount}
                className="text-xs text-primary hover:underline"
              >
                Max: {parseFloat(getMaxBalance()).toFixed(4)} {fromToken.symbol}
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                type="number"
                placeholder="0.0"
                value={fromAmount}
                onChange={(e) => setFromAmount(e.target.value)}
                className="text-lg font-semibold"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowTokenSelector('from')}
              className="min-w-[120px] justify-start"
            >
              {fromToken ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                    {fromToken.logoUrl ? (
                      <img src={fromToken.logoUrl} alt={fromToken.symbol} className="w-3 h-3" />
                    ) : (
                      <Icon name="coins" size={10} className="text-primary" />
                    )}
                  </div>
                  {fromToken.symbol}
                </div>
              ) : (
                <>
                  <Icon name="chevron-down" size={16} className="mr-1" />
                  Select
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Flip Button */}
        <div className="flex justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={handleFlipTokens}
            disabled={!fromToken || !toToken}
            className="rounded-full w-10 h-10 p-0"
          >
            <Icon name="arrow-up-down" size={16} />
          </Button>
        </div>

        {/* To Token */}
        <div className="space-y-2">
          <label className="text-sm font-medium">To</label>
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                type="number"
                placeholder="0.0"
                value={toAmount}
                readOnly
                className="text-lg font-semibold bg-muted"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowTokenSelector('to')}
              className="min-w-[120px] justify-start"
            >
              {toToken ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                    {toToken.logoUrl ? (
                      <img src={toToken.logoUrl} alt={toToken.symbol} className="w-3 h-3" />
                    ) : (
                      <Icon name="coins" size={10} className="text-primary" />
                    )}
                  </div>
                  {toToken.symbol}
                </div>
              ) : (
                <>
                  <Icon name="chevron-down" size={16} className="mr-1" />
                  Select
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Quote Information */}
      {quote && (
        <div className="mt-6 p-4 bg-muted/50 rounded-lg space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Rate</span>
            <span>1 {fromToken?.symbol} = {quote.rate.toFixed(6)} {toToken?.symbol}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Price Impact</span>
            <span className={quote.priceImpact > 3 ? 'text-red-500' : 'text-green-500'}>
              {quote.priceImpact.toFixed(2)}%
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total Fees</span>
            <span>{quote.fees.total} {state.network.current.symbol}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Minimum Received</span>
            <span>{(parseFloat(quote.toAmount) * (1 - quote.slippage / 100)).toFixed(6)} {toToken?.symbol}</span>
          </div>
        </div>
      )}

      {/* Swap Button */}
      <Button
        className="w-full mt-6"
        size="lg"
        onClick={handleSwap}
        disabled={
          !fromToken ||
          !toToken ||
          !fromAmount ||
          !quote ||
          isLoading ||
          isSwapping ||
          parseFloat(fromAmount) > parseFloat(getMaxBalance())
        }
      >
        {isSwapping ? (
          <>
            <Icon name="spinner" size={16} className="mr-2 animate-spin" />
            Swapping...
          </>
        ) : isLoading ? (
          <>
            <Icon name="spinner" size={16} className="mr-2 animate-spin" />
            Getting Quote...
          </>
        ) : !fromToken || !toToken ? (
          'Select Tokens'
        ) : !fromAmount ? (
          'Enter Amount'
        ) : parseFloat(fromAmount) > parseFloat(getMaxBalance()) ? (
          'Insufficient Balance'
        ) : (
          `Swap ${fromToken.symbol} for ${toToken?.symbol}`
        )}
      </Button>

      {/* Token Selector Modal */}
      {showTokenSelector && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <Card className="p-4 m-4 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">
                Select {showTokenSelector === 'from' ? 'Source' : 'Destination'} Token
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowTokenSelector(null)}
              >
                <Icon name="x" size={16} />
              </Button>
            </div>
            <TokenSelector type={showTokenSelector} />
          </Card>
        </div>
      )}
    </Card>
  )
}