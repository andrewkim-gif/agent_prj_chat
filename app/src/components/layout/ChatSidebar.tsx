"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Icon } from "@/components/ui/icon"
import { useEffect, useState } from "react"
import { TwitterFeedManager } from "@/lib/twitter-feed"
import { WalletSection } from "@/components/wallet/WalletSection"
import { WalletQuickActions } from "@/components/wallet/WalletQuickActions"

interface Tweet {
  id: string
  author: string
  handle: string
  content: string
  time: string
  avatar: string
  timestamp: Date
}

const marketData = [
  { symbol: "BNGO", price: "$2.45", change: "+12.5%" },
  { symbol: "CROSS", price: "$0.89", change: "+8.2%" },
  { symbol: "ETH", price: "$2,341", change: "-2.1%" }
]

interface ChatSidebarProps {
  onSendMessage?: (message: string) => void
}

export function ChatSidebar({ onSendMessage }: ChatSidebarProps) {
  const [tweets, setTweets] = useState<Tweet[]>([])

  useEffect(() => {
    // Initialize Twitter feed manager
    const initialTweets = TwitterFeedManager.getTweets()
    setTweets(initialTweets)

    // Subscribe to real-time updates
    const unsubscribe = TwitterFeedManager.subscribe((newTweets) => {
      setTweets(newTweets)
    })

    return () => {
      unsubscribe()
      TwitterFeedManager.stopRealTimeSimulation()
    }
  }, [])

  return (
    <div className="w-80 border-r border-border/40 bg-card h-full overflow-y-auto overflow-x-hidden" style={{ paddingTop: '64px' }}>
      <div className="p-6 flex flex-col gap-6">
      {/* Wallet Section */}
      <WalletSection onSendMessage={onSendMessage} />

      {/* Quick Actions */}
      <Card className="p-4 bg-card">
      <div className="flex items-center gap-2">
          <Icon name="trending-up" size={20} className="text-primary" />
          <h3 className="font-semibold mb-1">Quick Actions</h3>
        </div>
        
        <WalletQuickActions onSendMessage={onSendMessage} />
        
      </Card>

      {/* Market Data */}
      <Card className="p-4 bg-card">
        <div className="flex items-center gap-2 mb-4">
          <Icon name="trending-up" size={20} className="text-primary" />
          <h3 className="font-semibold">Market Overview</h3>
        </div>
        <div className="space-y-3">
          {marketData.map((token) => (
            <div key={token.symbol} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <span className="font-medium">{token.symbol}</span>
              </div>
              <div className="text-right">
                <div className="font-medium">{token.price}</div>
                <Badge
                  variant={token.change.startsWith('+') ? 'default' : 'destructive'}
                  className="text-xs"
                >
                  {token.change}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Twitter Feed */}
      <Card className="flex-1 p-4 bg-card flex flex-col min-h-0">
        <div className="mb-4">
          <h3 className="font-semibold">Live Updates</h3>
        </div>
        <ScrollArea className="flex-1">
          <div className="space-y-4">
            {tweets.map((tweet) => (
              <div key={tweet.id} className="group">
                <div className="flex gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col gap-1 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm truncate">{tweet.author}</span>
                        <span className="text-muted-foreground text-xs">{tweet.handle}</span>
                      </div>
                      <span className="text-muted-foreground text-xs">
                        {tweet.time}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed group-hover:text-foreground transition-colors break-words">
                      {tweet.content}
                    </p>
                  </div>
                </div>
                <Separator className="mt-4" />
              </div>
            ))}
          </div>
        </ScrollArea>
      </Card>
      </div>
    </div>
  )
}