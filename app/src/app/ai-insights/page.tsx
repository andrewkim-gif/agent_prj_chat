"use client"

import { AIInsightMain } from "@/components/ai-insight/AIInsightMain"

export default function AIInsightsPage() {
  return (
    <div className="min-h-screen bg-background">
      <AIInsightMain isModal={false} />
    </div>
  )
}