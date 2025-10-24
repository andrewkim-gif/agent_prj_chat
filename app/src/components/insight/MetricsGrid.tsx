"use client"

import { Icon } from '@/components/ui/icon'
import { DashboardMetrics } from '@/types/insight'

interface MetricsGridProps {
  metrics: DashboardMetrics;
  loading: boolean;
}

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: string;
  trend?: number;
  color: 'blue' | 'green' | 'orange' | 'red' | 'purple';
  loading: boolean;
}

function MetricCard({ title, value, icon, trend, color, loading }: MetricCardProps) {
  const colorClasses = {
    blue: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    green: 'bg-green-500/10 text-green-600 dark:text-green-400',
    orange: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
    red: 'bg-red-500/10 text-red-600 dark:text-red-400',
    purple: 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
  }

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="w-24 h-4 bg-muted animate-pulse rounded"></div>
          <div className="w-10 h-10 bg-muted animate-pulse rounded-lg"></div>
        </div>
        <div className="w-16 h-8 bg-muted animate-pulse rounded mb-2"></div>
        <div className="w-20 h-3 bg-muted animate-pulse rounded"></div>
      </div>
    )
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          <Icon name={icon as any} size={20} />
        </div>
      </div>
      <div className="space-y-1">
        <p className="text-2xl font-bold text-foreground">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </p>
        {trend !== undefined && (
          <div className="flex items-center text-xs">
            <Icon
              name={trend >= 0 ? "arrow-up" : "arrow-down"}
              size={12}
              className={trend >= 0 ? "text-green-500" : "text-red-500"}
            />
            <span className={trend >= 0 ? "text-green-600" : "text-red-600"}>
              {Math.abs(trend)}% from last period
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

export function MetricsGrid({ metrics, loading }: MetricsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <MetricCard
        title="Total Videos"
        value={metrics.totalVideos}
        icon="video"
        color="blue"
        loading={loading}
      />
      <MetricCard
        title="Channels"
        value={metrics.totalChannels}
        icon="users"
        color="green"
        loading={loading}
      />
      <MetricCard
        title="Avg Sentiment"
        value={`${(metrics.avgSentiment * 100).toFixed(1)}%`}
        icon="heart"
        color="purple"
        loading={loading}
      />
      <MetricCard
        title="Harmful Content"
        value={`${metrics.harmContentPercentage}%`}
        icon="shield-alert"
        color="orange"
        loading={loading}
      />
    </div>
  )
}