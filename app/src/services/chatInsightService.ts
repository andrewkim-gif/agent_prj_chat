import {
  ChatMetrics,
  ChatActivity,
  TopicAnalysis,
  QuestionAnalysis,
  ChatConversation
} from '@/types/chat-insight'

export interface ChatInsightResponse<T> {
  success: boolean
  data: T
  error?: string
  message?: string
}

export interface ChatInsightOverview {
  metrics: ChatMetrics
  activity: ChatActivity
  topics: TopicAnalysis
  questions: QuestionAnalysis
  conversations: ChatConversation[]
  totalRecords: number
  dateRange: string
  lastUpdated: string
}

class ChatInsightService {
  private baseUrl = '/api/chat-insights'

  async fetchOverview(startDate?: string, endDate?: string): Promise<ChatInsightOverview> {
    try {
      let url = `${this.baseUrl}?type=overview`
      if (startDate && endDate) {
        url += `&startDate=${startDate}&endDate=${endDate}`
      }

      const response = await fetch(url)
      const result: ChatInsightResponse<ChatInsightOverview> = await response.json()

      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch overview data')
      }

      return result.data
    } catch (error) {
      console.error('Error fetching chat insight overview:', error)
      throw error
    }
  }

  async fetchMetrics(dateRange: string = '7d'): Promise<ChatMetrics> {
    try {
      const response = await fetch(`${this.baseUrl}?type=metrics&range=${dateRange}`)
      const result: ChatInsightResponse<ChatMetrics> = await response.json()

      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch metrics')
      }

      return result.data
    } catch (error) {
      console.error('Error fetching chat metrics:', error)
      throw error
    }
  }

  async fetchActivity(dateRange: string = '7d'): Promise<ChatActivity> {
    try {
      const response = await fetch(`${this.baseUrl}?type=activity&range=${dateRange}`)
      const result: ChatInsightResponse<ChatActivity> = await response.json()

      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch activity data')
      }

      return result.data
    } catch (error) {
      console.error('Error fetching chat activity:', error)
      throw error
    }
  }

  async fetchTopics(dateRange: string = '7d'): Promise<TopicAnalysis> {
    try {
      const response = await fetch(`${this.baseUrl}?type=topics&range=${dateRange}`)
      const result: ChatInsightResponse<TopicAnalysis> = await response.json()

      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch topic analysis')
      }

      return result.data
    } catch (error) {
      console.error('Error fetching topic analysis:', error)
      throw error
    }
  }


  async fetchQuestions(dateRange: string = '7d'): Promise<QuestionAnalysis> {
    try {
      const response = await fetch(`${this.baseUrl}?type=questions&range=${dateRange}`)
      const result: ChatInsightResponse<QuestionAnalysis> = await response.json()

      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch question analysis')
      }

      return result.data
    } catch (error) {
      console.error('Error fetching question analysis:', error)
      throw error
    }
  }

  async fetchConversations(dateRange: string = '7d'): Promise<ChatConversation[]> {
    try {
      const response = await fetch(`${this.baseUrl}?type=conversations&range=${dateRange}`)
      const result: ChatInsightResponse<ChatConversation[]> = await response.json()

      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch conversations')
      }

      return result.data
    } catch (error) {
      console.error('Error fetching conversations:', error)
      throw error
    }
  }

  // Helper method to get available date ranges
  getAvailableDateRanges() {
    return [
      { value: '1d', label: 'Last 24 Hours' },
      { value: '7d', label: 'Last 7 Days' },
      { value: '30d', label: 'Last 30 Days' }
    ]
  }
}

export const chatInsightService = new ChatInsightService()
export default chatInsightService