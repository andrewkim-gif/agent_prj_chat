// Client-side chat analytics service for automatic data collection

export interface ChatAnalyticsConfig {
  enabled: boolean
  autoCollect: boolean
  batchSize: number
  flushInterval: number
}

export interface ChatInteractionData {
  userId: string
  sessionId: string
  userMessage: string
  botResponse: string
  platform?: 'web' | 'mobile' | 'api'
  responseTime?: number
  walletConnected?: boolean
  walletAddress?: string
}

export interface SatisfactionData {
  chatId: string
  rating: number
}

class ChatAnalyticsService {
  private config: ChatAnalyticsConfig = {
    enabled: true,
    autoCollect: true,
    batchSize: 5,
    flushInterval: 10000 // 10 seconds
  }

  private pendingInteractions: ChatInteractionData[] = []
  private flushTimer: NodeJS.Timeout | null = null

  constructor(config?: Partial<ChatAnalyticsConfig>) {
    if (config) {
      this.config = { ...this.config, ...config }
    }

    // Start flush timer if auto-collect is enabled
    if (this.config.autoCollect) {
      this.startFlushTimer()
    }
  }

  // Initialize the service
  init(config?: Partial<ChatAnalyticsConfig>) {
    if (config) {
      this.config = { ...this.config, ...config }
    }

    console.log('Chat Analytics Service initialized:', this.config)
  }

  // Track a chat interaction
  async trackChatInteraction(data: ChatInteractionData): Promise<string | null> {
    if (!this.config.enabled) {
      return null
    }

    try {
      // Auto-detect platform if not provided
      if (!data.platform) {
        data.platform = this.detectPlatform()
      }

      // Auto-generate session ID if not provided
      if (!data.sessionId) {
        data.sessionId = this.getOrCreateSessionId()
      }

      if (this.config.autoCollect) {
        // Add to batch queue
        this.pendingInteractions.push(data)

        // Flush immediately if batch is full
        if (this.pendingInteractions.length >= this.config.batchSize) {
          return await this.flushPendingInteractions()
        }

        return null
      } else {
        // Send immediately
        return await this.sendChatInteraction(data)
      }
    } catch (error) {
      console.error('Error tracking chat interaction:', error)
      return null
    }
  }

