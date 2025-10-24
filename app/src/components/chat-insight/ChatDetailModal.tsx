"use client"

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Icon } from '@/components/ui/icon'
import { ChatConversation } from '@/types/chat-insight'

interface ChatDetailModalProps {
  isOpen: boolean
  onClose: () => void
  timeSlot: {
    day: string
    hour: number
    count: number
  } | null
  startDate: string
  endDate: string
}

export function ChatDetailModal({ isOpen, onClose, timeSlot, startDate, endDate }: ChatDetailModalProps) {
  const [loading, setLoading] = useState(false)
  const [conversations, setConversations] = useState<ChatConversation[]>([])
  const [error, setError] = useState<string | null>(null)

  // Fetch conversations when modal opens and timeSlot changes
  useEffect(() => {
    if (!isOpen || !timeSlot) {
      setConversations([])
      setError(null)
      return
    }

    const fetchConversations = async () => {
      setLoading(true)
      setError(null)

      try {
        const params = new URLSearchParams({
          day: timeSlot.day,
          hour: timeSlot.hour.toString(),
          startDate,
          endDate
        })

        const response = await fetch(`/api/chat-insights/conversations?${params}`)
        const result = await response.json()

        if (result.success) {
          setConversations(result.data.conversations)
        } else {
          setError(result.error || 'Failed to fetch conversations')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load conversations')
      } finally {
        setLoading(false)
      }
    }

    fetchConversations()
  }, [isOpen, timeSlot, startDate, endDate])

  if (!timeSlot) return null

  const getDayFullName = (dayShort: string) => {
    const dayMap: { [key: string]: string } = {
      'Sun': 'Sunday',
      'Mon': 'Monday',
      'Tue': 'Tuesday',
      'Wed': 'Wednesday',
      'Thu': 'Thursday',
      'Fri': 'Friday',
      'Sat': 'Saturday'
    }
    return dayMap[dayShort] || dayShort
  }

  const formatTimeRange = (hour: number) => {
    const startTime = `${hour.toString().padStart(2, '0')}:00`
    const endTime = `${(hour + 1).toString().padStart(2, '0')}:00`
    return `${startTime} - ${endTime}`
  }

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'price': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'dex': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'bridge': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      'wallet': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      'general': 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
      'support': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    }
    return colors[category] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
  }

  const getSatisfactionIcon = (satisfaction: number) => {
    if (satisfaction >= 5) return { icon: 'smile', color: 'text-green-600' }
    if (satisfaction >= 4) return { icon: 'thumbs-up', color: 'text-blue-600' }
    if (satisfaction >= 3) return { icon: 'minus', color: 'text-yellow-600' }
    if (satisfaction >= 2) return { icon: 'thumbs-down', color: 'text-orange-600' }
    return { icon: 'frown', color: 'text-red-600' }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[99vw] max-w-none max-h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader className="border-b border-border pb-4 flex-shrink-0">
          <DialogTitle className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg">
              <Icon name="message" size={20} className="text-primary" />
            </div>
            <div className="flex-1">
              <div className="text-lg font-semibold text-foreground">
                Chat Details - {getDayFullName(timeSlot.day)}
              </div>
              <div className="text-sm text-muted-foreground">
                {formatTimeRange(timeSlot.hour)} • {timeSlot.count} conversations
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 min-h-0 min-w-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center gap-3">
                <Icon name="spinner" size={20} className="animate-spin text-primary" />
                <span className="text-muted-foreground">Loading conversations...</span>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="alert-circle" size={24} className="text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">Error Loading Conversations</h3>
              <p className="text-sm text-muted-foreground mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90"
              >
                Retry
              </button>
            </div>
          ) : conversations.length > 0 ? (
            <div className="space-y-4">
              {conversations.map((conversation) => {
                const satisfactionData = getSatisfactionIcon(conversation.satisfaction || 3)

                return (
                  <div
                    key={conversation.id}
                    className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow overflow-hidden min-w-0"
                  >
                    {/* Header with metadata */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full" />
                          <span className="text-xs text-muted-foreground">
                            {new Date(conversation.timestamp).toLocaleTimeString('en-US', {
                              hour12: false,
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit'
                            })}
                          </span>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${getCategoryColor(conversation.category || 'general')}`}>
                          {conversation.category || 'general'}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {conversation.language === 'ko' ? '🇰🇷' : '🇺🇸'} {conversation.language}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {conversation.platform === 'mobile' ? '📱' : '💻'} {conversation.platform}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Icon
                          name={satisfactionData.icon as any}
                          size={16}
                          className={satisfactionData.color}
                        />
                        <span className="text-xs text-muted-foreground">
                          {conversation.responseTime?.toFixed(1)}s
                        </span>
                      </div>
                    </div>

                    {/* Conversation content */}
                    <div className="space-y-3">
                      {/* User question */}
                      <div className="flex gap-3 min-w-0">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                          <Icon name="user" size={14} className="text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs text-muted-foreground mb-1">User Question</div>
                          <div className="bg-muted/50 rounded-lg p-3 overflow-hidden">
                            <p className="text-sm text-foreground break-words overflow-wrap-anywhere hyphens-auto" style={{wordBreak: 'break-all', overflowWrap: 'anywhere'}}>{conversation.question}</p>
                          </div>
                        </div>
                      </div>

                      {/* AI response */}
                      <div className="flex gap-3 min-w-0">
                        <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <Icon name="robot" size={14} className="text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs text-muted-foreground mb-1">AI Response</div>
                          <div className="bg-primary/5 border border-primary/10 rounded-lg p-3 overflow-hidden">
                            <p className="text-sm text-foreground break-words overflow-wrap-anywhere hyphens-auto" style={{wordBreak: 'break-all', overflowWrap: 'anywhere'}}>{conversation.response}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Footer with additional info */}
                    <div className="mt-3 pt-3 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground min-w-0">
                      <span className="truncate min-w-0 flex-shrink break-all overflow-wrap-anywhere">User ID: {conversation.userId}</span>
                      <div className="flex items-center gap-4 flex-shrink-0">
                        <span>Satisfaction: {conversation.satisfaction}/5</span>
                        <span>Response Time: {conversation.responseTime?.toFixed(1)}s</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="message-square" size={24} className="text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">No conversations found</h3>
              <p className="text-sm text-muted-foreground">
                No chat conversations were found for {getDayFullName(timeSlot.day)} at {formatTimeRange(timeSlot.hour)}.
              </p>
              <div className="mt-4 text-xs text-muted-foreground">
                This might be because:
                <ul className="mt-2 space-y-1">
                  <li>• The data is showing aggregated/mock data</li>
                  <li>• Conversations are not stored for this time period</li>
                  <li>• The time zone doesn't match the conversation timestamps</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer stats */}
        {conversations.length > 0 && !loading && !error && (
          <div className="border-t border-border pt-4 flex-shrink-0">
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-foreground">{conversations.length}</div>
                <div className="text-xs text-muted-foreground">Total Chats</div>
              </div>
              <div>
                <div className="text-lg font-bold text-foreground">
                  {conversations.length > 0 ? (conversations.reduce((sum, conv) => sum + (conv.satisfaction || 0), 0) / conversations.length).toFixed(1) : '0.0'}
                </div>
                <div className="text-xs text-muted-foreground">Avg Satisfaction</div>
              </div>
              <div>
                <div className="text-lg font-bold text-foreground">
                  {conversations.length > 0 ? (conversations.reduce((sum, conv) => sum + (conv.responseTime || 0), 0) / conversations.length).toFixed(1) : '0.0'}s
                </div>
                <div className="text-xs text-muted-foreground">Avg Response</div>
              </div>
              <div>
                <div className="text-lg font-bold text-foreground">
                  {conversations.length > 0 ? Math.round((conversations.filter(conv => conv.language === 'ko').length / conversations.length) * 100) : 0}%
                </div>
                <div className="text-xs text-muted-foreground">Korean</div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}