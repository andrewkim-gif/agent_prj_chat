"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Icon } from "@/components/ui/icon"

interface MessageInputProps {
  onSend: (message: string) => void
  onStop?: () => void
  isLoading?: boolean
  placeholder?: string
}

export function MessageInput({
  onSend,
  onStop,
  isLoading = false,
  placeholder = "Ask me anything about CrossToken..."
}: MessageInputProps) {
  const [input, setInput] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSend = () => {
    const message = input.trim()
    if (!message || isLoading) return

    onSend(message)
    setInput('')
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="border-border py-8 px-6 bg-background">
      <div className="max-w-4xl mx-auto">
        <div className="flex gap-3">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="flex-1 h-12 text-base"
            disabled={isLoading}
          />
          <Button
            onClick={isLoading ? onStop : handleSend}
            disabled={!isLoading && !input.trim()}
            className="h-12 w-12 hover-lift"
            variant={isLoading ? "destructive" : "default"}
          >
            {isLoading ? (
              <Icon name="x" size={16}  />
            ) : (
              <Icon name="send" size={16} className="brightness-0 invert"/>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}