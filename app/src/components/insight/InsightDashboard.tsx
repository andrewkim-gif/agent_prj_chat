"use client"

import { useState, useEffect, useCallback } from 'react'
import { Icon } from '@/components/ui/icon'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { MetricsGrid } from './MetricsGrid'
import { TrendChart } from './TrendChart'
import { LanguageStats } from './LanguageStats'
import { AIInsightPanel } from './AIInsightPanel'
import { DashboardMetrics, TrendData, LanguageStats as LanguageStatsData, DailyInsight } from '@/types/insight'
import { getLanguageDisplayName } from '@/lib/language-utils'

interface InsightDashboardProps {
  onClose: () => void;
  isModal?: boolean;
}

export function InsightDashboard({ onClose, isModal = true }: InsightDashboardProps) {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [trendData, setTrendData] = useState<TrendData[]>([])
  const [languageStats, setLanguageStats] = useState<LanguageStatsData[]>([])
  const [dailyInsights, setDailyInsights] = useState<DailyInsight[]>([])
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState({ start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), end: new Date() })

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.append('startDate', dateRange.start.toISOString())
      params.append('endDate', dateRange.end.toISOString())

      // Create separate params for daily insights (no date filtering needed)
      const dailyParams = new URLSearchParams()
      dailyParams.append('limit', '20') // Get latest 20 daily insights

      const [metricsRes, trendsRes, languagesRes, dailyRes] = await Promise.all([
        fetch(`/api/insight/metrics?${params}`),
        fetch(`/api/insight/trends?${params}&days=14`),
        fetch(`/api/insight/languages?${params}`),
        fetch(`/api/insight/daily?${dailyParams}`)
      ])

      const [metricsData, trendsData, languagesData, dailyData] = await Promise.all([
        metricsRes.json(),
        trendsRes.json(),
        languagesRes.json(),
        dailyRes.json()
      ])

      if (metricsData.success) setMetrics(metricsData.data)
      if (trendsData.success) setTrendData(trendsData.data)
      if (languagesData.success) setLanguageStats(languagesData.data)
      if (dailyData.success) setDailyInsights(dailyData.data)
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }, [dateRange])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return (
    <div className={isModal ? "fixed inset-0 z-50 bg-background" : "min-h-screen bg-background"}>
      {/* Header */}
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
              ARA AI
            </span>
          </div>
        </div>
        <Button
          onClick={onClose}
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground"
        >
          <Icon name="x" size={20} />
        </Button>
      </div>

      {/* Date Selection - 최상단에 배치 */}
      <div className="border-b border-border bg-card/30 px-6 py-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Icon name="calendar" size={16} className="text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Date Range</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={dateRange.start.toISOString().split('T')[0]}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: new Date(e.target.value) }))}
              className="px-3 py-1.5 text-sm border border-border rounded-md bg-background text-foreground"
            />
            <span className="text-xs text-muted-foreground">to</span>
            <input
              type="date"
              value={dateRange.end.toISOString().split('T')[0]}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: new Date(e.target.value) }))}
              className="px-3 py-1.5 text-sm border border-border rounded-md bg-background text-foreground"
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`flex ${isModal ? "h-[calc(100vh-8rem)]" : "min-h-[calc(100vh-8rem)]"}`}>
        {/* Sidebar - 더 컴팩트하게 (날짜 선택 제거) */}
        <div className="w-64 border-r border-border bg-card/50 overflow-y-auto">
          <div className="p-4">
            <div className="space-y-4">
              {/* Quick Stats - 언어 선택 위로 이동 */}
              {metrics && (
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-foreground">Quick Stats</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-muted/30 rounded-lg p-3 text-center">
                      <p className="text-lg font-bold text-foreground">{metrics.totalVideos.toLocaleString()}</p>
                      <p className="text-[10px] text-muted-foreground">Total Videos</p>
                    </div>
                    <div className="bg-muted/30 rounded-lg p-3 text-center">
                      <p className="text-lg font-bold text-foreground">{(metrics.avgSentiment * 100).toFixed(1)}%</p>
                      <p className="text-[10px] text-muted-foreground">Avg Sentiment</p>
                    </div>
                    <div className="bg-muted/30 rounded-lg p-3 text-center">
                      <p className="text-lg font-bold text-foreground">{metrics.harmContentPercentage.toFixed(0)}</p>
                      <p className="text-[10px] text-muted-foreground">Harmful Content</p>
                    </div>
                    <div className="bg-muted/30 rounded-lg p-3 text-center">
                      <p className="text-lg font-bold text-foreground">{metrics.totalChannels}</p>
                      <p className="text-[10px] text-muted-foreground">Active Channels</p>
                    </div>
                  </div>
                </div>
              )}

              {/* 자막 언어 통계 */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-foreground">자막 언어 통계</h3>
                <div className="space-y-1.5">
                  {languageStats.slice(0, 8).map((lang, index) => (
                    <div key={`${lang.lang}-${index}`} className="flex items-center justify-between text-xs">
                      <span className="text-foreground">{getLanguageDisplayName(lang.lang)}</span>
                      <span className="text-muted-foreground">{lang.videoCount}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Content - 전체 너비 활용 */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6 w-full pb-8">

            {/* ARA Insights Panel - 최상단으로 이동, 전체 너비 사용 */}
            <div className="w-full">
              <AIInsightPanel insights={dailyInsights} loading={loading} />
            </div>

            {/* Metrics Grid */}
            {metrics && (
              <MetricsGrid metrics={metrics} loading={loading} />
            )}

            {/* Charts Row - 더 넓은 화면 활용 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TrendChart data={trendData} loading={loading} />
              <LanguageStats data={languageStats} loading={loading} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}