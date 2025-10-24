"use client"

import { Icon } from '@/components/ui/icon'
import { ChatMetrics } from '@/types/chat-insight'

interface ChatMetricsGridProps {
  metrics: ChatMetrics | null;
  loading: boolean;
}

interface MetricCardProps {
  title: string;
  value: number | string;
  icon: string;
  trend?: number;
  format: 'number' | 'decimal' | 'percentage' | 'time';
  loading: boolean;
}

function MetricCard({ title, value, icon, trend, format, loading }: MetricCardProps) {
  const formatValue = (val: number | string) => {
    if (typeof val === 'string') return val;
    if (val == null || isNaN(val)) return '0';

    switch (format) {
      case 'number':
        return val.toLocaleString();
      case 'decimal':
        return val.toFixed(1);
      case 'percentage':
        return `${val.toFixed(1)}%`;
      case 'time':
        return `${val.toFixed(1)}s`;
      default:
        return val.toString();
    }
  };

  const getTrendColor = (trendValue?: number) => {
    if (!trendValue) return 'text-muted-foreground';
    return trendValue > 0 ? 'text-green-600' : 'text-red-600';
  };

  const getTrendIcon = (trendValue?: number) => {
    if (!trendValue) return null;
    return trendValue > 0 ? 'arrow-up' : 'arrow-down';
  };

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="w-20 h-4 bg-muted animate-pulse rounded"></div>
            <div className="w-16 h-8 bg-muted animate-pulse rounded"></div>
          </div>
          <div className="w-10 h-10 bg-muted animate-pulse rounded-lg"></div>
        </div>
        <div className="mt-4 w-24 h-3 bg-muted animate-pulse rounded"></div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold text-foreground">
            {formatValue(value)}
          </p>
        </div>
        <div className="p-2 bg-primary/10 rounded-lg">
          <Icon name={icon} size={20} className="text-primary" />
        </div>
      </div>

      {trend !== undefined && (
        <div className="mt-4 flex items-center gap-1">
          {getTrendIcon(trend) && (
            <Icon
              name={getTrendIcon(trend)!}
              size={14}
              className={getTrendColor(trend)}
            />
          )}
          <span className={`text-sm font-medium ${getTrendColor(trend)}`}>
            {Math.abs(trend ?? 0).toFixed(1)}%
          </span>
          <span className="text-xs text-muted-foreground">vs last period</span>
        </div>
      )}
    </div>
  );
}

export function ChatMetricsGrid({ metrics, loading }: ChatMetricsGridProps) {

  const metricCards = [
    {
      title: "Total Conversations",
      value: metrics?.totalChats || 0,
      icon: "message-circle",
      trend: undefined,
      format: "number" as const
    },
    {
      title: "Korean Conversations",
      value: metrics?.languageDistribution?.korean || 0,
      icon: "globe",
      trend: undefined,
      format: "number" as const
    },
    {
      title: "English Conversations",
      value: metrics?.languageDistribution?.english || 0,
      icon: "globe",
      trend: undefined,
      format: "number" as const
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Icon name="chart-bar" size={20} className="text-primary" />
        <h2 className="text-lg font-semibold text-foreground">Key Metrics</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metricCards.map((metric) => (
          <MetricCard
            key={metric.title}
            title={metric.title}
            value={metric.value}
            icon={metric.icon}
            trend={metric.trend}
            format={metric.format}
            loading={loading}
          />
        ))}
      </div>
    </div>
  );
}