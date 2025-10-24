"use client"

import { useState, useCallback } from 'react'

interface ChatCommand {
  type: 'send_cross' | 'send_token' | 'check_balance' | 'connect_wallet' | 'switch_chain' | 'transaction_history'
  amount?: string
  recipient?: string
  token?: string
  chain?: 'cross' | 'bsc'
  confidence: number
}

interface ChatMessage {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
  data?: {
    actionType?: string
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

// 한국어 명령어 패턴 매칭
const COMMAND_PATTERNS = {
  SEND_CROSS: [
    /(\d+(?:\.\d+)?)\s*cross\s*(?:를|을)?\s*보내(?:줘|라|기)/i,
    /cross\s*(?:를|을)?\s*보내(?:줘|라|기)/i,
    /(?:크로스|cross)\s*전송/i,
    /(\d+(?:\.\d+)?)\s*(?:크로스|cross)\s*(?:를|을)?\s*(?:0x[a-fA-F0-9]{40})\s*(?:로|에게|에)\s*보내(?:줘|라|기)/i
  ],
  CHECK_BALANCE: [
    /잔액\s*(?:확인|체크|조회)/i,
    /balance\s*(?:확인|체크|조회)/i,
    /얼마\s*(?:있어|가지고|소유)/i,
    /내\s*(?:돈|자산|잔고)/i
  ],
  CONNECT_WALLET: [
    /지갑\s*연결/i,
    /wallet\s*(?:연결|connect)/i,
    /지갑\s*(?:을|를)\s*연결/i
  ],
  SWITCH_CHAIN: [
    /(cross|bsc|크로스|비에스씨)\s*(?:체인|로)\s*(?:바꿔|전환|스위치)/i,
    /체인\s*(?:바꿔|전환|스위치)/i
  ],
  TRANSACTION_HISTORY: [
    /거래\s*(?:내역|히스토리|기록)/i,
    /transaction\s*(?:history|list)/i,
    /트랜잭션\s*(?:내역|히스토리|기록)/i
  ]
}

export function useBlockchainChatProcessor() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [walletState, setWalletState] = useState<{
    isConnected: boolean
    address?: string
    balance?: string
    symbol?: string
    chainId?: number
  }>({
    isConnected: false
  })

  const parseCommand = useCallback((message: string): ChatCommand | null => {
    const cleanMessage = message.trim().toLowerCase()

    // SEND_CROSS 패턴 확인
    for (const pattern of COMMAND_PATTERNS.SEND_CROSS) {
      const match = message.match(pattern)
      if (match) {
        return {
          type: 'send_cross',
          amount: match[1] || null,
          confidence: 0.9
        }
      }
    }

    // CHECK_BALANCE 패턴 확인
    for (const pattern of COMMAND_PATTERNS.CHECK_BALANCE) {
      if (pattern.test(cleanMessage)) {
        return {
          type: 'check_balance',
          confidence: 0.95
        }
      }
    }

    // CONNECT_WALLET 패턴 확인
    for (const pattern of COMMAND_PATTERNS.CONNECT_WALLET) {
      if (pattern.test(cleanMessage)) {
        return {
          type: 'connect_wallet',
          confidence: 0.9
        }
      }
    }

    // SWITCH_CHAIN 패턴 확인
    for (const pattern of COMMAND_PATTERNS.SWITCH_CHAIN) {
      const match = cleanMessage.match(pattern)
      if (match) {
        return {
          type: 'switch_chain',
          chain: match[1]?.toLowerCase().includes('bsc') ? 'bsc' : 'cross',
          confidence: 0.85
        }
      }
    }

    // TRANSACTION_HISTORY 패턴 확인
    for (const pattern of COMMAND_PATTERNS.TRANSACTION_HISTORY) {
      if (pattern.test(cleanMessage)) {
        return {
          type: 'transaction_history',
          confidence: 0.9
        }
      }
    }

    return null
  }, [])

  const processBlockchainCommand = useCallback(async (command: ChatCommand): Promise<ChatMessage | null> => {
    setIsProcessing(true)

    try {
      const messageId = Date.now().toString()

      switch (command.type) {
        case 'connect_wallet':
          // Cross SDK의 지갑 연결 기능 시뮬레이션
          setTimeout(() => {
            setWalletState({
              isConnected: true,
              address: '0x1234...abcd',
              balance: '1000.5',
              symbol: 'CROSS',
              chainId: 4157
            })
          }, 2000)

          return {
            id: messageId,
            type: 'assistant',
            content: '지갑 연결을 시작합니다. 지갑 선택 창이 열릴 예정입니다.',
            timestamp: new Date(),
            data: {
              actionType: 'wallet_connection_initiated',
              status: 'pending'
            }
          }

        case 'check_balance':
          if (!walletState.isConnected) {
            return {
              id: messageId,
              type: 'assistant',
              content: '지갑을 먼저 연결해주세요. "지갑 연결해줘"라고 말씀해주시면 도와드리겠습니다.',
              timestamp: new Date(),
              data: {
                actionType: 'wallet_required',
                status: 'failed'
              }
            }
          }

          return {
            id: messageId,
            type: 'assistant',
            content: `현재 잔액을 확인했습니다.`,
            timestamp: new Date(),
            data: {
              actionType: 'balance_display',
              balance: walletState.balance,
              symbol: walletState.symbol,
              status: 'success'
            }
          }

        case 'send_cross':
          if (!walletState.isConnected) {
            return {
              id: messageId,
              type: 'assistant',
              content: '지갑을 먼저 연결해주세요.',
              timestamp: new Date(),
              data: {
                actionType: 'wallet_required',
                status: 'failed'
              }
            }
          }

          if (!command.amount) {
            return {
              id: messageId,
              type: 'assistant',
              content: '얼마를 보내시겠습니까? 예: "100 Cross 보내줘"',
              timestamp: new Date(),
              data: {
                actionType: 'amount_required',
                status: 'pending'
              }
            }
          }

          return {
            id: messageId,
            type: 'assistant',
            content: `${command.amount} CROSS를 어디로 보내드릴까요? 받는 주소를 알려주세요.`,
            timestamp: new Date(),
            data: {
              actionType: 'recipient_required',
              amount: command.amount,
              status: 'pending'
            }
          }

        case 'switch_chain':
          const targetChain = command.chain === 'bsc' ? 'BSC' : 'Cross'
          return {
            id: messageId,
            type: 'assistant',
            content: `${targetChain} 네트워크로 전환하고 있습니다...`,
            timestamp: new Date(),
            data: {
              actionType: 'chain_switch',
              chainName: targetChain,
              status: 'pending'
            }
          }

        case 'transaction_history':
          if (!walletState.isConnected) {
            return {
              id: messageId,
              type: 'assistant',
              content: '지갑을 먼저 연결해주세요.',
              timestamp: new Date(),
              data: {
                actionType: 'wallet_required',
                status: 'failed'
              }
            }
          }

          return {
            id: messageId,
            type: 'assistant',
            content: '최근 거래 내역을 가져오고 있습니다...',
            timestamp: new Date(),
            data: {
              actionType: 'transaction_history',
              status: 'pending'
            }
          }

        default:
          return null
      }
    } catch (error) {
      return {
        id: Date.now().toString(),
        type: 'assistant',
        content: `처리 중 오류가 발생했습니다: ${error.message}`,
        timestamp: new Date(),
        data: {
          actionType: 'error',
          error: error.message,
          status: 'failed'
        }
      }
    } finally {
      setIsProcessing(false)
    }
  }, [walletState])

  // 주소 유효성 검증
  const isValidAddress = useCallback((address: string): boolean => {
    return /^0x[a-fA-F0-9]{40}$/.test(address)
  }, [])

  // 금액 추출
  const extractAmount = useCallback((message: string): string | null => {
    const amountMatch = message.match(/(\d+(?:\.\d+)?)/i)
    return amountMatch ? amountMatch[1] : null
  }, [])

  // 주소 추출
  const extractAddress = useCallback((message: string): string | null => {
    const addressMatch = message.match(/(0x[a-fA-F0-9]{40})/i)
    return addressMatch ? addressMatch[1] : null
  }, [])

  return {
    parseCommand,
    processBlockchainCommand,
    isProcessing,
    walletState,
    isValidAddress,
    extractAmount,
    extractAddress
  }
}