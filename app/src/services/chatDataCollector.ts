import {
  storeChatMessage,
  storeDailySummary,
  updateChatSatisfaction,
  detectLanguage,
  categorizeQuestion,
  extractMetadata,
  ChatDocument
} from '@/lib/mongodb-chat'

export interface ChatInteraction {
  userId: string
  sessionId: string
  question: string
  response: string
  platform?: 'web' | 'mobile' | 'api'
  responseTime?: number
  satisfaction?: number
  walletConnected?: boolean
  walletAddress?: string
  request?: any // For extracting metadata
}

export interface DailySummaryData {
  date: string
  totalChats: number
  uniqueUsers: number
  avgResponseTime: number
  avgSatisfaction: number
  topQuestions: Array<{
    question: string
    count: number
    category: string
  }>
  platformBreakdown: {
    web: number
    mobile: number
    api: number
  }
  languageBreakdown: {
    korean: number
    english: number
  }
}

class ChatDataCollector {
  private isEnabled: boolean = true
  private batchQueue: ChatDocument[] = []
  private batchSize: number = 10
  private flushInterval: number = 5000 // 5 seconds

  constructor() {
    // Set up periodic batch flush
    if (typeof window === 'undefined') { // Server-side only
      setInterval(() => {
        this.flushBatch()
      }, this.flushInterval)
    }
  }

  // Enable or disable data collection
  setEnabled(enabled: boolean) {
    this.isEnabled = enabled
    console.log(`Chat data collection ${enabled ? 'enabled' : 'disabled'}`)
  }

  // Collect a single chat interaction
  async collectChatInteraction(interaction: ChatInteraction): Promise<string | null> {
    if (!this.isEnabled) {
      return null
    }

    try {
      const language = detectLanguage(interaction.question)
      const category = categorizeQuestion(interaction.question)
      const metadata = interaction.request ? extractMetadata(interaction.request) : {}

      // Add wallet information to metadata
      if (interaction.walletConnected !== undefined) {
        metadata.walletConnected = interaction.walletConnected
      }
      if (interaction.walletAddress) {
        metadata.walletAddress = interaction.walletAddress
      }

      const chatData: Omit<ChatDocument, '_id' | 'timestamp'> = {
        type: 'history',
        userId: interaction.userId,
        sessionId: interaction.sessionId,
        question: interaction.question,
        response: interaction.response,
        platform: interaction.platform || 'web',
        language,
        category,
        responseTime: interaction.responseTime,
        satisfaction: interaction.satisfaction,
        metadata
      }

      // Store immediately for real-time data or add to batch
      if (interaction.satisfaction !== undefined || this.batchQueue.length >= this.batchSize) {
        const chatId = await storeChatMessage(chatData)
        console.log('Chat interaction stored immediately:', chatId)
        return chatId
      } else {
        // Add to batch for later processing
        this.batchQueue.push(chatData as ChatDocument)
        console.log('Chat interaction added to batch queue')
        return null
      }
    } catch (error) {
      console.error('Error collecting chat interaction:', error)
      // Don't throw error to avoid disrupting chat functionality
      return null
    }
  }

  // Collect user satisfaction rating
  async collectSatisfactionRating(chatId: string, satisfaction: number): Promise<boolean> {
    if (!this.isEnabled) {
      return false
    }

    try {
      // Validate satisfaction rating (1-5 scale)
      if (satisfaction < 1 || satisfaction > 5) {
        console.warn('Invalid satisfaction rating:', satisfaction)
        return false
      }

      const success = await updateChatSatisfaction(chatId, satisfaction)
      console.log('Satisfaction rating updated:', { chatId, satisfaction, success })
      return success
    } catch (error) {
      console.error('Error collecting satisfaction rating:', error)
      return false
    }
  }

