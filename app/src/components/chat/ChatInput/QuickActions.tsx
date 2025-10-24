"use client"

import { Button } from "@/components/ui/button"

interface QuickActionsProps {
  actions: string[]
  onActionClick: (action: string) => void
  showActions?: boolean
}

export function QuickActions({ actions, onActionClick, showActions = true }: QuickActionsProps) {
  if (!showActions) return null

  return (
    <div className="p-4 border-t border-border">
      <div className="max-w-4xl mx-auto">
        <p className="text-sm text-muted-foreground mb-3">Quick questions to get started:</p>
        <div className="flex flex-wrap gap-2">
          {actions.map((action) => (
            <Button
              key={action}
              variant="outline"
              size="sm"
              onClick={() => onActionClick(action)}
              className="hover-lift"
            >
              {action}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}