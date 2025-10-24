"use client"

import { Icon } from '@/components/ui/icon'
import { ChatConversation } from '@/types/chat-insight'

interface RecentConversationsFeedProps {
  conversations: ChatConversation[];
  loading: boolean;
}

export function RecentConversationsFeed({ conversations, loading }: RecentConversationsFeedProps) {
  const formatTime = (timestamp: Date | string) => {
    const now = new Date();
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp);

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return '시간 미상';
    }

    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return '방금 전';
    if (minutes < 60) return `${minutes}분 전`;
    if (hours < 24) return `${hours}시간 전`;
    return `${days}일 전`;
  };

  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  const getLanguageFlag = (language: 'ko' | 'en') => {
    return language === 'ko' ? '🇰🇷' : '🇺🇸';
  };

  const getPlatformIcon = (platform: string) => {
    const icons: Record<string, string> = {
      web: 'monitor',
      mobile: 'smartphone',
      api: 'code'
    };
    return icons[platform] || 'circle';
  };

  const getSatisfactionColor = (satisfaction: number) => {
    if (satisfaction >= 4) return 'text-green-600';
    if (satisfaction >= 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-5 h-5 bg-muted animate-pulse rounded"></div>
          <div className="w-32 h-5 bg-muted animate-pulse rounded"></div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-muted animate-pulse rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="w-3/4 h-4 bg-muted animate-pulse rounded"></div>
                  <div className="w-1/2 h-3 bg-muted animate-pulse rounded"></div>
                </div>
              </div>
              <div className="border-b border-border"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center gap-2 mb-6">
        <Icon name="message-circle" size={20} className="text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Recent Conversations</h3>
      </div>

      {conversations.length > 0 ? (
        <div className="space-y-4">
          {conversations.slice(0, 10).map((conversation) => (
            <div key={conversation.id} className="group">
              <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/30 transition-colors">
                <div className="flex items-center justify-center w-8 h-8 bg-primary/10 text-primary rounded-full text-xs font-bold flex-shrink-0">
                  {conversation.userId.substring(0, 2).toUpperCase()}
                </div>

                <div className="flex-1 min-w-0 space-y-2">
                  {/* User Question */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Icon name="user" size={12} />
                      <span>User Question</span>
                      <span>{getLanguageFlag(conversation.language)}</span>
                    </div>
                    <p className="text-sm text-foreground font-medium leading-relaxed">
                      {truncateText(conversation.question, 120)}
                    </p>
                  </div>

                  {/* Assistant Response */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Icon name="robot" size={12} />
                      <span>ARA Response</span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {truncateText(conversation.response, 150)}
                    </p>
                  </div>

                  {/* Metadata */}
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Icon name={getPlatformIcon(conversation.platform)} size={12} />
                        <span className="capitalize">{conversation.platform}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Icon name="clock-two" size={12} />
                        <span>{conversation.responseTime.toFixed(1)}s</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Icon name="star" size={12} className={getSatisfactionColor(conversation.satisfaction)} />
                        <span className={getSatisfactionColor(conversation.satisfaction)}>
                          {conversation.satisfaction.toFixed(1)}
                        </span>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatTime(conversation.timestamp)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Separator */}
              <div className="border-b border-border mt-2"></div>
            </div>
          ))}

          {/* View More Button */}
          {conversations.length > 10 && (
            <div className="pt-4 border-t border-border">
              <button className="w-full py-2 text-sm text-primary hover:text-primary/80 font-medium transition-colors">
                View More Conversations
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8">
          <Icon name="message-circle" size={48} className="mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No recent conversations available</p>
        </div>
      )}
    </div>
  );
}