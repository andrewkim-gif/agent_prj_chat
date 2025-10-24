"use client"

import { useState, useEffect } from 'react'
import { Icon } from '@/components/ui/icon'
import { Button } from '@/components/ui/button'

interface GeneratedInsight {
  id: string
  type: 'trend' | 'alert' | 'opportunity' | 'summary'
  priority: 'high' | 'medium' | 'low'
  title: string
  description: string
  confidence: number
  supportingData: {
    metric: string
    value: string | number
    change?: string
  }[]
  timestamp: string
}

interface AIInsightHeaderProps {
  className?: string
}

export function AIInsightHeader({ className }: AIInsightHeaderProps) {
  const [insights, setInsights] = useState<GeneratedInsight[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchAIInsights = async () => {
    setIsLoading(true)
    try {
      // 실제 데이터를 기반으로 LLM 인사이트 생성
      const response = await fetch('/api/ai-insights/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      if (response.ok) {
        const data = await response.json()
        setInsights(data.insights || [])
        setLastUpdated(new Date())
      }
    } catch (error) {
      console.error('Failed to fetch AI insights:', error)
      // Mock insights for development
      setInsights(getMockInsights())
      setLastUpdated(new Date())
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAIInsights()
    // 5분마다 자동 업데이트
    const interval = setInterval(fetchAIInsights, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return '🔥'
      case 'medium': return '⚠️'
      case 'low': return '📊'
      default: return '💡'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200'
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const formatLastUpdated = (date: Date | null) => {
    if (!date) return 'Never'
    const now = new Date()
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffMinutes < 1) return 'Just now'
    if (diffMinutes < 60) return `${diffMinutes} minutes ago`
    const diffHours = Math.floor(diffMinutes / 60)
    return `${diffHours} hours ago`
  }

  return (
    <div className={`bg-card border border-border rounded-lg ${className}`}>
      {/* Compact Header */}
      <div className="flex items-center justify-between p-3 border-b border-border">
        <div className="flex items-center gap-2">
          {/* <div className="p-1.5 bg-primary rounded-md">
            <Icon name="Robot" className="w-4 h-4 text-white" />
          </div> */}
          <div>
            {/* <h2 className="text-base font-semibold text-foreground">ARA Insights</h2> */}
            <p className="text-xs text-muted-foreground">
              {formatLastUpdated(lastUpdated)}
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchAIInsights}
          disabled={isLoading}
          className="gap-1 h-7 px-2"
        >
          <Icon
            name={isLoading ? "Spinner" : "Refresh"}
            className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`}
          />
          <span className="text-xs">Refresh</span>
        </Button>
      </div>

      {/* Compact Insights Content */}
      <div className="p-3">
        {isLoading && insights.length === 0 ? (
          <div className="flex items-center justify-center py-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Icon name="Spinner" className="w-4 h-4 animate-spin" />
              <span className="text-sm">Analyzing data patterns...</span>
            </div>
          </div>
        ) : insights.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            <Icon name="Brain" className="w-6 h-6 mx-auto mb-1 opacity-50" />
            <p className="text-sm">No insights available. Click refresh to analyze current data.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {insights.slice(0, 2).map((insight) => (
              <div
                key={insight.id}
                className={`p-2 rounded-md border ${getPriorityColor(insight.priority)}`}
              >
                <div className="flex items-start gap-2">
                  <span className="text-sm">{getPriorityIcon(insight.priority)}</span>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-medium uppercase tracking-wide">
                        {insight.priority}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {insight.confidence}%
                      </span>
                    </div>

                    <h3 className="font-semibold text-xs leading-tight mb-0.5">
                      {insight.title}
                    </h3>

                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                      {insight.description}
                    </p>

                    {insight.supportingData.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-1">
                        {insight.supportingData.slice(0, 2).map((data, index) => (
                          <div key={index} className="text-xs">
                            <span className="font-medium">{data.metric}:</span>
                            <span className="ml-1">{data.value}</span>
                            {data.change && (
                              <span className={`ml-1 ${
                                data.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                              }`}>
                                ({data.change})
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// Mock insights for development/fallback
function getMockInsights(): GeneratedInsight[] {
  return [
    {
      id: '1',
      type: 'trend',
      priority: 'high',
      title: '브라질 지역이 전체 콘텐츠의 80.6% 점유',
      description: '브라질 지역의 압도적인 콘텐츠 생산량이 전체 플랫폼 트렌드를 주도하고 있습니다.',
      confidence: 94,
      supportingData: [
        { metric: '브라질 비디오', value: '908개', change: '+15.2%' },
        { metric: '감정점수', value: '67%', change: '+3.1%' }
      ],
      timestamp: new Date().toISOString()
    },
    {
      id: '2',
      type: 'alert',
      priority: 'medium',
      title: '터키 지역 유해 콘텐츠 증가 감지',
      description: '터키 지역에서 평균 대비 유해 콘텐츠 비율이 상승했습니다.',
      confidence: 78,
      supportingData: [
        { metric: '유해 콘텐츠', value: '5.2%', change: '+2.3x' },
        { metric: '영향 비디오', value: '27개' }
      ],
      timestamp: new Date().toISOString()
    },
    {
      id: '3',
      type: 'summary',
      priority: 'low',
      title: '스크립트 보유율 99.8% 유지',
      description: '자동 번역 시스템이 정상적으로 작동하여 높은 스크립트 보유율을 유지하고 있습니다.',
      confidence: 99,
      supportingData: [
        { metric: '스크립트 보유', value: '1,124개' },
        { metric: '보유율', value: '99.8%' }
      ],
      timestamp: new Date().toISOString()
    }
  ]
}