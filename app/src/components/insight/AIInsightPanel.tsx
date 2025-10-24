"use client"

import { Icon } from '@/components/ui/icon'
import { Button } from '@/components/ui/button'
import { DailyInsight } from '@/types/insight'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface AIInsightPanelProps {
  insights: DailyInsight[];
  loading: boolean;
}

export function AIInsightPanel({ insights, loading }: AIInsightPanelProps) {
  const [selectedInsight, setSelectedInsight] = useState<DailyInsight | null>(
    insights.length > 0 ? insights[0] : null
  )
  const [displayedText, setDisplayedText] = useState('')

  // Update selectedInsight when insights prop changes
  useEffect(() => {
    if (insights.length > 0) {
      setSelectedInsight(insights[0])
    } else {
      setSelectedInsight(null)
    }
  }, [insights])

  // Streaming effect for AI insight text
  useEffect(() => {
    if (!selectedInsight?.aiInsight) {
      setDisplayedText('')
      return
    }

    setDisplayedText('')

    const text = selectedInsight.aiInsight
    let currentIndex = 0

    const streamInterval = setInterval(() => {
      if (currentIndex < text.length) {
        setDisplayedText(text.slice(0, currentIndex + 1))
        currentIndex++
      } else {
        clearInterval(streamInterval)
      }
    }, 15) // 15ms per character for faster streaming

    return () => clearInterval(streamInterval)
  }, [selectedInsight?.aiInsight])

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="mb-4">
          <div className="w-32 h-5 bg-muted animate-pulse rounded mb-2"></div>
          <div className="w-48 h-4 bg-muted animate-pulse rounded"></div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-muted animate-pulse rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  if (!selectedInsight) {
    return (
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">ARA Insights</h3>
        <div className="text-center py-8">
          <Icon name="info" size={48} className="mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No insights available for the selected filters.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* ARA Chat Message - 완전히 새로운 상단 섹션 */}
      <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-secondary p-1">
              <Image
                src="/ara.png"
                alt="ARA"
                width={40}
                height={40}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-semibold text-foreground">ARA</span>
              <span className="text-xs text-muted-foreground">
                {new Date(selectedInsight.date).toLocaleDateString()}
              </span>
            </div>
            {/* 간단한 메시지 박스 */}
            <div className="bg-muted/50 border border-border rounded-lg px-4 py-3">
              <p className="text-sm text-foreground leading-relaxed font-semibold">
                {displayedText}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 기존 ARA Insights 패널 */}
      <div className="bg-card border border-border rounded-lg p-6">
        {/* 날짜 선택 - shadcn Dropdown Menu */}
        {insights.length > 1 && (
          <div className="flex items-center gap-3 mb-6">
            <Icon name="calendar" size={16} className="text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Daily Select</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="w-[180px] justify-between px-3 py-2 text-sm border border-border rounded-md bg-background text-foreground hover:bg-muted/50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  {new Date(selectedInsight.date).toLocaleDateString('ko-KR', {
                    month: 'short',
                    day: 'numeric'
                  })}
                  <Icon
                    name="chevron-down"
                    size={16}
                    className="text-muted-foreground"
                  />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[180px]" align="start">
                {insights.map((insight) => (
                  <DropdownMenuItem
                    key={insight._id}
                    onClick={() => setSelectedInsight(insight)}
                    className="cursor-pointer"
                  >
                    <Icon name="calendar" size={14} className="mr-2 text-muted-foreground" />
                    {new Date(insight.date).toLocaleDateString('ko-KR', {
                      month: 'short',
                      day: 'numeric'
                    })}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}

        {/* Daily Summary - Simple Design */}
        {selectedInsight.summaryText && (
          <div className="space-y-4">
            {/* Header with horizontal line */}
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-semibold text-foreground">Daily Summary</h3>
              <div className="flex-1 h-px bg-border"></div>
              <span className="text-xs text-muted-foreground">
                {new Date(selectedInsight.date).toLocaleDateString('ko-KR', {
                  month: 'short',
                  day: 'numeric'
                })}
              </span>
            </div>

            {/* Summary Content */}
            <div className="pl-7">
              <p className="text-sm text-foreground leading-relaxed">
                {selectedInsight.summaryText}
              </p>
            </div>

            {/* Bottom divider */}
            <div className="h-px bg-border"></div>
          </div>
        )}

        <div className="space-y-6">

          {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10">
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">{selectedInsight.totalVideos}</p>
            <p className="text-xs text-muted-foreground">Total Videos</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">
              {(selectedInsight.avgSentiment * 100).toFixed(1)}%
            </p>
            <p className="text-xs text-muted-foreground">Avg Sentiment</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">{selectedInsight.harmContentCount}</p>
            <p className="text-xs text-muted-foreground">Harmful Content</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">
              {selectedInsight.totalActiveChannels || selectedInsight.topChannels.length}
            </p>
            <p className="text-xs text-muted-foreground">Active Channels</p>
          </div>
        </div>

        {/* Positive & Negative Highlights - 심플한 디자인 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Positive Highlights */}
          {selectedInsight.positiveHighlights && selectedInsight.positiveHighlights.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Positive Highlights
              </h4>
              <div className="space-y-2">
                {selectedInsight.positiveHighlights.slice(0, 3).map((highlight, index) => (
                  <div key={index} className="bg-card border border-border rounded-lg p-3">
                    <p className="text-sm text-foreground leading-relaxed">{highlight}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Negative Issues */}
          {selectedInsight.negativeIssues && selectedInsight.negativeIssues.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                Negative Issues
              </h4>
              <div className="space-y-2">
                {selectedInsight.negativeIssues.slice(0, 3).map((issue, index) => (
                  <div key={index} className="bg-card border border-border rounded-lg p-3">
                    <p className="text-sm text-foreground leading-relaxed">{issue}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>


        {/* Key Topics */}
        {selectedInsight.keyTopics && selectedInsight.keyTopics.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Icon name="tag" size={16} className="text-primary" />
              <h4 className="font-medium text-foreground">Key Topics</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedInsight.keyTopics.slice(0, 6).map((topic, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium"
                >
                  {topic}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations */}
        {selectedInsight.recommendations && selectedInsight.recommendations.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Icon name="lightbulb" size={16} className="text-primary" />
              <h4 className="font-medium text-foreground">Recommendations</h4>
            </div>
            <div className="space-y-2">
              {selectedInsight.recommendations.slice(0, 3).map((rec, index) => (
                <div key={index} className="flex items-start gap-2 text-sm">
                  <Icon name="arrow-right" size={14} className="text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-muted-foreground leading-relaxed">{rec}</p>
                </div>
              ))}
            </div>
          </div>
        )}


        {/* Player Concerns - Simple Design with Gauge */}
        {selectedInsight.trendAnalysis?.playerConcerns && selectedInsight.trendAnalysis.playerConcerns.length > 0 && (
          <div className="space-y-4">
            {/* Header with horizontal line */}
            <div className="flex items-center gap-3">
              <Icon name="alert-triangle" size={16} className="text-orange-600" />
              <h4 className="font-semibold text-foreground">Player Concerns</h4>
              <div className="flex-1 h-px bg-border"></div>
              <span className="text-xs text-muted-foreground">{selectedInsight.trendAnalysis.playerConcerns.length} issues</span>
            </div>

            <div className="space-y-3">
              {selectedInsight.trendAnalysis.playerConcerns.map((concern, index) => {
                // Calculate priority based on position (first = highest priority)
                const priorityScore = Math.max(10, 100 - (index * 15))
                const priorityColor = priorityScore >= 80 ? 'bg-red-500' :
                                    priorityScore >= 50 ? 'bg-orange-500' : 'bg-yellow-500'

                return (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 bg-card border border-border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    {/* Priority Gauge */}
                    <div className="flex flex-col items-center gap-1 flex-shrink-0 mt-1">
                      <div className="w-8 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full ${priorityColor} transition-all duration-300`}
                          style={{ width: `${priorityScore}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-muted-foreground">
                        {priorityScore}%
                      </span>
                    </div>

                    {/* Concern Content */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground leading-relaxed">
                        {concern}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Popular Features */}
        {selectedInsight.trendAnalysis?.popularFeatures && selectedInsight.trendAnalysis.popularFeatures.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Icon name="star" size={16} className="text-green-500" />
              <h4 className="font-medium text-foreground">Popular Features</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedInsight.trendAnalysis.popularFeatures.slice(0, 6).map((feature, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium border border-green-200"
                >
                  {feature}
                </span>
              ))}
            </div>
          </div>
        )}


        {/* Content List */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Icon name="play" size={16} className="text-primary" />
            <h4 className="font-medium text-foreground">Analyzed Content</h4>
            {!loading && selectedInsight.videoContent && (
              <span className="text-xs text-muted-foreground">
                ({selectedInsight.videoContent.length} of {selectedInsight.totalVideos} videos)
              </span>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-3">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="bg-card border border-border rounded-lg p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="w-3/4 h-4 bg-muted animate-pulse rounded mb-2"></div>
                      <div className="w-1/2 h-3 bg-muted animate-pulse rounded mb-2"></div>
                      <div className="flex gap-4">
                        <div className="w-16 h-3 bg-muted animate-pulse rounded"></div>
                        <div className="w-16 h-3 bg-muted animate-pulse rounded"></div>
                        <div className="w-16 h-3 bg-muted animate-pulse rounded"></div>
                      </div>
                    </div>
                    <div className="w-12 h-6 bg-muted animate-pulse rounded-full"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : selectedInsight.videoContent && selectedInsight.videoContent.length > 0 ? (
            <div className="grid grid-cols-1 gap-3 max-h-96 overflow-y-auto">
              {selectedInsight.videoContent.slice(0, 20).map((video, index) => (
                <div
                  key={video._id || index}
                  className="bg-card border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => {
                    if (video.url) {
                      window.open(video.url, '_blank', 'noopener,noreferrer')
                    }
                  }}
                >
                  <div className="flex gap-4">
                    {/* 썸네일 */}
                    <div className="flex-shrink-0">
                      {video.thumbnail_url ? (
                        <div className="w-24 h-16 rounded-lg overflow-hidden bg-muted relative">
                          <Image
                            src={video.thumbnail_url}
                            alt={video.title}
                            width={96}
                            height={64}
                            className="w-full h-full object-cover"
                            unoptimized={true}
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              if (target.parentElement) {
                                target.parentElement.innerHTML = `
                                  <div class="w-full h-full bg-muted flex items-center justify-center">
                                    <svg class="w-6 h-6 text-muted-foreground" fill="currentColor" viewBox="0 0 20 20">
                                      <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"/>
                                    </svg>
                                  </div>
                                `;
                              }
                            }}
                          />
                        </div>
                      ) : (
                        <div className="w-24 h-16 rounded-lg bg-muted flex items-center justify-center">
                          <Icon name="video" size={20} className="text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    {/* 콘텐츠 정보 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <h5 className="text-sm font-semibold text-foreground line-clamp-2 flex-1">
                          {video.title}
                        </h5>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                            video.sentiment > 0.6 ? 'bg-green-100 text-green-700' :
                            video.sentiment > 0.4 ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {(video.sentiment * 100).toFixed(0)}%
                          </div>
                          {video.harm > 0.1 && (
                            <div className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                              ⚠️
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
                        <span className="font-medium">{video.channel}</span>
                        {video.streamer_nickname && (
                          <span>by {video.streamer_nickname}</span>
                        )}
                        <span>{new Date(video.createdat).toLocaleDateString('ko-KR')}</span>
                        {video.url && (
                          <Icon name="external-link" size={12} className="text-muted-foreground" />
                        )}
                      </div>

                      {/* 요약 또는 설명 */}
                      {(video.summary || video.description || video.script_kr) && (
                        <div className="mb-3">
                          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                            {video.summary || video.description || video.script_kr}
                          </p>
                        </div>
                      )}

                      {/* 메트릭스 */}
                      <div className="flex items-center gap-4 text-xs">
                        {video.views && (
                          <div className="flex items-center gap-1">
                            <Icon name="eye" size={12} className="text-muted-foreground" />
                            <span className="text-muted-foreground">
                              {video.views.toLocaleString()}
                            </span>
                          </div>
                        )}
                        {video.likes && (
                          <div className="flex items-center gap-1">
                            <Icon name="heart" size={12} className="text-muted-foreground" />
                            <span className="text-muted-foreground">
                              {video.likes.toLocaleString()}
                            </span>
                          </div>
                        )}
                        {video.comment && (
                          <div className="flex items-center gap-1">
                            <Icon name="message" size={12} className="text-muted-foreground" />
                            <span className="text-muted-foreground">
                              {video.comment.toLocaleString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Icon name="video" size={48} className="mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No video content available for this date.</p>
            </div>
          )}
        </div>
        </div>
      </div>
    </div>
  )
}