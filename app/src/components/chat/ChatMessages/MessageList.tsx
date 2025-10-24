"use client"

import { useRef, useEffect, useState } from "react"
import { MessageItem } from "./MessageItem"
import { TypingIndicator } from "./TypingIndicator"
import { useAutoScroll } from "@/hooks/useAutoScroll"

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

interface MessageListProps {
  messages: Message[]
  isLoading?: boolean
  isTyping?: boolean
  onActionClick?: (action: string, data?: unknown) => void
}

export function MessageList({ messages, isLoading = false, isTyping = false, onActionClick }: MessageListProps) {
  // Initialize the intelligent auto-scroll hook
  const {
    scrollContainerRef,
    isAutoScrollEnabled,
    isUserScrolling,
    scrollToBottom,
    enableAutoScroll,
    handleContentChange,
    isNearBottom
  } = useAutoScroll({
    threshold: 100,
    enableOnMount: true
  })

  // Check if any message is currently streaming
  const isStreaming = messages.some(message => message.isStreaming)

  // Auto-scroll when new messages arrive
  useEffect(() => {
    const lastMessage = messages[messages.length - 1]

    console.log('📍 New message effect:', {
      lastMessage: lastMessage ? { type: lastMessage.type, content: lastMessage.content.slice(0, 50) } : null,
      messagesLength: messages.length,
      isAutoScrollEnabled,
      isUserScrolling,
      isNearBottom: isNearBottom()
    })

    // 사용자가 메시지를 보낸 경우 - 위치와 상관없이 강제 스크롤 (약간의 지연 추가)
    if (lastMessage && lastMessage.type === 'user') {
      console.log('🚀 User message detected - enabling auto scroll')
      // DOM 업데이트 완료 후 스크롤하도록 지연
      setTimeout(() => {
        enableAutoScroll()
      }, 50)
    }
    // 어시스턴트 메시지나 기타 경우 - 하단 근처에 있을 때만 스크롤
    else if (isAutoScrollEnabled && !isUserScrolling && isNearBottom()) {
      console.log('🤖 Assistant message - auto scroll if near bottom')
      handleContentChange()
    }
  }, [messages.length, isAutoScrollEnabled, isUserScrolling, isNearBottom, handleContentChange, enableAutoScroll])

  // 콘텐츠 높이 변화 감지를 위한 추가 useEffect
  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    // ResizeObserver로 콘텐츠 높이 변화 감지
    const resizeObserver = new ResizeObserver(() => {
      const lastMessage = messages[messages.length - 1]
      // 사용자 메시지 직후나 스트리밍 중일 때 높이 변화 시 스크롤
      if (lastMessage && (lastMessage.type === 'user' || lastMessage.isStreaming)) {
        if (isAutoScrollEnabled && !isUserScrolling) {
          console.log('📏 Content height changed - auto scrolling')
          handleContentChange()
        }
      }
    })

    // 메시지 컨테이너의 높이 변화 감지
    const messageContainer = container.querySelector('div')
    if (messageContainer) {
      resizeObserver.observe(messageContainer)
    }

    return () => {
      resizeObserver.disconnect()
    }
  }, [messages.length, isAutoScrollEnabled, isUserScrolling, handleContentChange, scrollContainerRef])

  // Auto-scroll when typing indicator changes (only if near bottom)
  useEffect(() => {
    if (isTyping && isAutoScrollEnabled && !isUserScrolling && isNearBottom()) {
      handleContentChange()
    }
  }, [isTyping, isAutoScrollEnabled, isUserScrolling, isNearBottom, handleContentChange])

  // Auto-scroll during streaming content updates (only if near bottom)
  useEffect(() => {
    if (isStreaming && isAutoScrollEnabled && !isUserScrolling && isNearBottom()) {
      handleContentChange()
    }
  }, [isStreaming, isAutoScrollEnabled, isUserScrolling, isNearBottom, handleContentChange])

  // Auto-scroll when streaming message content changes (only if near bottom)
  useEffect(() => {
    const streamingMessage = messages.find(message => message.isStreaming)
    if (streamingMessage && isAutoScrollEnabled && !isUserScrolling && isNearBottom()) {
      handleContentChange()
    }
  }, [messages.map(m => m.isStreaming ? m.content : '').join(''), isAutoScrollEnabled, isUserScrolling, isNearBottom, handleContentChange])

  // Force enable auto-scroll when new assistant message starts (only if near bottom)
  useEffect(() => {
    const lastMessage = messages[messages.length - 1]
    if (lastMessage && lastMessage.type === 'assistant' && !isUserScrolling && isNearBottom()) {
      enableAutoScroll()
    }
  }, [messages.length, enableAutoScroll, isUserScrolling, isNearBottom])

  return (
    <div
      className="h-full overflow-y-auto overflow-x-hidden p-4 scroll-smooth"
      ref={scrollContainerRef}
      style={{ maxHeight: '100%' }}
    >
      <div className="space-y-6 px-6 py-6 min-h-full max-w-4xl mx-auto" style={{ paddingTop: '80px' }}>
        {messages.map((message) => (
          <MessageItem key={message.id} message={message} onActionClick={onActionClick} />
        ))}

        {isTyping && <TypingIndicator messageCounter={messages.length} />}

      </div>
    </div>
  )
}