"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { LocationStats as LocationStatsType } from '@/types/insight'

interface LocationStatsProps {
  data: LocationStatsType[];
  loading: boolean;
}

export function LocationStats({ data, loading }: LocationStatsProps) {
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
  const chartData = (data || []).slice(0, 8).map(location => {
    const locationName = location?.location || 'Unknown'
    return {
      name: locationName.length > 10 ? locationName.slice(0, 10) + '...' : locationName,
      fullName: locationName,
      videos: location?.videoCount || 0,
      sentiment: ((location?.avgSentiment || 0) * 100).toFixed(1),
      harm: location?.harmContent || 0
    }
  })

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-foreground">Videos by Location</h3>
        <p className="text-sm text-muted-foreground">Video distribution across different regions</p>
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
              formatter={(value, name) => [
                typeof value === 'number' ? value.toLocaleString() : value,
                name === 'videos' ? 'Videos' : name === 'sentiment' ? 'Avg Sentiment (%)' : 'Harmful Content'
              ]}
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

      {/* Location Details */}
      <div className="mt-4 space-y-2 max-h-32 overflow-y-auto">
        {(data || []).slice(0, 5).map((location, index) => (
          <div key={location?.location || `location-${index}`} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: `hsl(var(--primary) / ${1 - index * 0.15})` }}
              ></div>
              <span className="font-medium text-foreground">{location?.location || 'Unknown'}</span>
            </div>
            <div className="flex items-center gap-4 text-muted-foreground">
              <span>{location?.videoCount || 0} videos</span>
              <span>{((location?.avgSentiment || 0) * 100).toFixed(1)}% sentiment</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}