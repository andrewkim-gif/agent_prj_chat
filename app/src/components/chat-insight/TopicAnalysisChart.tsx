"use client"

import { Icon } from '@/components/ui/icon'
import { TopicAnalysis } from '@/types/chat-insight'

interface TopicAnalysisChartProps {
  data: TopicAnalysis | null;
  loading: boolean;
}

export function TopicAnalysisChart({ data, loading }: TopicAnalysisChartProps) {
  if (loading) {
    return (
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-5 h-5 bg-muted animate-pulse rounded"></div>
          <div className="w-32 h-5 bg-muted animate-pulse rounded"></div>
        </div>
        <div className="space-y-4">
          <div className="h-48 bg-muted animate-pulse rounded"></div>
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-4 bg-muted animate-pulse rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      price: 'bg-blue-500',
      dex: 'bg-green-500',
      bridge: 'bg-yellow-500',
      wallet: 'bg-purple-500',
      general: 'bg-gray-500',
      support: 'bg-red-500'
    };
    return colors[category] || 'bg-gray-400';
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      price: 'dollar',
      dex: 'repeat',
      bridge: 'bridge',
      wallet: 'credit-card',
      general: 'help-circle',
      support: 'headphones'
    };
    return icons[category] || 'circle';
  };

  const getTrendIcon = (change: number) => {
    if (change > 0) return { icon: 'arrow-up', color: 'text-green-600' };
    if (change < 0) return { icon: 'arrow-down', color: 'text-red-600' };
    return { icon: 'minus', color: 'text-muted-foreground' };
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center gap-2 mb-6">
        <Icon name="tag" size={20} className="text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Topic Analysis</h3>
      </div>

      {data ? (
        <div className="space-y-6">
          {/* Category Distribution */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-foreground">Category Distribution</h4>

            {data.categories.map((category) => {
              const trend = getTrendIcon(category.trendChange);
              return (
                <div key={category.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon
                        name={getCategoryIcon(category.name)}
                        size={16}
                        className="text-muted-foreground"
                      />
                      <span className="text-sm font-medium text-foreground capitalize">
                        {category.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        ({category.count} messages)
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Icon
                        name={trend.icon}
                        size={12}
                        className={trend.color}
                      />
                      <span className={`text-xs font-medium ${trend.color}`}>
                        {Math.abs(category.trendChange)?.toFixed(1) ?? '0.0'}%
                      </span>
                      <span className="text-sm font-medium text-foreground">
                        {category.percentage?.toFixed(1) ?? '0.0'}%
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${getCategoryColor(category.name)}`}
                      style={{ width: `${category.percentage ?? 0}%` }}
                    />
                  </div>

                  {/* Satisfaction */}
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Icon name="star" size={12} className="text-yellow-500" />
                    <span>{category.avgSatisfaction?.toFixed(1) ?? '0.0'} satisfaction</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Top Keywords */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-foreground">Trending Keywords</h4>
            <div className="space-y-2">
              {data.keywords.slice(0, 5).map((keyword, index) => {
                const trend = getTrendIcon(keyword.trendChange);
                return (
                  <div key={keyword.word} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-muted-foreground w-4">
                        #{index + 1}
                      </span>
                      <span className="text-sm font-medium text-foreground">
                        {keyword.word}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        ({keyword.frequency}x)
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Icon name={trend.icon} size={12} className={trend.color} />
                      <span className={`text-xs ${trend.color}`}>
                        {Math.abs(keyword.trendChange)?.toFixed(1) ?? '0.0'}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Language Distribution */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-foreground">Language Distribution</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-muted/30 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-foreground">
                  {data.languages.korean?.percentage?.toFixed(1) ?? '0.0'}%
                </div>
                <div className="text-xs text-muted-foreground">한국어</div>
                <div className="text-xs text-muted-foreground">
                  ★ {data.languages.korean?.avgSatisfaction?.toFixed(1) ?? '0.0'}
                </div>
              </div>
              <div className="bg-muted/30 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-foreground">
                  {data.languages.english?.percentage?.toFixed(1) ?? '0.0'}%
                </div>
                <div className="text-xs text-muted-foreground">English</div>
                <div className="text-xs text-muted-foreground">
                  ★ {data.languages.english?.avgSatisfaction?.toFixed(1) ?? '0.0'}
                </div>
              </div>
            </div>
          </div>

          {/* Emerging Topics */}
          {data.emergingTopics.length > 0 && (
            <div className="space-y-3 border-t border-border pt-4">
              <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                <Icon name="trending-up" size={16} className="text-green-500" />
                Emerging Topics
              </h4>
              <div className="space-y-2">
                {data.emergingTopics.map((topic) => (
                  <div key={topic.topic} className="flex items-center justify-between">
                    <span className="text-sm text-foreground">{topic.topic}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-green-600">
                        +{topic.growthRate?.toFixed(0) ?? '0'}%
                      </span>
                      <span className="text-xs text-muted-foreground">
                        ({topic.frequency}x)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8">
          <Icon name="tag" size={48} className="mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No topic data available</p>
        </div>
      )}
    </div>
  );
}