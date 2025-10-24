"use client"

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Icon } from "@/components/ui/icon"
import { RiveARALogo } from "@/components/ui/RiveARALogo"
import { NetworkSelector } from "@/components/network/NetworkSelector"

interface ChatHeaderProps {
  isOnline?: boolean
  isTyping?: boolean
  onRefresh?: () => void
  onExit?: () => void
}

export function ChatHeader({ isOnline = true, isTyping = false, onRefresh, onExit }: ChatHeaderProps) {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 w-full border-b border-border/20 py-3 px-4 bg-background/80 backdrop-blur-md shadow-sm h-16" style={{
      boxShadow: '0 1px 2px oklch(0 0 0 / 0.05)'
    }}>
      <div className="flex items-center justify-between w-full px-6">
        {/* Left: Logo */}

        {/* Center: Chat Status */}
        <div
          className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={onExit}
          title="Exit chat"
        >
          <Avatar className="w-8 h-8">
            <AvatarImage src="/ara.png" alt="ARA" />
            <AvatarFallback>
              <Icon name="robot" size={16} />
            </AvatarFallback>
          </Avatar>

          <div className="flex items-center gap-2">
            <h2 className="font-semibold">
              {isTyping ? "ARA is thinking..." : "ARA"}
            </h2>
            <Badge variant={isOnline ? "secondary" : "outline"}>
              <Icon
                name={isOnline ? "sparkles" : "clock-two"}
                size={12}
                className="mr-1"
              />
              {isOnline ? "Online" : "Offline"}
            </Badge>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Network Selector */}
          <NetworkSelector variant="compact" showTestnets={true} />

          {/* Refresh button */}
          {onRefresh && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRefresh}
              title="Start new conversation"
            >
              <Icon name="refresh" size={16} />
            </Button>
          )}

          {/* Exit button */}
          {onExit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onExit}
              title="Exit chat"
            >
              <Icon name="x" size={16} />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}