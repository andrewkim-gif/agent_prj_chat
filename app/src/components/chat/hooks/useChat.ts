import { useState, useCallback, useRef } from 'react'
import { useBlockchainWallet } from '@/hooks/useBlockchainWallet'

export interface Message {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
  isStreaming?: boolean
  requiresTokenCreation?: boolean
  tokenCreationTrigger?: boolean
}

export interface ChatState {
  messages: Message[]
  isLoading: boolean
  isTyping: boolean
}

const initialMessage: Message = {
  id: '1',
  type: 'assistant',
  content: 'Hello! I\'m ARA, your CrossToken ecosystem assistant.',
  timestamp: new Date()
}

export function useChat() {
  const [chatState, setChatState] = useState<ChatState>({
    messages: [initialMessage],
    isLoading: false,
    isTyping: false
  })

  const abortControllerRef = useRef<AbortController | null>(null)

  const { wallet, crossAccount } = useBlockchainWallet()

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || chatState.isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content,
      timestamp: new Date()
    }

    // Add user message and create streaming assistant message
    const assistantMessageId = (Date.now() + 1).toString()
    const assistantMessage: Message = {
      id: assistantMessageId,
      type: 'assistant',
      content: '',
      timestamp: new Date(),
      isStreaming: true
    }

    setChatState(prev => {
      return {
        ...prev,
        messages: [...prev.messages, userMessage, assistantMessage],
        isLoading: true,
        isTyping: true
      }
    })

    try {
      // Create new AbortController for this request
      const abortController = new AbortController()
      abortControllerRef.current = abortController

      // Ensure typing indicator shows for at least 1 second
      const minTypingTime = new Promise(resolve => setTimeout(resolve, 1000))

      // Start API request
      const apiRequest = fetch('/api/chat/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: content,
          messages: chatState.messages.filter(msg => msg.id !== '1'), // Exclude welcome message
          walletAddress: crossAccount?.address || wallet.address || null // Add wallet address if connected
        }),
        signal: abortController.signal
      })

      // Wait for both minimum typing time and API response
      const [response] = await Promise.all([apiRequest, minTypingTime])

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('No response body reader')
      }

      const decoder = new TextDecoder()
      let accumulatedContent = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))
              if (data.content && !data.done) {
                accumulatedContent += data.content

                // Update the streaming message and stop typing when content starts
                setChatState(prev => {
                  return {
                    ...prev,
                    messages: prev.messages.map(msg =>
                      msg.id === assistantMessageId
                        ? { ...msg, content: accumulatedContent }
                        : msg
                    ),
                    isTyping: false // Stop typing when streaming starts
                  }
                })
              } else if (data.done) {
                // Streaming complete
                setChatState(prev => ({
                  ...prev,
                  messages: prev.messages.map(msg =>
                    msg.id === assistantMessageId
                      ? { ...msg, isStreaming: false }
                      : msg
                  ),
                  isLoading: false,
                  isTyping: false
                }))
              }
            } catch (parseError) {
              // Error parsing streaming data - silently continue
            }
          }
        }
      }
    } catch (error) {
      console.error('Error sending message:', error)

      // Check if the error is due to abort signal
      const isAborted = error instanceof Error && error.name === 'AbortError'
      const errorMessage = isAborted
        ? '응답이 중단되었습니다.'
        : 'I apologize for the temporary error. Please try again with your question about the CrossToken ecosystem! 🤖'

      // Update the existing assistant message with error content instead of creating new one
      setChatState(prev => ({
        ...prev,
        messages: prev.messages.map(msg =>
          msg.id === assistantMessageId
            ? {
                ...msg,
                content: errorMessage,
                isStreaming: false
              }
            : msg
        ),
        isLoading: false,
        isTyping: false
      }))
    }
  }, [chatState.isLoading, chatState.messages, crossAccount?.address, wallet.address])

  const stopGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      try {
        abortControllerRef.current.abort()
      } catch (error) {
        // Ignore abort errors - this is expected when stopping generation
        console.log('Stream aborted successfully')
      }
      abortControllerRef.current = null

      setChatState(prev => ({
        ...prev,
        messages: prev.messages.map(msg =>
          msg.isStreaming
            ? { ...msg, isStreaming: false, content: msg.content || '응답이 중단되었습니다.' }
            : msg
        ),
        isLoading: false,
        isTyping: false
      }))
    }
  }, [])

  const clearMessages = useCallback(() => {
    setChatState({
      messages: [initialMessage],
      isLoading: false,
      isTyping: false
    })
  }, [])

  return {
    messages: chatState.messages,
    isLoading: chatState.isLoading,
    isTyping: chatState.isTyping,
    sendMessage,
    stopGeneration,
    clearMessages
  }
}