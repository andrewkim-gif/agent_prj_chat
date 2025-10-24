"use client"

import { useState } from "react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"
import { Icon } from "@/components/ui/icon"
import { MessageContent } from "./MessageContent"
import { ScrollAnimated } from "@/components/ui/ScrollAnimated"
import { BlockchainMessageItem } from "../blockchain/BlockchainMessageItem"

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

interface MessageItemProps {
  message: Message
  onActionClick?: (action: string, data?: unknown) => void
}

export function MessageItem({ message, onActionClick }: MessageItemProps) {
  // Generate random emoji for assistant messages (only once per message)
  const [emojiSrc] = useState(() => {
    if (message.type === 'assistant') {
      const emojiNumber = Math.floor(Math.random() * 10) + 1
      const paddedNumber = emojiNumber.toString().padStart(2, '0')
      return `/assets/imgs/ara_emoji_${paddedNumber}.svg`
    }
    return null
  })

  // Don't render anything for empty streaming messages
  if (message.isStreaming && message.content.trim().length === 0) {
    return null
  }

  return (
    <ScrollAnimated
      animation={message.type === 'user' ? 'fade-left' : 'fade-right'}
      threshold={0.2}
      rootMargin="0px 0px -20px 0px"
    >
      <div
        className={`flex gap-4 w-full overflow-hidden ${
          message.type === 'user' ? 'flex-row-reverse' : 'flex-row'
        }`}
      >
      <Avatar className="w-8 h-8 flex-shrink-0">
        {message.type === 'user' ? (
          <>
            <AvatarImage src="/ara2.png" alt="User" />
            <AvatarFallback>
              <Icon name="user" size={12} />
            </AvatarFallback>
          </>
        ) : (
          <>
            <AvatarImage src={emojiSrc || '/ara.png'} alt="ARA" style={{width: '25px', height: '25px'}}/>
            <AvatarFallback>
              <Icon name="robot" size={12} />
            </AvatarFallback>
          </>
        )}
      </Avatar>

      <Card
        className={`max-w-[85%] p-4 overflow-hidden ${
          message.type === 'user'
            ? 'bg-primary text-primary-foreground'
            : 'bg-white text-foreground border border-border'
        }`}
      >
        <MessageContent content={message.content} type={message.type} isStreaming={message.isStreaming} />

        {/* Blockchain Message Integration */}
        {message.type === 'assistant' && message.data?.actionType && (
          <BlockchainMessageItem message={message} onActionClick={onActionClick} />
        )}

        <span className="text-xs opacity-70 mt-2 block">
          {message.timestamp.toLocaleTimeString()}
        </span>
      </Card>
      </div>
    </ScrollAnimated>
  )
}