"use client"

import { Icon } from '@/components/ui/icon'
import { QuestionAnalysis } from '@/types/chat-insight'

interface QuestionAnalysisPanelProps {
  data: QuestionAnalysis | null;
  loading: boolean;
}

export function QuestionAnalysisPanel({ data, loading }: QuestionAnalysisPanelProps) {
  if (loading) {
    return (
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-5 h-5 bg-muted animate-pulse rounded"></div>
          <div className="w-32 h-5 bg-muted animate-pulse rounded"></div>
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-12 bg-muted animate-pulse rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  const getTrendIcon = (trend: 'rising' | 'stable' | 'declining') => {
    switch (trend) {
      case 'rising':
        return { icon: 'trending-up', color: 'text-green-600' };
      case 'declining':
        return { icon: 'trending-down', color: 'text-red-600' };
      default:
        return { icon: 'minus', color: 'text-muted-foreground' };
    }
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

  const getLanguageFlag = (language: 'ko' | 'en') => {
    return language === 'ko' ? '🇰🇷' : '🇺🇸';
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center gap-2 mb-6">
        <Icon name="help-circle" size={20} className="text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Question Analysis</h3>
      </div>

      {data ? (
        <div className="space-y-6">
          {/* Top Questions */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-foreground">Most Asked Questions</h4>
            <div className="space-y-3">
              {data.topQuestions.slice(0, 5).map((question, index) => {
                const trend = getTrendIcon(question.trend);
                return (
                  <div key={index} className="border border-border rounded-lg p-4 hover:bg-muted/30 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="flex items-center justify-center w-6 h-6 bg-primary/10 text-primary rounded-lg text-sm font-bold flex-shrink-0">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <p className="text-sm font-medium text-foreground leading-relaxed">
                            {question.question}
                          </p>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <Icon name={trend.icon} size={14} className={trend.color} />
                            <span className="text-xs font-medium text-muted-foreground">
                              {question.frequency}x
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Icon name={getCategoryIcon(question.category)} size={12} />
                            <span className="capitalize">{question.category}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span>{getLanguageFlag(question.language)}</span>
                            <span>{question.language.toUpperCase()}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Icon name="star" size={12} className="text-yellow-500" />
                            <span>{question.avgSatisfaction.toFixed(1)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Icon name="clock" size={12} />
                            <span>{question.responseTime.toFixed(1)}s</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Category Performance */}
          <div className="space-y-3 border-t border-border pt-4">
            <h4 className="text-sm font-medium text-foreground">Category Performance</h4>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(data.categories).map(([category, stats]) => (
                <div key={category} className="bg-muted/30 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon name={getCategoryIcon(category)} size={14} className="text-primary" />
                    <span className="text-sm font-medium text-foreground capitalize">{category}</span>
                  </div>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div>{stats.count} questions</div>
                    <div className="flex items-center gap-1">
                      <Icon name="star" size={10} className="text-yellow-500" />
                      <span>{stats.satisfaction.toFixed(1)} avg satisfaction</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Question Patterns */}
          <div className="space-y-3 border-t border-border pt-4">
            <h4 className="text-sm font-medium text-foreground">Question Patterns</h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-lg font-bold text-foreground">{data.patterns.questionLength.short}</div>
                <div className="text-xs text-muted-foreground">Short Questions</div>
                <div className="text-xs text-muted-foreground">(&lt;10 words)</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-foreground">{data.patterns.questionLength.medium}</div>
                <div className="text-xs text-muted-foreground">Medium Questions</div>
                <div className="text-xs text-muted-foreground">(10-25 words)</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-foreground">{data.patterns.questionLength.long}</div>
                <div className="text-xs text-muted-foreground">Long Questions</div>
                <div className="text-xs text-muted-foreground">(&gt;25 words)</div>
              </div>
            </div>
          </div>

          {/* Trending Topics */}
          <div className="space-y-3 border-t border-border pt-4">
            <h4 className="text-sm font-medium text-foreground">Trending Topics</h4>
            <div className="space-y-2">
              {data.trending.rising.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Icon name="trending-up" size={14} className="text-green-600" />
                    <span className="text-xs font-medium text-green-600">Rising</span>
                  </div>
                  <div className="flex flex-wrap gap-2 ml-4">
                    {data.trending.rising.map((topic, index) => (
                      <span key={index} className="px-2 py-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-full text-xs">
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {data.trending.declining.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Icon name="trending-down" size={14} className="text-red-600" />
                    <span className="text-xs font-medium text-red-600">Declining</span>
                  </div>
                  <div className="flex flex-wrap gap-2 ml-4">
                    {data.trending.declining.map((topic, index) => (
                      <span key={index} className="px-2 py-1 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-full text-xs">
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {data.trending.new.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Icon name="sparkles" size={14} className="text-blue-600" />
                    <span className="text-xs font-medium text-blue-600">New</span>
                  </div>
                  <div className="flex flex-wrap gap-2 ml-4">
                    {data.trending.new.map((topic, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full text-xs">
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <Icon name="help-circle" size={48} className="mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No question data available</p>
        </div>
      )}
    </div>
  );
}