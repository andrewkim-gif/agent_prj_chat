"use client"

import { useState, useEffect } from "react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"
import { Icon } from "@/components/ui/icon"

const TYPING_MESSAGES = [
  "ARA is searching through data to find the perfect answer for you...",
  "Analyzing your question with care and attention...",
  "Gathering insights to provide you with helpful information...",
  "Working hard to give you the best response possible...",
  "ARA is browsing the web for the latest information...",
  "Carefully reviewing multiple sources to ensure accuracy...",
  "Processing your request with thoughtful consideration...",
  "Exploring various angles to give you comprehensive insights...",
  "ARA is connecting the dots to create meaningful answers...",
  "Diving deep into research to bring you valuable content..."
]

export function TypingIndicator() {
  const [currentMessage, setCurrentMessage] = useState("")
  const [messageIndex, setMessageIndex] = useState(0)
  const [charIndex, setCharIndex] = useState(0)
  const [isTyping, setIsTyping] = useState(true)

  useEffect(() => {
    const message = TYPING_MESSAGES[messageIndex]

    if (isTyping && charIndex < message.length) {
      const timeout = setTimeout(() => {
        setCurrentMessage(message.slice(0, charIndex + 1))
        setCharIndex(prev => prev + 1)
      }, 50 + Math.random() * 100) // Variable typing speed for natural feel

      return () => clearTimeout(timeout)
    } else if (charIndex >= message.length) {
      // Message complete, pause before next message
      const timeout = setTimeout(() => {
        setIsTyping(false)
        setCurrentMessage("")
        setCharIndex(0)
        setMessageIndex(prev => (prev + 1) % TYPING_MESSAGES.length)

        // Short pause before starting next message
        setTimeout(() => setIsTyping(true), 300)
      }, 2000) // Show complete message for 2 seconds

      return () => clearTimeout(timeout)
    }
  }, [charIndex, messageIndex, isTyping])

  return (
    <div className="flex gap-4">
      <Avatar className="w-8 h-8">
        <AvatarImage src="/ara.png" alt="ARA" />
        <AvatarFallback>
          <Icon name="robot" size={16} />
        </AvatarFallback>
      </Avatar>
      <Card className="p-4 bg-muted max-w-md">
        <div className="flex items-center gap-3">


          {/* Typing message */}
          <div className="text-sm text-muted-foreground">
            {currentMessage}
            
          </div>
        </div>
      </Card>
    </div>
  )
}