  // Flush batched chat data to database
  private async flushBatch(): Promise<void> {
    if (this.batchQueue.length === 0) {
      return
    }

    try {
      const batchToFlush = [...this.batchQueue]
      this.batchQueue = [] // Clear queue immediately

      // Store batch (the mongodb-chat function handles the conversion)
      const chatData = batchToFlush.map(chat => ({
        type: chat.type,
        userId: chat.userId,
        sessionId: chat.sessionId,
        question: chat.question,
        response: chat.response,
        platform: chat.platform,
        language: chat.language,
        category: chat.category,
        responseTime: chat.responseTime,
        satisfaction: chat.satisfaction,
        metadata: chat.metadata
      }))

      // Import the batch function dynamically to avoid circular imports
      const { storeChatBatch } = await import('@/lib/mongodb-chat')
      const chatIds = await storeChatBatch(chatData)
      console.log(`Flushed ${chatIds.length} chat interactions to database`)
    } catch (error) {
      console.error('Error flushing chat batch:', error)
      // Re-add failed items back to queue for retry
      // this.batchQueue.unshift(...batchToFlush)
    }
  }

  // Generate and store daily summary
  async generateDailySummary(date: string, summaryData: DailySummaryData): Promise<string | null> {
    if (!this.isEnabled) {
      return null
    }

    try {
      // Create a summary document in chat format
      const summaryDoc: Omit<ChatDocument, '_id' | 'timestamp'> = {
        type: 'daily',
        userId: 'system',
        sessionId: `daily-summary-${date}`,
        question: `Daily Summary for ${date}`,
        response: JSON.stringify(summaryData),
        platform: 'api',
        language: 'en',
        category: 'summary',
        metadata: {
          summaryType: 'daily',
          date,
          totalChats: summaryData.totalChats,
          uniqueUsers: summaryData.uniqueUsers
        }
      }

      const summaryId = await storeDailySummary(summaryDoc)
      console.log('Daily summary stored:', summaryId)
      return summaryId
    } catch (error) {
      console.error('Error generating daily summary:', error)
      return null
    }
  }

  // Get collection statistics
  getCollectionStats() {
    return {
      isEnabled: this.isEnabled,
      batchQueueSize: this.batchQueue.length,
      batchSize: this.batchSize,
      flushInterval: this.flushInterval
    }
  }

  // Force flush batch immediately
  async forceBatchFlush(): Promise<void> {
    await this.flushBatch()
  }

  // Create chat interaction from chat API request/response
  static createInteractionFromChat(
    userId: string,
    sessionId: string,
    userMessage: string,
    botResponse: string,
    options: {
      platform?: 'web' | 'mobile' | 'api'
      responseTime?: number
      walletConnected?: boolean
      walletAddress?: string
      request?: any
    } = {}
  ): ChatInteraction {
    return {
      userId,
      sessionId,
      question: userMessage,
      response: botResponse,
      platform: options.platform || 'web',
      responseTime: options.responseTime,
      walletConnected: options.walletConnected,
      walletAddress: options.walletAddress,
      request: options.request
    }
  }

  // Create daily summary from analytics data
  static createDailySummary(
    date: string,
    analytics: {
      totalChats: number
      uniqueUsers: number
      avgResponseTime: number
      avgSatisfaction: number
      questions: Array<{ question: string; count: number; category: string }>
      platforms: { web: number; mobile: number; api: number }
      languages: { korean: number; english: number }
    }
  ): DailySummaryData {
    return {
      date,
      totalChats: analytics.totalChats,
      uniqueUsers: analytics.uniqueUsers,
      avgResponseTime: analytics.avgResponseTime,
      avgSatisfaction: analytics.avgSatisfaction,
      topQuestions: analytics.questions.slice(0, 10), // Top 10 questions
      platformBreakdown: analytics.platforms,
      languageBreakdown: analytics.languages
    }
  }
}

// Singleton instance
export const chatDataCollector = new ChatDataCollector()

// Helper function for easy integration with existing chat APIs
export async function collectChatData(
  userId: string,
  sessionId: string,
  userMessage: string,
  botResponse: string,
  options: {
    platform?: 'web' | 'mobile' | 'api'
    responseTime?: number
    walletConnected?: boolean
    walletAddress?: string
    request?: any
  } = {}
): Promise<string | null> {
  const interaction = ChatDataCollector.createInteractionFromChat(
    userId,
    sessionId,
    userMessage,
    botResponse,
    options
  )

  return await chatDataCollector.collectChatInteraction(interaction)
}

// Helper function for collecting satisfaction
export async function collectSatisfaction(chatId: string, rating: number): Promise<boolean> {
  return await chatDataCollector.collectSatisfactionRating(chatId, rating)
}

export default ChatDataCollector