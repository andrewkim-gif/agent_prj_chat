// Simple vector search implementation for CrossToken knowledge base
import { crossTokenKnowledge } from './crosstoken-knowledge'

interface SearchResult {
  content: string
  score: number
  category: string
}

export class VectorSearch {
  private static documents: Array<{
    content: string
    category: string
    keywords: string[]
  }> = []

  static initialize() {
    // Flatten knowledge base into searchable documents
    this.documents = []

    // Add services
    Object.entries(crossTokenKnowledge.services).forEach(([key, service]) => {
      this.documents.push({
        content: `${service.name}: ${service.description}. Features: ${service.features.join(', ')}`,
        category: 'services',
        keywords: [key, service.name, ...service.features]
      })
    })

    // Add tokenomics
    Object.entries(crossTokenKnowledge.tokenomics).forEach(([symbol, token]) => {
      this.documents.push({
        content: `${symbol} (${token.type}): ${token.description}. Uses: ${token.utilities.join(', ')}`,
        category: 'tokens',
        keywords: [symbol, token.type, ...token.utilities]
      })
    })

    // Add trading guides
    Object.entries(crossTokenKnowledge.tradingGuide).forEach(([key, guide]) => {
      this.documents.push({
        content: `${key} guide: ${guide.join(' → ')}`,
        category: 'guides',
        keywords: [key, 'guide', 'how to', 'steps']
      })
    })

    // Add FAQ
    Object.entries(crossTokenKnowledge.faq).forEach(([question, answer]) => {
      this.documents.push({
        content: `Q: ${question} A: ${answer}`,
        category: 'faq',
        keywords: question.split(' ').concat(answer.split(' '))
      })
    })
  }

  static search(query: string, limit: number = 5): SearchResult[] {
    if (this.documents.length === 0) {
      this.initialize()
    }

    const queryWords = query.toLowerCase().split(' ')
    const results: SearchResult[] = []

    this.documents.forEach(doc => {
      let score = 0

      // Check content match
      queryWords.forEach(word => {
        if (doc.content.toLowerCase().includes(word)) {
          score += 2
        }
      })

      // Check keyword match
      queryWords.forEach(word => {
        doc.keywords.forEach(keyword => {
          if (keyword.toLowerCase().includes(word)) {
            score += 3
          }
        })
      })

      // Exact phrase match
      if (doc.content.toLowerCase().includes(query.toLowerCase())) {
        score += 5
      }

      if (score > 0) {
        results.push({
          content: doc.content,
          score,
          category: doc.category
        })
      }
    })

    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
  }

  static getRelevantContext(query: string): string {
    const results = this.search(query, 3)

    if (results.length === 0) {
      return 'No specific knowledge found for this query.'
    }

    return results
      .map(result => `[${result.category.toUpperCase()}] ${result.content}`)
      .join('\n\n')
  }

  static suggestQuestions(query: string): string[] {
    const suggestions: string[] = []

    const lowerQuery = query.toLowerCase()

    if (lowerQuery.includes('price') || lowerQuery.includes('token')) {
      suggestions.push('BNGO 토큰의 현재 가격은?')
      suggestions.push('CROSS 토큰의 용도는 무엇인가요?')
    }

    if (lowerQuery.includes('trade') || lowerQuery.includes('거래')) {
      suggestions.push('DEX에서 토큰 거래하는 방법')
      suggestions.push('주문 타입별 차이점은?')
    }

    if (lowerQuery.includes('bridge') || lowerQuery.includes('브릿지')) {
      suggestions.push('크로스체인 브릿지 사용법')
      suggestions.push('브릿지 수수료는 얼마인가요?')
    }

    if (suggestions.length === 0) {
      suggestions.push('CROSSx 플랫폼이란?')
      suggestions.push('어떤 서비스를 제공하나요?')
      suggestions.push('지갑 연결 방법은?')
    }

    return suggestions.slice(0, 3)
  }
}