import { useState, useCallback, useEffect } from 'react'
import { Message } from './useChat'

export interface Conversation {
  id: string
  title: string
  messages: Message[]
  createdAt: Date
  updatedAt: Date
}

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null)

  // Load conversations from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('ara-conversations')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setConversations(parsed.map((conv: { id: string; title: string; messages: Message[]; createdAt: string; updatedAt: string }) => ({
          ...conv,
          createdAt: new Date(conv.createdAt),
          updatedAt: new Date(conv.updatedAt),
          messages: conv.messages.map((msg: { id: string; type: string; content: string; timestamp: string | Date }) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }))
        })))
      } catch (error) {
        console.error('Failed to load conversations:', error)
      }
    }
  }, [])

  // Save conversations to localStorage
  const saveConversations = useCallback((convs: Conversation[]) => {
    localStorage.setItem('ara-conversations', JSON.stringify(convs))
  }, [])

  const createConversation = useCallback((messages: Message[]) => {
    const newConversation: Conversation = {
      id: Date.now().toString(),
      title: generateConversationTitle(messages),
      messages,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    setConversations(prev => {
      const updated = [newConversation, ...prev]
      saveConversations(updated)
      return updated
    })

    setCurrentConversationId(newConversation.id)
    return newConversation.id
  }, [saveConversations])

  const updateConversation = useCallback((id: string, messages: Message[]) => {
    setConversations(prev => {
      const updated = prev.map(conv =>
        conv.id === id
          ? {
              ...conv,
              messages,
              title: generateConversationTitle(messages),
              updatedAt: new Date()
            }
          : conv
      )
      saveConversations(updated)
      return updated
    })
  }, [saveConversations])

  const deleteConversation = useCallback((id: string) => {
    setConversations(prev => {
      const updated = prev.filter(conv => conv.id !== id)
      saveConversations(updated)
      return updated
    })

    if (currentConversationId === id) {
      setCurrentConversationId(null)
    }
  }, [currentConversationId, saveConversations])

  const loadConversation = useCallback((id: string) => {
    setCurrentConversationId(id)
  }, [])

  const getCurrentConversation = useCallback(() => {
    return conversations.find(conv => conv.id === currentConversationId) || null
  }, [conversations, currentConversationId])

  return {
    conversations,
    currentConversationId,
    createConversation,
    updateConversation,
    deleteConversation,
    loadConversation,
    getCurrentConversation
  }
}

function generateConversationTitle(messages: Message[]): string {
  const userMessage = messages.find(msg => msg.type === 'user')
  if (userMessage) {
    const content = userMessage.content.trim()
    if (content.length > 50) {
      return content.substring(0, 47) + '...'
    }
    return content
  }
  return 'New Conversation'
}