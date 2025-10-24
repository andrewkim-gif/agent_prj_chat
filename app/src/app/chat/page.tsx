"use client"

import { ChatInterface } from "@/components/chat/ChatInterface"
import { ChatHeader } from "@/components/chat/ChatHeader"
import { ChatSidebar } from "@/components/chat/ChatSidebar"
import { useChat } from "@/components/chat/hooks/useChat"
import { useRouter } from 'next/navigation'
import { useEffect } from "react"

export default function ChatPage() {
  const router = useRouter()
  const { messages, isLoading, sendMessage, stopGeneration, clearMessages, isTyping } = useChat()

  // Reset chat on page load/refresh
  useEffect(() => {
    clearMessages()
  }, [clearMessages])

  const handleExit = () => {
    router.push('/')
  }

  return (
    <div className="h-screen bg-background flex flex-col">
      {/* Only Chat Header in chat mode */}
      <ChatHeader
        isOnline={true}
        isTyping={isTyping}
        onRefresh={() => {
          clearMessages()
        }}
        onExit={handleExit}
      />

      {/* Chat Content Area - Full Screen */}
      <div className="flex-1 flex overflow-hidden">
        <div className="flex w-full h-full">
          <div className="hidden lg:block flex-shrink-0">
            <ChatSidebar onSendMessage={sendMessage} />
          </div>
          <div className="flex-1 h-full overflow-hidden">
            <ChatInterface
              messages={messages}
              isLoading={isLoading}
              isTyping={isTyping}
              sendMessage={sendMessage}
              stopGeneration={stopGeneration}
            />
          </div>
        </div>
      </div>
    </div>
  )
}