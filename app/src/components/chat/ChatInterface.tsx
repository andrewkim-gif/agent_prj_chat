"use client"

import { useState, useEffect } from "react"
import { MessageList } from "./ChatMessages/MessageList"
import { MessageInput } from "./ChatInput/MessageInput"
import { SuggestedQuestions } from "./SuggestedQuestions"
import { useChat } from "./hooks/useChat"
import { RiveARAIntro } from "@/components/ui/RiveARAIntro"
import { ScrollAnimated } from "@/components/ui/ScrollAnimated"
import { useBlockchainChatProcessor } from "./blockchain/BlockchainChatProcessor"
import { BlockchainMessageItem } from "./blockchain/BlockchainMessageItem"
import { TokenCreationChat } from "./token/TokenCreationChat"

const GREETING_MESSAGES = [
  "Hi, how can I help you?",
  "Hello! What can I do for you today?",
  "Hey there! Ready to explore crypto?",
  "Welcome! How may I assist you?",
  "Greetings! What would you like to know?",
  "Hello! Let's dive into blockchain together!",
  "Hi! What brings you here today?",
  "Welcome to ARA! How can I help?",
]

function RotatingGreeting() {
  const [currentGreeting, setCurrentGreeting] = useState(0)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false)

      setTimeout(() => {
        setCurrentGreeting(prev => (prev + 1) % GREETING_MESSAGES.length)
        setIsVisible(true)
      }, 300) // Fade out duration

    }, 10000) // Change every 3 seconds

    return () => clearInterval(interval)
  }, [])

  return (
    <h1
      className={`text-3xl font-semibold text-foreground text-center mt-32 text-shimmer transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-y-10' : 'opacity-0 translate-y-15'
      }`}
      style={{
        fontFamily: 'Bobaesomjindo, -apple-system, BlinkMacSystemFont, sans-serif',
        animation: 'gentle-float 3s ease-in-out infinite'
      }}
    >
      {GREETING_MESSAGES[currentGreeting]}
    </h1>
  )
}

interface Message {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
  isStreaming?: boolean
  data?: {
    actionType?: string
    status?: 'pending' | 'success' | 'failed'
    [key: string]: unknown
  }
}

interface ChatInterfaceProps {
  messages?: Message[]
  isLoading?: boolean
  isTyping?: boolean
  sendMessage?: (message: string) => void
  stopGeneration?: () => void
}

export function ChatInterface({ messages, isLoading, isTyping, sendMessage, stopGeneration }: ChatInterfaceProps = {}) {
  const hookData = useChat()
  const blockchainProcessor = useBlockchainChatProcessor()
  const [showTokenCreation, setShowTokenCreation] = useState(false)

  // Use props if provided, otherwise use hook data
  const finalMessages = messages ?? hookData.messages
  const finalIsLoading = isLoading ?? hookData.isLoading
  const finalIsTyping = isTyping ?? hookData.isTyping
  const finalStopGeneration = stopGeneration ?? (() => {})

  // Enhanced send message with blockchain processing
  const handleSendMessage = async (message: string) => {
    // Check for token creation intent
    const tokenKeywords = ['토큰을 발행하고 싶어', '토큰 만들어줘', '새로운 토큰 생성', '코인 만들고 싶어', '토큰 배포']
    const isTokenCreationRequest = tokenKeywords.some(keyword =>
      message.toLowerCase().includes(keyword.toLowerCase())
    )

    if (isTokenCreationRequest) {
      setShowTokenCreation(true)
      return
    }

    // 1. 기본 사용자 메시지 추가
    const originalSendMessage = sendMessage ?? hookData.sendMessage
    originalSendMessage(message)

    // 2. 블록체인 명령어 확인
    const blockchainCommand = blockchainProcessor.parseCommand(message)

    if (blockchainCommand && blockchainCommand.confidence > 0.7) {
      // 블록체인 명령어 처리
      const response = await blockchainProcessor.processBlockchainCommand(blockchainCommand)
      if (response) {
        // 블록체인 응답을 메시지 목록에 추가
        if (hookData.addMessage) {
          hookData.addMessage(response)
        } else {
          console.log('Blockchain response:', response)
        }
      }
    }
  }

  const finalSendMessage = sendMessage ? handleSendMessage : hookData.sendMessage

  // 블록체인 액션 핸들러
  const handleBlockchainAction = (action: string, data?: unknown) => {
    switch (action) {
      case 'connect_wallet':
        finalSendMessage('지갑 연결해줘')
        break
      case 'send_tokens':
        finalSendMessage('Cross 보내줘')
        break
      case 'transaction_history':
        finalSendMessage('거래 내역 보여줘')
        break
      default:
        console.log('Unknown blockchain action:', action)
    }
  }


  // Check if this is the initial state (only the welcome message)
  const isInitialState = finalMessages.length === 1
  const hasUserMessages = finalMessages.some(msg => msg.type === 'user')

  // Show token creation modal
  if (showTokenCreation) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex-1 flex items-center justify-center p-4">
          <TokenCreationChat
            onClose={() => setShowTokenCreation(false)}
            onTokenCreated={(tokenAddress) => {
              setShowTokenCreation(false)
              finalSendMessage(`✅ 토큰이 성공적으로 생성되었습니다! 토큰 주소: ${tokenAddress}`)
            }}
          />
        </div>
      </div>
    )
  }

  if (isInitialState && !hasUserMessages) {
    // Initial floating input layout
    return (
      <div className="flex-1 flex flex-col h-full">
        {/* Main content area with centered input */}
        <div className="flex-1 flex flex-col items-center p-2">
          {/* ARA Intro Animation with overlay text */}
          <ScrollAnimated className="mb-6 relative">
            <RiveARAIntro width={400} height={400} className="mx-auto" />
            {/* Greeting Text overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <RotatingGreeting />
              </div>
          </ScrollAnimated>

          {/* Floating input */}
          <div className="w-full max-w-3xl space-y-6">
            <ScrollAnimated animation="fade-up" delay={200}>
              <MessageInput
                onSend={finalSendMessage}
                onStop={finalStopGeneration}
                isLoading={finalIsLoading}
                placeholder="Ask me anything about CrossToken..."
              />
            </ScrollAnimated>

            {/* Suggested Questions */}
            <ScrollAnimated animation="fade-up" delay={300}>
              <SuggestedQuestions
                onQuestionClick={finalSendMessage}
                className="mb-4"
              />
            </ScrollAnimated>
          </div>
        </div>
      </div>
    )
  }

  // Normal chat layout with messages
  return (
    <div className="h-full flex flex-col">
      {/* Messages area - takes remaining space */}
      <div className="flex-1 overflow-hidden">
        <MessageList
          messages={finalMessages}
          isLoading={finalIsLoading}
          isTyping={finalIsTyping}
          onActionClick={handleBlockchainAction}
        />
      </div>

      {/* Fixed bottom input */}
      <div className="h-[100px] flex-shrink-0 bg-background border-t border-border/20 p-4 flex items-center justify-center">
        <div className="w-full max-w-4xl">
          <MessageInput
            onSend={finalSendMessage}
            onStop={finalStopGeneration}
            isLoading={finalIsLoading}
            placeholder="Ask me anything about CrossToken..."
          />
        </div>
      </div>
    </div>
  )
}