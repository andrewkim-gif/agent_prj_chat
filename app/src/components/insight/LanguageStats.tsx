"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { LanguageStats as LanguageStatsInterface } from '@/types/insight'
import { getLanguageDisplayName } from '@/lib/language-utils'

interface LanguageStatsProps {
  data: LanguageStatsInterface[];
  loading: boolean;
}

export function LanguageStats({ data, loading }: LanguageStatsProps) {
  // Debug logging
  console.log('LanguageStats - data:', data);
  console.log('LanguageStats - loading:', loading);

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="mb-4">
          <div className="w-32 h-5 bg-muted animate-pulse rounded mb-2"></div>
          <div className="w-48 h-4 bg-muted animate-pulse rounded"></div>
        </div>
        <div className="h-64 bg-muted animate-pulse rounded"></div>
      </div>
    )
  }

  // Transform data for the chart with null safety
  const chartData = (data || []).slice(0, 8).map(language => {
    const languageCode = language?.lang || 'unknown'
    const languageName = getLanguageDisplayName(languageCode)
    return {
      name: languageName.length > 10 ? languageName.slice(0, 10) + '...' : languageName,
      fullName: languageName,
      videos: language?.videoCount || 0,
      sentiment: ((language?.avgSentiment || 0) * 100).toFixed(1),
      harm: language?.harmContent || 0,
      views: language?.totalViews || 0,
      engagement: language?.avgEngagementRate || 0
    }
  })

  console.log('LanguageStats - chartData:', chartData);

  // Show empty state if no data
  if (!data || data.length === 0) {
    return (
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-foreground">Videos by Language</h3>
          <p className="text-sm text-muted-foreground">Video distribution and engagement across different languages</p>
        </div>
        <div className="h-64 flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground mb-2">No language data available</p>
            <p className="text-xs text-muted-foreground">Try adjusting your date range or filters</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-foreground">Videos by Language</h3>
        <p className="text-sm text-muted-foreground">Video distribution and engagement across different languages</p>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="name"
              className="text-muted-foreground"
              tick={{ fontSize: 10 }}
              interval={0}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis className="text-muted-foreground" tick={{ fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px',
                color: 'hsl(var(--foreground))'
              }}
              formatter={(value, name) => {
                if (name === 'videos') return [typeof value === 'number' ? value.toLocaleString() : value, 'Videos']
                if (name === 'sentiment') return [value + '%', 'Avg Sentiment']
                if (name === 'views') return [typeof value === 'number' ? value.toLocaleString() : value, 'Total Views']
                if (name === 'engagement') return [value + '%', 'Engagement Rate']
                return [value, name]
              }}
              labelFormatter={(label) => {
                const item = chartData.find(d => d.name === label)
                return item ? item.fullName : label
              }}
            />
            <Bar
              dataKey="videos"
              fill="hsl(var(--primary))"
              radius={[2, 2, 0, 0]}
              name="Videos"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Language Details */}
      <div className="mt-4 space-y-2 max-h-32 overflow-y-auto">
        {(data || []).slice(0, 5).map((language, index) => (
          <div key={language?.lang || `language-${index}`} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: `hsl(var(--primary) / ${1 - index * 0.15})` }}
              ></div>
              <span className="font-medium text-foreground">{getLanguageDisplayName(language?.lang)}</span>
            </div>
            <div className="flex items-center gap-4 text-muted-foreground">
              <span>{language?.videoCount || 0} videos</span>
              <span>{((language?.avgSentiment || 0) * 100).toFixed(1)}% sentiment</span>
              {language?.totalViews && (
                <span>{(language.totalViews || 0).toLocaleString()} views</span>
              )}
              {language?.avgEngagementRate && (
                <span>{(language.avgEngagementRate || 0).toFixed(1)}% engagement</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}