  // Track satisfaction rating
  async trackSatisfaction(data: SatisfactionData): Promise<boolean> {
    if (!this.config.enabled) {
      return false
    }

    try {
      const response = await fetch('/api/chat/collect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'satisfaction',
          data
        })
      })

      const result = await response.json()
      return result.success
    } catch (error) {
      console.error('Error tracking satisfaction:', error)
      return false
    }
  }

  // Send a single chat interaction
  private async sendChatInteraction(data: ChatInteractionData): Promise<string | null> {
    try {
      const response = await fetch('/api/chat/collect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'interaction',
          data
        })
      })

      const result = await response.json()
      return result.success ? result.chatId : null
    } catch (error) {
      console.error('Error sending chat interaction:', error)
      return null
    }
  }

  // Flush pending interactions
  private async flushPendingInteractions(): Promise<string | null> {
    if (this.pendingInteractions.length === 0) {
      return null
    }

    try {
      // Send all pending interactions
      const promises = this.pendingInteractions.map(data => this.sendChatInteraction(data))
      const results = await Promise.allSettled(promises)

      const successCount = results.filter(
        result => result.status === 'fulfilled' && result.value !== null
      ).length

      console.log(`Flushed ${successCount}/${this.pendingInteractions.length} chat interactions`)

      // Clear pending interactions
      this.pendingInteractions = []

      return successCount > 0 ? 'batch_success' : null
    } catch (error) {
      console.error('Error flushing pending interactions:', error)
      return null
    }
  }

  // Start the flush timer
  private startFlushTimer() {
    if (this.flushTimer) {
      clearInterval(this.flushTimer)
    }

    this.flushTimer = setInterval(() => {
      this.flushPendingInteractions()
    }, this.config.flushInterval)
  }

  // Stop the flush timer
  private stopFlushTimer() {
    if (this.flushTimer) {
      clearInterval(this.flushTimer)
      this.flushTimer = null
    }
  }

  // Detect platform from user agent
  private detectPlatform(): 'web' | 'mobile' | 'api' {
    if (typeof window === 'undefined') {
      return 'api'
    }

    const userAgent = navigator.userAgent.toLowerCase()
    if (userAgent.includes('mobile') || userAgent.includes('android') || userAgent.includes('iphone')) {
      return 'mobile'
    }

    return 'web'
  }

  // Get or create session ID
  private getOrCreateSessionId(): string {
    if (typeof window === 'undefined') {
      return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }

    let sessionId = sessionStorage.getItem('ara_chat_session_id')
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      sessionStorage.setItem('ara_chat_session_id', sessionId)
    }

    return sessionId
  }

  // Get user ID from localStorage or generate a temporary one
  getUserId(): string {
    if (typeof window === 'undefined') {
      return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }

    let userId = localStorage.getItem('ara_user_id')
    if (!userId) {
      userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      localStorage.setItem('ara_user_id', userId)
    }

    return userId
  }

  // Get current session ID
  getSessionId(): string {
    return this.getOrCreateSessionId()
  }

  // Update configuration
  updateConfig(newConfig: Partial<ChatAnalyticsConfig>) {
    const oldAutoCollect = this.config.autoCollect
    this.config = { ...this.config, ...newConfig }

    // Restart timer if auto-collect setting changed
    if (oldAutoCollect !== this.config.autoCollect) {
      if (this.config.autoCollect) {
        this.startFlushTimer()
      } else {
        this.stopFlushTimer()
        // Flush any pending interactions
        this.flushPendingInteractions()
      }
    } else if (this.config.autoCollect && this.flushTimer) {
      // Restart timer with new interval
      this.startFlushTimer()
    }

    console.log('Chat analytics config updated:', this.config)
  }

  // Force flush pending data
  async forceFlush(): Promise<void> {
    await this.flushPendingInteractions()
  }

  // Get current stats
  getStats() {
    return {
      config: this.config,
      pendingInteractions: this.pendingInteractions.length,
      isTimerActive: this.flushTimer !== null
    }
  }

  // Destroy the service
  destroy() {
    this.stopFlushTimer()
    this.flushPendingInteractions() // Final flush
    this.pendingInteractions = []
  }
}

// Create singleton instance
export const chatAnalytics = new ChatAnalyticsService()

// Helper functions for easy integration
export async function trackChat(
  userMessage: string,
  botResponse: string,
  options: {
    userId?: string
    sessionId?: string
    responseTime?: number
    walletConnected?: boolean
    walletAddress?: string
  } = {}
): Promise<string | null> {
  const userId = options.userId || chatAnalytics.getUserId()
  const sessionId = options.sessionId || chatAnalytics.getSessionId()

  return await chatAnalytics.trackChatInteraction({
    userId,
    sessionId,
    userMessage,
    botResponse,
    responseTime: options.responseTime,
    walletConnected: options.walletConnected,
    walletAddress: options.walletAddress
  })
}

export async function trackSatisfaction(chatId: string, rating: number): Promise<boolean> {
  return await chatAnalytics.trackSatisfaction({ chatId, rating })
}

// Hook for React components
export function useChatAnalytics() {
  return {
    trackChat,
    trackSatisfaction,
    getUserId: () => chatAnalytics.getUserId(),
    getSessionId: () => chatAnalytics.getSessionId(),
    getStats: () => chatAnalytics.getStats(),
    updateConfig: (config: Partial<ChatAnalyticsConfig>) => chatAnalytics.updateConfig(config),
    forceFlush: () => chatAnalytics.forceFlush()
  }
}

export default ChatAnalyticsService