"use client"

import { useState, useEffect } from 'react'
import { Icon } from '@/components/ui/icon'
import { Button } from '@/components/ui/button'
import { VideoData } from '@/types/insight'

interface RecentVideosProps {
  locations: string[];
  loading: boolean;
}

export function RecentVideos({ locations, loading }: RecentVideosProps) {
  const [videos, setVideos] = useState<VideoData[]>([])
  const [videosLoading, setVideosLoading] = useState(false)

  useEffect(() => {
    const fetchVideos = async () => {
      setVideosLoading(true)
      try {
        const params = new URLSearchParams()
        if (locations.length > 0) {
          params.append('locations', locations.join(','))
        }
        params.append('limit', '8')

        const response = await fetch(`/api/insight/videos?${params}`)
        const data = await response.json()

        if (data.success) {
          setVideos(data.data)
        }
      } catch (error) {
        console.error('Failed to fetch recent videos:', error)
      } finally {
        setVideosLoading(false)
      }
    }

    fetchVideos()
  }, [locations])

  const getSentimentColor = (sentiment: number) => {
    if (sentiment >= 0.7) return 'text-green-600 dark:text-green-400'
    if (sentiment >= 0.4) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
  }

  const getSentimentIcon = (sentiment: number) => {
    if (sentiment >= 0.7) return 'smile'
    if (sentiment >= 0.4) return 'meh'
    return 'frown'
  }

  const getHarmLevel = (harm: number) => {
    if (harm === 0) return { level: 'None', color: 'text-green-600 dark:text-green-400' }
    if (harm <= 0.3) return { level: 'Low', color: 'text-yellow-600 dark:text-yellow-400' }
    if (harm <= 0.6) return { level: 'Medium', color: 'text-orange-600 dark:text-orange-400' }
    return { level: 'High', color: 'text-red-600 dark:text-red-400' }
  }

  if (loading || videosLoading) {
    return (
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="mb-4">
          <div className="w-24 h-5 bg-muted animate-pulse rounded mb-2"></div>
          <div className="w-32 h-4 bg-muted animate-pulse rounded"></div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="flex gap-3">
              <div className="w-16 h-12 bg-muted animate-pulse rounded"></div>
              <div className="flex-1 space-y-2">
                <div className="w-full h-4 bg-muted animate-pulse rounded"></div>
                <div className="w-3/4 h-3 bg-muted animate-pulse rounded"></div>
                <div className="w-1/2 h-3 bg-muted animate-pulse rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Recent Videos</h3>
          <p className="text-sm text-muted-foreground">Latest video content analysis</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground"
        >
          <Icon name="external-link" size={14} />
        </Button>
      </div>

      <div className="space-y-4 max-h-96 overflow-y-auto">
        {videos.length === 0 ? (
          <div className="text-center py-8">
            <Icon name="video-off" size={48} className="mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No videos found for the selected filters.</p>
          </div>
        ) : (
          videos.map((video) => (
            <div key={video._id} className="flex gap-3 p-3 hover:bg-muted/30 rounded-lg transition-colors">
              {/* Video Thumbnail Placeholder */}
              <div className="w-16 h-12 bg-muted/50 rounded flex items-center justify-center flex-shrink-0">
                <Icon name="video" size={16} className="text-muted-foreground" />
              </div>

              {/* Video Details */}
              <div className="flex-1 min-w-0 space-y-2">
                <h4 className="font-medium text-foreground text-sm leading-tight line-clamp-2">
                  {video.title}
                </h4>

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Icon name="user" size={12} />
                  <span className="truncate">{video.channel}</span>
                </div>

                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1">
                    <Icon name="map-pin" size={12} className="text-muted-foreground" />
                    <span className="text-muted-foreground">{video.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Icon name="clock" size={12} className="text-muted-foreground" />
                    <span className="text-muted-foreground">{video.length}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* Sentiment */}
                    <div className="flex items-center gap-1">
                      <Icon
                        name={getSentimentIcon(video.sentiment) as any}
                        size={12}
                        className={getSentimentColor(video.sentiment)}
                      />
                      <span className={`text-xs ${getSentimentColor(video.sentiment)}`}>
                        {(video.sentiment * 100).toFixed(0)}%
                      </span>
                    </div>

                    {/* Harm Level */}
                    <div className="flex items-center gap-1">
                      <Icon
                        name="shield"
                        size={12}
                        className={getHarmLevel(video.harm).color}
                      />
                      <span className={`text-xs ${getHarmLevel(video.harm).color}`}>
                        {getHarmLevel(video.harm).level}
                      </span>
                    </div>

                    {/* Script Available */}
                    {video.isscript && (
                      <div className="flex items-center gap-1">
                        <Icon name="file-text" size={12} className="text-blue-600 dark:text-blue-400" />
                        <span className="text-xs text-blue-600 dark:text-blue-400">Script</span>
                      </div>
                    )}
                  </div>

                  <span className="text-xs text-muted-foreground">
                    {new Date(video.createdat).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {videos.length > 0 && (
        <div className="mt-4 pt-4 border-t border-border">
          <Button
            variant="outline"
            size="sm"
            className="w-full text-sm"
          >
            View All Videos
            <Icon name="arrow-right" size={14} className="ml-2" />
          </Button>
        </div>
      )}
    </div>
  )
}