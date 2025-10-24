"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { TrendData } from '@/types/insight'

interface TrendChartProps {
  data: TrendData[];
  loading: boolean;
}

export function TrendChart({ data, loading }: TrendChartProps) {
  // Debug logging
  console.log('TrendChart - data:', data);
  console.log('TrendChart - loading:', loading);

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

  // Show empty state if no data
  if (!data || data.length === 0) {
    return (
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-foreground">Sentiment & Video Trends</h3>
          <p className="text-sm text-muted-foreground">Daily sentiment scores and video counts over time</p>
        </div>
        <div className="h-64 flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground mb-2">No trend data available</p>
            <p className="text-xs text-muted-foreground">Try adjusting your date range or language filters</p>
          </div>
        </div>
      </div>
    )
  }

  // Transform and validate data
  const chartData = data.map(item => ({
    date: item.date,
    sentiment: typeof item.sentiment === 'number' ? item.sentiment : 0,
    videoCount: typeof item.videoCount === 'number' ? item.videoCount : 0,
    harmContent: typeof item.harmContent === 'number' ? item.harmContent : 0
  })).filter(item => item.date) // Remove items without dates

  console.log('TrendChart - chartData:', chartData);

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-foreground">Sentiment & Video Trends</h3>
        <p className="text-sm text-muted-foreground">Daily sentiment scores and video counts over time</p>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="date"
              className="text-muted-foreground"
              tick={{ fontSize: 10 }}
              interval={0}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis
              yAxisId="sentiment"
              domain={[0, 1]}
              className="text-muted-foreground"
              tick={{ fontSize: 12 }}
              label={{ value: 'Sentiment', angle: -90, position: 'insideLeft' }}
            />
            <YAxis
              yAxisId="videos"
              orientation="right"
              className="text-muted-foreground"
              tick={{ fontSize: 12 }}
              label={{ value: 'Count', angle: 90, position: 'insideRight' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px',
                color: 'hsl(var(--foreground))'
              }}
              formatter={(value, name) => {
                if (name === 'sentiment') return [(Number(value) || 0).toFixed(3), 'Sentiment Score']
                if (name === 'videoCount') return [(Number(value) || 0).toLocaleString(), 'Videos']
                if (name === 'harmContent') return [(Number(value) || 0).toLocaleString(), 'Harmful Content']
                return [value, name]
              }}
            />
            <Legend />
            <Line
              yAxisId="sentiment"
              type="monotone"
              dataKey="sentiment"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={{ r: 4 }}
              name="sentiment"
              connectNulls={false}
            />
            <Line
              yAxisId="videos"
              type="monotone"
              dataKey="videoCount"
              stroke="hsl(142 76% 36%)"
              strokeWidth={2}
              dot={{ r: 4 }}
              name="videoCount"
              connectNulls={false}
            />
            <Line
              yAxisId="videos"
              type="monotone"
              dataKey="harmContent"
              stroke="hsl(346 87% 43%)"
              strokeWidth={2}
              dot={{ r: 4 }}
              name="harmContent"
              connectNulls={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Data Summary */}
      <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
        <div className="text-center">
          <p className="font-medium text-foreground">{chartData.length}</p>
          <p className="text-muted-foreground">Days of Data</p>
        </div>
        <div className="text-center">
          <p className="font-medium text-foreground">
            {chartData.reduce((sum, item) => sum + item.videoCount, 0).toLocaleString()}
          </p>
          <p className="text-muted-foreground">Total Videos</p>
        </div>
        <div className="text-center">
          <p className="font-medium text-foreground">
            {chartData.length > 0 ? (chartData.reduce((sum, item) => sum + item.sentiment, 0) / chartData.length).toFixed(3) : '0.000'}
          </p>
          <p className="text-muted-foreground">Avg Sentiment</p>
        </div>
      </div>
    </div>
  )
}