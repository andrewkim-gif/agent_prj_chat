"use client"

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { Separator } from '@/components/ui/separator'
import { getTokenLogo, getTokenConfig } from '@/config/tokens'

interface BlockchainMessageProps {
  message: {
    content: string
    data?: {
      actionType: string
      status?: 'pending' | 'success' | 'failed'
      txHash?: string
      amount?: string
      recipient?: string
      balance?: string
      symbol?: string
      chainName?: string
      [key: string]: any
    }
  }
  onActionClick?: (action: string, data?: any) => void
}

export function BlockchainMessageItem({ message, onActionClick }: BlockchainMessageProps) {
  const { actionType, status, txHash, amount, recipient, balance, symbol, chainName } = message.data || {}

  const getStatusBadge = (status: string) => {
    const baseClasses = "inline-flex items-center border rounded-full px-4 py-1.5 text-sm font-medium shadow-sm"

    switch (status) {
      case 'success':
        return `${baseClasses} border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80`
      case 'pending':
        return `${baseClasses} border-transparent bg-primary/10 text-primary`
      case 'failed':
        return `${baseClasses} bg-destructive text-destructive-foreground`
      default:
        return `${baseClasses} border-transparent bg-muted text-muted-foreground`
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <Icon name="check-circle" size={16} className="text-green-600" />
      case 'pending':
        return <Icon name="spinner" size={16} className="text-primary animate-spin" />
      case 'failed':
        return <Icon name="x-circle" size={16} className="text-destructive" />
      default:
        return <Icon name="info" size={16} className="text-muted-foreground" />
    }
  }

  const renderActionCard = () => {
    switch (actionType) {
      case 'balance_display':
        return (
          <Card className="mt-3 p-4 bg-card text-card-foreground border border-border/40 rounded-xl shadow-lg backdrop-blur">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="inline-flex items-center justify-center h-9 w-9 rounded-full bg-primary/10 hover:scale-105 transition-transform">
                  <Icon name="credit-card" size={16} className="text-primary" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold">현재 잔액</h4>
                  <p className="text-muted-foreground text-sm">지갑 잔액 정보</p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <p className="text-2xl font-bold text-primary">{balance}</p>
                  {(symbol === 'CROSS' || !symbol) && (
                    <img
                      src={getTokenLogo('CROSS')}
                      alt="CROSS"
                      className="w-6 h-6 rounded-full"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{symbol || 'CROSS'}</p>
              </div>
            </div>

            <Separator className="my-3" />

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onActionClick?.('send_tokens')}
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap hover:bg-accent hover:text-accent-foreground px-4 py-2 h-9 rounded-md shadow-sm transition-colors"
              >
                <Icon name="arrow-right" size={14} />
                토큰 보내기
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onActionClick?.('transaction_history')}
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap hover:bg-accent hover:text-accent-foreground px-4 py-2 h-9 rounded-md shadow-sm transition-colors"
              >
                <Icon name="clock-two" size={14} />
                거래 내역
              </Button>
            </div>
          </Card>
        )

      case 'transaction':
        return (
          <Card className="mt-3 p-4 bg-card text-card-foreground border border-border/40 rounded-xl shadow-lg backdrop-blur">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-lg font-semibold flex items-center gap-2">
                <Icon name="arrow-right" size={16} className="text-primary" />
                거래 정보
              </h4>
              <Badge className={getStatusBadge(status || '')}>
                {getStatusIcon(status || '')}
                <span className="ml-1">
                  {status === 'pending' && '진행중'}
                  {status === 'success' && '완료'}
                  {status === 'failed' && '실패'}
                </span>
              </Badge>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">금액:</span>
                <div className="flex items-center gap-2 font-semibold">
                  {(symbol === 'CROSS' || !symbol) && (
                    <img
                      src={getTokenLogo('CROSS')}
                      alt="CROSS"
                      className="w-4 h-4 rounded-full"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  )}
                  {amount} {symbol || 'CROSS'}
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">받는 주소:</span>
                <span className="font-mono text-sm bg-muted px-2 py-1 rounded border">
                  {recipient?.slice(0, 6)}...{recipient?.slice(-4)}
                </span>
              </div>
              {txHash && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">거래 해시:</span>
                  <span className="font-mono text-sm bg-muted px-2 py-1 rounded border">
                    {txHash.slice(0, 6)}...{txHash.slice(-4)}
                  </span>
                </div>
              )}
            </div>

            {status === 'success' && txHash && (
              <div className="mt-4 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="inline-flex items-center justify-center gap-2 whitespace-nowrap hover:bg-accent hover:text-accent-foreground px-4 py-2 h-9 rounded-md shadow-sm transition-colors"
                  onClick={() => window.open(`https://crossscan.com/tx/${txHash}`, '_blank')}
                >
                  <Icon name="external-link" size={14} />
                  익스플로러 보기
                </Button>
              </div>
            )}
          </Card>
        )

      case 'wallet_connection_initiated':
        return (
          <Card className="mt-3 p-4 from-card/50 to-card/30 bg-gradient-to-b backdrop-blur-sm border border-border/40 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center justify-center h-9 w-9 rounded-full bg-primary/10">
                <Icon name="credit-card" size={16} className="text-primary" />
              </div>
              <div>
                <h4 className="font-semibold">지갑 연결 진행중</h4>
                <p className="text-sm text-muted-foreground">지갑 선택 창에서 연결할 지갑을 선택해주세요</p>
              </div>
            </div>
          </Card>
        )

      case 'chain_switch':
        return (
          <Card className="mt-3 p-4 from-card/50 to-card/30 bg-gradient-to-b backdrop-blur-sm border border-border/40 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center justify-center h-9 w-9 rounded-full bg-primary/10">
                <Icon name="refresh" size={16} className="text-primary" />
              </div>
              <div>
                <h4 className="font-semibold">네트워크 전환</h4>
                <p className="text-sm text-muted-foreground">
                  {status === 'pending' ? `${chainName} 네트워크로 전환 중...` : `${chainName} 네트워크로 전환 완료`}
                </p>
              </div>
            </div>
          </Card>
        )

      case 'wallet_required':
        return (
          <Card className="mt-3 p-4 bg-muted/50 border border-border/40 rounded-xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="inline-flex items-center justify-center h-9 w-9 rounded-full bg-muted">
                <Icon name="alert-circle" size={16} className="text-muted-foreground" />
              </div>
              <div>
                <h4 className="font-semibold">지갑 연결 필요</h4>
                <p className="text-sm text-muted-foreground">이 기능을 사용하려면 지갑을 연결해야 합니다</p>
              </div>
            </div>

            <Button
              size="sm"
              onClick={() => onActionClick?.('connect_wallet')}
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 h-9 rounded-md shadow-sm transition-colors"
            >
              <Icon name="credit-card" size={14} className="brightness-0 invert" />
              지갑 연결하기
            </Button>
          </Card>
        )

      case 'amount_required':
      case 'recipient_required':
        return (
          <Card className="mt-3 p-4 bg-muted/50 border border-border/40 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center justify-center h-9 w-9 rounded-full bg-primary/10">
                <Icon name="message-circle" size={16} className="text-primary" />
              </div>
              <div>
                <h4 className="font-semibold">추가 정보 필요</h4>
                <p className="text-sm text-muted-foreground">
                  {actionType === 'amount_required'
                    ? '보낼 금액을 알려주세요'
                    : '받는 주소를 알려주세요'}
                </p>
              </div>
            </div>
          </Card>
        )

      case 'transaction_history':
        return (
          <Card className="mt-3 p-4 bg-card text-card-foreground border border-border/40 rounded-xl shadow-lg backdrop-blur">
            <div className="flex items-center gap-3 mb-3">
              <div className="inline-flex items-center justify-center h-9 w-9 rounded-full bg-primary/10">
                <Icon name="clock-two" size={16} className="text-primary" />
              </div>
              <h4 className="text-lg font-semibold">거래 내역</h4>
            </div>

            <div className="space-y-2">
              {/* 샘플 거래 내역 */}
              <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
                <div className="flex items-center gap-2">
                  <Icon name="arrow-right" size={14} className="text-green-600" />
                  <span className="text-sm">100 CROSS 전송</span>
                </div>
                <span className="text-xs text-muted-foreground">2024-01-15</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
                <div className="flex items-center gap-2">
                  <Icon name="arrow-left" size={14} className="text-blue-600" />
                  <span className="text-sm">50 CROSS 수신</span>
                </div>
                <span className="text-xs text-muted-foreground">2024-01-14</span>
              </div>
            </div>
          </Card>
        )

      case 'error':
        return (
          <Card className="mt-3 p-4 bg-destructive/10 border border-destructive/20 rounded-xl">
            <div className="flex items-center gap-3">
              <Icon name="alert-circle" size={16} className="text-destructive" />
              <div>
                <h4 className="font-semibold text-destructive">오류 발생</h4>
                <p className="text-sm text-destructive/80">처리 중 문제가 발생했습니다</p>
              </div>
            </div>
          </Card>
        )

      default:
        return null
    }
  }

  return (
    <div className="blockchain-message">
      <div className="message-content mb-2">{message.content}</div>
      {actionType && renderActionCard()}
    </div>
  )
}