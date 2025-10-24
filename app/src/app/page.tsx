"use client"

import { Header } from "@/components/layout/Header"
import { Hero } from "@/components/Hero"
import { Features } from "@/components/Features"
import { Services } from "@/components/Services"
import { About } from "@/components/About"
import { ChatInterface } from "@/components/chat/ChatInterface"
import { ChatHeader } from "@/components/chat/ChatHeader"
import { ChatSidebar } from "@/components/chat/ChatSidebar"
import { AIInsightMain } from "@/components/ai-insight/AIInsightMain"
import { useChat } from "@/components/chat/hooks/useChat"
import { Button } from "@/components/ui/button"
import { Icon } from "@/components/ui/icon"
import { useState, useEffect } from "react"
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()
  const [showChat, setShowChat] = useState(false)
  const [showAIInsight, setShowAIInsight] = useState(false)
  const { messages, isLoading, sendMessage, stopGeneration, clearMessages, isTyping } = useChat()


  // Reset chat on page load/refresh
  useEffect(() => {
    clearMessages()
  }, [clearMessages])


  // Disable page scroll when switching to chat or insight mode
  useEffect(() => {
    if (showChat || showAIInsight) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      // Page scroll disabled in full-screen modes
      document.body.style.overflow = 'hidden'
    } else {
      // Re-enable page scroll
      document.body.style.overflow = 'unset'
    }

    // Restore scroll on component unmount
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [showChat, showAIInsight])

  // ARA Insight Dashboard Mode
  if (showAIInsight) {
    return (
      <AIInsightMain
        onClose={() => setShowAIInsight(false)}
        isModal={true}
      />
    )
  }

  // Chat Mode
  if (showChat) {
    return (
      <div className="h-screen bg-background flex flex-col">
        {/* Only Chat Header in chat mode */}
        <ChatHeader
          isOnline={true}
          isTyping={isTyping}
          onRefresh={() => {
            clearMessages()
          }}
          onExit={() => setShowChat(false)}
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

  return (
    <div className="min-h-screen bg-background">
      {/* Fixed Header */}
      <Header />

      {/* Main content with top padding for fixed header */}
      <main className="pt-16">
        <Hero />
        <Features />
        <Services />
        <About />
      </main>

      {/* Floating Chat Button */}
      <Button
        onClick={() => router.push('/chat')}
        className="fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-lg hover-lift"
        size="icon"
      >
        <Icon name="message" size={24} />
      </Button>
    </div>
  );
}
