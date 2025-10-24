"use client"

import { useState, useEffect } from 'react'
import { Icon } from '@/components/ui/icon'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { ChatMetricsGrid } from './ChatMetricsGrid'
import { ChatActivityChart } from './ChatActivityChart'
import { TopicAnalysisChart } from './TopicAnalysisChart'
import { QuestionAnalysisPanel } from './QuestionAnalysisPanel'
import { RecentConversationsFeed } from './RecentConversationsFeed'
import chatInsightService from '@/services/chatInsightService'
import {
  ChatMetrics,
  ChatActivity,
  TopicAnalysis,
  QuestionAnalysis,
  ChatConversation
} from '@/types/chat-insight'

interface ChatInsightsDashboardProps {
  onClose?: () => void;
  isModal?: boolean;
}

export function ChatInsightsDashboard({ onClose, isModal = false }: ChatInsightsDashboardProps) {
  const [loading, setLoading] = useState(true)
  const [startDate, setStartDate] = useState(() => {
    const date = new Date()
    date.setDate(date.getDate() - 7)
    return date.toISOString().split('T')[0]
  })
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0]
  })
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<string>('')

  // Real data state
  const [metrics, setMetrics] = useState<ChatMetrics | null>(null)
  const [activity, setActivity] = useState<ChatActivity | null>(null)
  const [topics, setTopics] = useState<TopicAnalysis | null>(null)
  const [questions, setQuestions] = useState<QuestionAnalysis | null>(null)
  const [conversations, setConversations] = useState<ChatConversation[]>([])

  // Fetch data from API
  const fetchData = async (start?: string, end?: string) => {
    try {
      setLoading(true)
      setError(null)

      // Use actual date values for API
      const startDateParam = start || startDate
      const endDateParam = end || endDate

      console.log('Fetching data with dates:', { startDateParam, endDateParam })

      const overview = await chatInsightService.fetchOverview(startDateParam, endDateParam)

      setMetrics(overview.metrics)
      setActivity(overview.activity)
      setTopics(overview.topics)
      setQuestions(overview.questions)
      setConversations(overview.conversations)
      setLastUpdated(overview.lastUpdated)
    } catch (err) {
      console.error('Error fetching chat insights:', err)
      setError(err instanceof Error ? err.message : 'Failed to load chat insights')

      // Don't use mock data - let the error state show
      setMetrics(null)
      setActivity(null)
      setTopics(null)
      setQuestions(null)
      setConversations([])
    } finally {
      setLoading(false)
    }
  }

  // Fallback mock data
  const setMockData = () => {
    const mockMetrics: ChatMetrics = {
      totalChats: 2847,
      activeUsers: 1256,
      avgResponseTime: 2.3,
      avgSatisfaction: 4.2,
      walletConnectedRate: 34.5,
      completionRate: 87.2,
      newUsers: 189,
      totalMessages: 5694,
      trends: {
        chatsChange: 12.5,
        usersChange: 8.3,
        responseTimeChange: -5.2,
        satisfactionChange: 3.1
      }
    }

    const mockActivity: ChatActivity = {
      hourlyHeatmap: Array(7).fill(null).map(() => Array(24).fill(0).map(() => Math.floor(Math.random() * 50))),
      weeklyPattern: [
        { dayOfWeek: 0, avgActivity: 85, peakHour: 14 },
        { dayOfWeek: 1, avgActivity: 120, peakHour: 15 },
        { dayOfWeek: 2, avgActivity: 135, peakHour: 14 },
        { dayOfWeek: 3, avgActivity: 142, peakHour: 16 },
        { dayOfWeek: 4, avgActivity: 138, peakHour: 15 },
        { dayOfWeek: 5, avgActivity: 95, peakHour: 19 },
        { dayOfWeek: 6, avgActivity: 78, peakHour: 20 },
      ],
      summary: {
        peakDay: 'Wed',
        peakHour: 15,
        averageDaily: 118,
        weekendRatio: 0.72
      }
    }

    const mockTopics: TopicAnalysis = {
      categories: [
        { name: 'price', count: 456, percentage: 37.0, avgSatisfaction: 4.3, trendChange: 12.5 },
        { name: 'dex', count: 234, percentage: 19.0, avgSatisfaction: 4.5, trendChange: 8.2 },
        { name: 'bridge', count: 167, percentage: 13.5, avgSatisfaction: 4.0, trendChange: -2.1 },
        { name: 'wallet', count: 123, percentage: 10.0, avgSatisfaction: 3.8, trendChange: 5.7 },
        { name: 'general', count: 189, percentage: 15.3, avgSatisfaction: 4.1, trendChange: -1.2 },
        { name: 'support', count: 65, percentage: 5.2, avgSatisfaction: 3.9, trendChange: 3.4 }
      ],
      keywords: [
        { word: 'CROSS', frequency: 234, trendChange: 15.2 },
        { word: 'DEX', frequency: 187, trendChange: 8.7 },
        { word: '브릿지', frequency: 145, trendChange: -3.2 },
      ],
      languages: {
        korean: { percentage: 66.7, avgSatisfaction: 4.1 },
        english: { percentage: 33.3, avgSatisfaction: 4.3 }
      },
      emergingTopics: [
        { topic: 'Staking 문의', frequency: 45, growthRate: 156.3 },
        { topic: 'Mobile App', frequency: 32, growthRate: 89.2 }
      ]
    }


    const mockQuestions: QuestionAnalysis = {
      topQuestions: [
        {
          question: "CROSS 토큰 현재 가격이 어떻게 되나요?",
          frequency: 87,
          category: 'price',
          language: 'ko',
          avgSatisfaction: 4.2,
          responseTime: 2.1,
          trend: 'rising'
        },
        {
          question: "How to use DEX for trading?",
          frequency: 65,
          category: 'dex',
          language: 'en',
          avgSatisfaction: 4.5,
          responseTime: 3.2,
          trend: 'stable'
        }
      ],
      categories: {
        price: { count: 456, satisfaction: 4.3 },
        dex: { count: 234, satisfaction: 4.5 },
        bridge: { count: 167, satisfaction: 4.0 },
        wallet: { count: 123, satisfaction: 3.8 },
        general: { count: 189, satisfaction: 4.1 },
        support: { count: 65, satisfaction: 3.9 }
      },
      patterns: {
        questionLength: { short: 456, medium: 623, long: 155 }
      },
      trending: {
        rising: ["Staking 문의", "모바일 앱"],
        declining: ["지갑 연결 문제"],
        new: ["NFT 기능"]
      }
    }

    const mockConversations: ChatConversation[] = [
      // Recent conversations
      {
        id: 'chat_001',
        userId: 'user_123',
        question: "CROSS 토큰 가격이 어떻게 돼?",
        response: "현재 CROSS 토큰은 $0.89입니다. 최근 24시간 동안 8.2% 상승했습니다.",
        timestamp: new Date(Date.now() - 120000),
        platform: 'web',
        language: 'ko',
        satisfaction: 5,
        responseTime: 2.1,
        category: 'price'
      },
      {
        id: 'chat_002',
        userId: 'user_456',
        question: "How to use DEX?",
        response: "Here's how to use CROSS DEX: 1. Connect your wallet...",
        timestamp: new Date(Date.now() - 300000),
        platform: 'mobile',
        language: 'en',
        satisfaction: 4,
        responseTime: 3.2,
        category: 'dex'
      },
      // Monday 15:00 conversations (for heatmap testing)
      {
        id: 'chat_mon_1',
        userId: 'user_789',
        question: "브릿지 기능이 작동하지 않아요",
        response: "브릿지 문제를 확인해보겠습니다. 네트워크 상태를 점검해주세요...",
        timestamp: new Date(2025, 0, 20, 15, 15, 0), // Monday 15:15
        platform: 'web',
        language: 'ko',
        satisfaction: 3,
        responseTime: 4.5,
        category: 'bridge'
      },
      {
        id: 'chat_mon_2',
        userId: 'user_101',
        question: "What is the gas fee for bridging?",
        response: "Gas fees vary by network congestion. Current estimates show...",
        timestamp: new Date(2025, 0, 20, 15, 30, 0), // Monday 15:30
        platform: 'mobile',
        language: 'en',
        satisfaction: 4,
        responseTime: 2.8,
        category: 'bridge'
      },
      {
        id: 'chat_mon_3',
        userId: 'user_202',
        question: "지갑 연결이 안 돼요",
        response: "지갑 연결 문제를 해결하기 위해 다음 단계를 따라주세요...",
        timestamp: new Date(2025, 0, 20, 15, 45, 0), // Monday 15:45
        platform: 'web',
        language: 'ko',
        satisfaction: 5,
        responseTime: 1.9,
        category: 'wallet'
      },
      // Tuesday 14:00 conversations
      {
        id: 'chat_tue_1',
        userId: 'user_303',
        question: "How to stake CROSS tokens?",
        response: "To stake CROSS tokens, you can use our staking platform...",
        timestamp: new Date(2025, 0, 21, 14, 10, 0), // Tuesday 14:10
        platform: 'web',
        language: 'en',
        satisfaction: 5,
        responseTime: 3.1,
        category: 'general'
      },
      {
        id: 'chat_tue_2',
        userId: 'user_404',
        question: "DEX에서 슬리피지 설정 방법",
        response: "슬리피지 설정은 거래 설정에서 조정할 수 있습니다...",
        timestamp: new Date(2025, 0, 21, 14, 25, 0), // Tuesday 14:25
        platform: 'mobile',
        language: 'ko',
        satisfaction: 4,
        responseTime: 2.3,
        category: 'dex'
      },
      // Wednesday 16:00 conversations (peak hour)
      {
        id: 'chat_wed_1',
        userId: 'user_505',
        question: "NFT 마켓플레이스 언제 출시되나요?",
        response: "NFT 마켓플레이스는 2025년 2분기에 출시될 예정입니다...",
        timestamp: new Date(2025, 0, 22, 16, 5, 0), // Wednesday 16:05
        platform: 'web',
        language: 'ko',
        satisfaction: 4,
        responseTime: 2.7,
        category: 'general'
      },
      {
        id: 'chat_wed_2',
        userId: 'user_606',
        question: "Current CROSS/USDT trading volume?",
        response: "The current 24h trading volume for CROSS/USDT is approximately...",
        timestamp: new Date(2025, 0, 22, 16, 20, 0), // Wednesday 16:20
        platform: 'mobile',
        language: 'en',
        satisfaction: 5,
        responseTime: 1.8,
        category: 'price'
      },
      {
        id: 'chat_wed_3',
        userId: 'user_707',
        question: "모바일 앱 다운로드 링크 주세요",
        response: "CROSS 모바일 앱은 App Store와 Google Play에서 다운로드할 수 있습니다...",
        timestamp: new Date(2025, 0, 22, 16, 35, 0), // Wednesday 16:35
        platform: 'web',
        language: 'ko',
        satisfaction: 5,
        responseTime: 1.5,
        category: 'support'
      },
      {
        id: 'chat_wed_4',
        userId: 'user_808',
        question: "What are the supported networks?",
        response: "CROSS supports Ethereum, Binance Smart Chain, Polygon, and Arbitrum...",
        timestamp: new Date(2025, 0, 22, 16, 50, 0), // Wednesday 16:50
        platform: 'mobile',
        language: 'en',
        satisfaction: 4,
        responseTime: 2.1,
        category: 'general'
      }
    ]

    setMetrics(mockMetrics)
    setActivity(mockActivity)
    setTopics(mockTopics)
    setQuestions(mockQuestions)
    setConversations(mockConversations)
    setLastUpdated(new Date().toISOString())
  }

  // Handle date change
  const handleStartDateChange = (newDate: string) => {
    setStartDate(newDate)
    fetchData(newDate, endDate)
  }

  const handleEndDateChange = (newDate: string) => {
    setEndDate(newDate)
    fetchData(startDate, newDate)
  }

  // Refresh data
  const handleRefresh = () => {
    fetchData(startDate, endDate)
  }

  // Load data on component mount
  useEffect(() => {
    fetchData()
  }, [])

  // Date range presets
  const handleQuickDateRange = (days: number) => {
    const end = new Date().toISOString().split('T')[0]
    const start = new Date()
    start.setDate(start.getDate() - days)
    const startStr = start.toISOString().split('T')[0]

    setStartDate(startStr)
    setEndDate(end)
    fetchData(startStr, end)
  }

  return (
    <div className={isModal ? "h-full" : "min-h-screen"}>
      {isModal && (
        <>
          {/* Header - 모달 모드일 때만 표시 */}
          <div className="h-16 border-b border-border bg-card flex items-center justify-between px-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center">
                <div className="rounded-lg overflow-hidden flex items-center justify-center">
                  <Image
                    src="/ara.png"
                    alt="ARA Logo"
                    width={40}
                    height={40}
                    className="w-10 h-10"
                  />
                </div>
                <span className="text-xl font-bold text-foreground ml-2">
                  Chat Insights
                </span>
              </div>
              {lastUpdated && (
                <span className="text-xs text-muted-foreground">
                  Last updated: {new Date(lastUpdated).toLocaleTimeString()}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={handleRefresh}
                variant="ghost"
                size="sm"
                disabled={loading}
                className="text-muted-foreground hover:text-foreground"
              >
                <Icon name={loading ? "spinner" : "refresh-cw"} size={16} className={loading ? "animate-spin" : ""} />
              </Button>
              {onClose && (
                <Button
                  onClick={onClose}
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Icon name="x" size={20} />
                </Button>
              )}
            </div>
          </div>
        </>
      )}

      {/* Date Range Selection */}
      <div className="border-b border-border bg-card/30 px-6 py-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Icon name="calendar" size={16} className="text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Date Range</span>
          </div>

          {/* Date Pickers */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <label className="text-sm text-muted-foreground">From:</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => handleStartDateChange(e.target.value)}
                className="px-3 py-1.5 text-sm border border-border rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-muted-foreground">To:</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => handleEndDateChange(e.target.value)}
                className="px-3 py-1.5 text-sm border border-border rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          {/* Quick Select Buttons */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Quick:</span>
            <button
              onClick={() => handleQuickDateRange(1)}
              className="px-2 py-1 text-xs border border-border rounded bg-background text-foreground hover:bg-muted transition-colors"
            >
              1일
            </button>
            <button
              onClick={() => handleQuickDateRange(7)}
              className="px-2 py-1 text-xs border border-border rounded bg-background text-foreground hover:bg-muted transition-colors"
            >
              7일
            </button>
            <button
              onClick={() => handleQuickDateRange(30)}
              className="px-2 py-1 text-xs border border-border rounded bg-background text-foreground hover:bg-muted transition-colors"
            >
              30일
            </button>
          </div>

          {error && (
            <div className="ml-auto flex items-center gap-2 text-red-600">
              <Icon name="alert-circle" size={16} />
              <span className="text-sm">Using fallback data</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className={`flex ${isModal ? "h-[calc(100%-4rem)]" : "min-h-[calc(100vh-4rem)]"}`}>
        {/* Sidebar */}
        <div className="w-64 border-r border-border bg-card/50 overflow-y-auto">
          <div className="p-4">
            <div className="space-y-4">
              {/* Quick Stats */}
              {metrics && (
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-foreground">주요 통계</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-muted/30 rounded-lg p-3 text-center">
                      <p className="text-lg font-bold text-foreground">{metrics.totalChats?.toLocaleString() ?? '0'}</p>
                      <p className="text-[10px] text-muted-foreground">총 대화</p>
                    </div>
                    <div className="bg-muted/30 rounded-lg p-3 text-center">
                      <p className="text-lg font-bold text-foreground">{metrics.topCategories?.[0]?.count ?? 0}</p>
                      <p className="text-[10px] text-muted-foreground">인기 카테고리</p>
                    </div>
                  </div>
                </div>
              )}


              {/* Language Stats */}
              {topics && topics.languages && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-foreground">언어 분포</h3>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-foreground">한국어</span>
                      <span className="text-muted-foreground">{topics.languages.korean?.percentage?.toFixed(1) ?? '0.0'}%</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-foreground">English</span>
                      <span className="text-muted-foreground">{topics.languages.english?.percentage?.toFixed(1) ?? '0.0'}%</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6 w-full pb-8">
            {/* Metrics Grid */}
            <ChatMetricsGrid metrics={metrics} loading={loading} />

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ChatActivityChart data={activity} loading={loading} startDate={startDate} endDate={endDate} />
              <TopicAnalysisChart data={topics} loading={loading} />
              <QuestionAnalysisPanel data={questions} loading={loading} />
            </div>

            {/* Recent Conversations */}
            <RecentConversationsFeed conversations={conversations} loading={loading} />
          </div>
        </div>
      </div>
    </div>
  )
}