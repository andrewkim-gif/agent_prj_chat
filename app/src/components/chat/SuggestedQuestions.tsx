"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Icon } from "@/components/ui/icon"
import { ScrollAnimated } from "@/components/ui/ScrollAnimated"

interface Question {
  question: string
}

interface SuggestedQuestionsProps {
  onQuestionClick: (question: string) => void
  className?: string
}

// 미리 정의된 질문들 (20개)
const PREDEFINED_QUESTIONS = [
  "What are the latest prices and market trends for CrossToken?",
  "What is the current status and performance of the Cross mainnet?",
  "Please tell me about the key features of the CrossToken ecosystem",
  "How do I bridge tokens using CrossToken's cross-chain technology?",
  "What are the benefits of using CrossToken DEX?",
  "How can I stake my tokens on the CrossToken platform?",
  "What are the gas fees like on the Cross mainnet?",
  "How secure is the CrossToken blockchain network?",
  "What partnerships does CrossToken have with other projects?",
  "How do I participate in CrossToken governance?",
  "What are the tokenomics of the CrossToken ecosystem?",
  "How can I earn rewards through CrossToken's DeFi protocols?",
  "What wallets are compatible with CrossToken?",
  "How do I provide liquidity on CrossToken DEX?",
  "What are the upcoming developments for CrossToken?",
  "How does CrossToken's interoperability work?",
  "What are the advantages of Cross mainnet over other blockchains?",
  "How can I track my portfolio using CrossToken tools?",
  "What gaming opportunities are available in the CrossToken ecosystem?",
  "How do I get started with CrossToken for beginners?"
]

export function SuggestedQuestions({ onQuestionClick, className = "" }: SuggestedQuestionsProps) {
  const [questions, setQuestions] = useState<Question[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    generateRandomQuestions()
  }, [])

  const generateRandomQuestions = () => {
    setIsLoading(true)

    // 20개 질문 중에서 랜덤으로 3개 선택
    const shuffled = [...PREDEFINED_QUESTIONS].sort(() => 0.5 - Math.random())
    const selectedQuestions = shuffled.slice(0, 3).map(question => ({ question }))

    // 약간의 로딩 시간을 두어 자연스럽게 보이도록 함
    setTimeout(() => {
      setQuestions(selectedQuestions)
      setIsLoading(false)
    }, 300)
  }

  if (isLoading) {
    return (
      <div className={`flex flex-col gap-3 ${className}`}>
        <div className="text-sm text-muted-foreground">Loading suggestions...</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-10 bg-muted animate-pulse rounded-lg"
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      <div className="text-sm text-muted-foreground font-medium flex items-center gap-2">
        <Icon name="click" size={16} />
        Click on the suggested questions
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        {questions.map((item, index) => (
          <ScrollAnimated
            key={index}
            animation="fade-up"
            delay={(index * 100) as 100 | 200 | 300 | 400 | 500}
            threshold={0.1}
          >
            <Button
              variant="outline"
              className="w-full h-auto py-2 px-4 text-left justify-start bg-card hover:bg-accent hover:text-accent-foreground border-border text-sm leading-tight whitespace-normal cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-md"
              onClick={() => onQuestionClick(item.question)}
            >
              {item.question}
            </Button>
          </ScrollAnimated>
        ))}
      </div>
    </div>
  )
}