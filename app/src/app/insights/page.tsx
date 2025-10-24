"use client"

import { AIInsightMain } from '@/components/ai-insight/AIInsightMain'
import { useRouter } from 'next/navigation'

export default function InsightsPage() {
  const router = useRouter()

  const handleClose = () => {
    router.push('/')
  }

  return <AIInsightMain onClose={handleClose} isModal={false} />
}