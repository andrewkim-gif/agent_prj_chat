"use client"

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Icon } from '@/components/ui/icon'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { ContentTrendDashboard } from './ContentTrendDashboard'
import { ChatInsightsDashboard } from '../chat-insight/ChatInsightsDashboard'

interface AIInsightMainProps {
  onClose?: () => void;
  isModal?: boolean;
}

type TabType = 'content-trend' | 'chat-insight'

export function AIInsightMain({ onClose, isModal = true }: AIInsightMainProps) {
  const [activeTab, setActiveTab] = useState<TabType>('content-trend')
  const router = useRouter()
  const pathname = usePathname()

  // URL과 탭 상태 동기화
  useEffect(() => {
    if (pathname === '/chat-insight') {
      setActiveTab('chat-insight')
    } else if (pathname === '/content-insight') {
      setActiveTab('content-trend')
    }
  }, [pathname])

  const handleTabClick = (tab: TabType) => {
    setActiveTab(tab) // 로컬 상태 업데이트
    if (tab === 'content-trend') {
      router.push('/content-insight')
    } else if (tab === 'chat-insight') {
      router.push('/chat-insight')
    }
  }

  return (
    <div className={isModal ? "fixed inset-0 z-50 bg-background" : "min-h-screen bg-background"}>
      {/* Fixed Header with Blur Effect */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border shadow-sm">
        <div className="h-16 flex items-center justify-between px-6">
          <div className="flex items-center gap-6">
            {/* Logo and Title */}
            <div className="flex items-center">
              <div className="rounded-lg overflow-hidden flex items-center justify-center">
                <Image
                  src="/ara.png"
                  alt="ARA Logo"
                  width={40}
                  height={40}
                  className="w-10 h-10"
                />
              </div>
              <span className="text-xl font-bold text-foreground ml-2">
                AI Insight
              </span>
            </div>

            {/* Tab Navigation - moved to same line */}
            <div className="flex items-center space-x-6">
              <button
                onClick={() => handleTabClick('content-trend')}
                className={`py-2 px-3 rounded-md font-medium text-sm transition-colors ${
                  activeTab === 'content-trend'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon name="trend-up" size={16} />
                  Content Trend
                </div>
              </button>
              <button
                onClick={() => handleTabClick('chat-insight')}
                className={`py-2 px-3 rounded-md font-medium text-sm transition-colors ${
                  activeTab === 'chat-insight'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon name="message" size={16} />
                  Chat Insight
                </div>
              </button>
            </div>
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground"
          >
            <Icon name="x" size={20} />
          </Button>
        </div>
      </div>

      {/* Tab Content with Top Margin for Fixed Header */}
      <div className="pt-16 min-h-screen">
        <div className={`${isModal ? "h-[calc(100vh-4rem)]" : "min-h-[calc(100vh-4rem)]"} overflow-auto`}>
          {activeTab === 'content-trend' && (
            <ContentTrendDashboard onClose={() => {}} isModal={false} />
          )}
          {activeTab === 'chat-insight' && (
            <ChatInsightsDashboard onClose={() => {}} isModal={false} />
          )}
        </div>
      </div>
    </div>
  )
}