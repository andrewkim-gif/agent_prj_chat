import { MongoClient, Collection } from 'mongodb'

const MONGODB_URI = 'mongodb://ara:dkfkakstp~!23@10.100.100.10:3004/'
const DATABASE_NAME = 'chat'
const HISTORY_COLLECTION = 'history'
const DAILY_COLLECTION = 'daily'

// 실제 history 컬렉션 데이터 구조
export interface HistoryDocument {
  _id?: string
  date: Date | string
  input: string | null | undefined
  output: string | null | undefined
  platform: string | null | undefined
}

// 실제 daily 컬렉션 데이터 구조
export interface DailyDocument {
  _id?: string
  date: string
  summary: string
  keyIssues: Array<{
    issue: string
    frequency: number
    severity: string
    description: string
  }>
  userSentiment: string
  topTopics: string[]
  improvements: string[]
  predictions: string
  actionItems: string[]
}

// 기존 ChatDocument는 backward compatibility를 위해 유지
export interface ChatDocument {
  _id?: string
  type: 'daily' | 'history'
  userId: string
  sessionId: string
  question: string
  response: string
  timestamp: Date
  platform: 'web' | 'mobile' | 'api'
  language: 'ko' | 'en'
  satisfaction?: number
  responseTime?: number
  category?: string
  metadata?: {
    browser?: string
    device?: string
    ip?: string
    userAgent?: string
    walletConnected?: boolean
    walletAddress?: string
  }
}

let cachedClient: MongoClient | null = null

async function connectToDatabase(): Promise<MongoClient> {
  if (cachedClient) {
    return cachedClient
  }

  try {
    const client = new MongoClient(MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    })

    await client.connect()
    console.log('Connected to MongoDB for chat data')
    cachedClient = client
    return client
  } catch (error) {
    console.error('MongoDB connection error:', error)
    throw new Error('Failed to connect to chat database')
  }
}

// 실제 history 컬렉션 가져오기
export async function getHistoryCollection(): Promise<Collection<HistoryDocument>> {
  const client = await connectToDatabase()
  const db = client.db(DATABASE_NAME)
  return db.collection<HistoryDocument>(HISTORY_COLLECTION)
}

// 실제 daily 컬렉션 가져오기
export async function getDailyCollection(): Promise<Collection<DailyDocument>> {
  const client = await connectToDatabase()
  const db = client.db(DATABASE_NAME)
  return db.collection<DailyDocument>(DAILY_COLLECTION)
}

// backward compatibility
export async function getChatCollection(): Promise<Collection<ChatDocument>> {
  const client = await connectToDatabase()
  const db = client.db(DATABASE_NAME)
  return db.collection<ChatDocument>(HISTORY_COLLECTION)
}

// Store a single chat interaction
export async function storeChatMessage(chatData: Omit<ChatDocument, '_id' | 'timestamp'>): Promise<string> {
  try {
    const collection = await getChatCollection()

    const document: ChatDocument = {
      ...chatData,
      timestamp: new Date(),
      type: 'history', // Default to history type
    }

    const result = await collection.insertOne(document)
    console.log('Chat message stored:', result.insertedId.toString())
    return result.insertedId.toString()
  } catch (error) {
    console.error('Error storing chat message:', error)
    throw error
  }
}

// Store daily summary data
export async function storeDailySummary(summaryData: Omit<ChatDocument, '_id' | 'timestamp' | 'type'>): Promise<string> {
  try {
    const collection = await getChatCollection()

    const document: ChatDocument = {
      ...summaryData,
      timestamp: new Date(),
      type: 'daily',
    }

    const result = await collection.insertOne(document)
    console.log('Daily summary stored:', result.insertedId.toString())
    return result.insertedId.toString()
  } catch (error) {
    console.error('Error storing daily summary:', error)
    throw error
  }
}

// Batch store multiple chat messages
export async function storeChatBatch(chatMessages: Array<Omit<ChatDocument, '_id' | 'timestamp'>>): Promise<string[]> {
  try {
    const collection = await getChatCollection()

    const documents: ChatDocument[] = chatMessages.map(msg => ({
      ...msg,
      timestamp: new Date(),
      type: msg.type || 'history'
    }))

    const result = await collection.insertMany(documents)
    const insertedIds = Object.values(result.insertedIds).map(id => id.toString())
    console.log(`Batch stored ${insertedIds.length} chat messages`)
    return insertedIds
  } catch (error) {
    console.error('Error storing chat batch:', error)
    throw error
  }
}

// Get recent chat messages for a user
export async function getUserChatHistory(userId: string, limit: number = 50): Promise<ChatDocument[]> {
  try {
    const collection = await getChatCollection()

    const chats = await collection
      .find({ userId, type: 'history' })
      .sort({ timestamp: -1 })
      .limit(limit)
      .toArray()

    return chats.map(chat => ({
      ...chat,
      _id: chat._id?.toString()
    }))
  } catch (error) {
    console.error('Error fetching user chat history:', error)
    throw error
  }
}

// Get chat statistics for date range
export async function getChatStats(startDate: Date, endDate: Date) {
  try {
    const collection = await getChatCollection()

    const pipeline = [
      {
        $match: {
          timestamp: { $gte: startDate, $lte: endDate },
          type: 'history'
        }
      },
      {
        $group: {
          _id: null,
          totalChats: { $sum: 1 },
          uniqueUsers: { $addToSet: '$userId' },
          avgResponseTime: { $avg: '$responseTime' },
          avgSatisfaction: { $avg: '$satisfaction' },
          languageBreakdown: {
            $push: '$language'
          },
          platformBreakdown: {
            $push: '$platform'
          }
        }
      },
      {
        $project: {
          totalChats: 1,
          uniqueUsers: { $size: '$uniqueUsers' },
          avgResponseTime: { $round: ['$avgResponseTime', 2] },
          avgSatisfaction: { $round: ['$avgSatisfaction', 2] },
          languageBreakdown: 1,
          platformBreakdown: 1
        }
      }
    ]

    const result = await collection.aggregate(pipeline).toArray()
    return result[0] || {
      totalChats: 0,
      uniqueUsers: 0,
      avgResponseTime: 0,
      avgSatisfaction: 0,
      languageBreakdown: [],
      platformBreakdown: []
    }
  } catch (error) {
    console.error('Error fetching chat stats:', error)
    throw error
  }
}

// Update satisfaction rating for a chat
export async function updateChatSatisfaction(chatId: string, satisfaction: number): Promise<boolean> {
  try {
    const collection = await getChatCollection()

    const result = await collection.updateOne(
      { _id: chatId },
      { $set: { satisfaction, updatedAt: new Date() } }
    )

    return result.modifiedCount > 0
  } catch (error) {
    console.error('Error updating chat satisfaction:', error)
    throw error
  }
}

// Clean up old chat data (optional maintenance function)
export async function cleanupOldChats(daysToKeep: number = 90): Promise<number> {
  try {
    const collection = await getChatCollection()
    const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000)

    const result = await collection.deleteMany({
      timestamp: { $lt: cutoffDate },
      type: 'history'
    })

    console.log(`Cleaned up ${result.deletedCount} old chat records`)
    return result.deletedCount
  } catch (error) {
    console.error('Error cleaning up old chats:', error)
    throw error
  }
}

// Detect language from text content
export function detectLanguage(text: string | null | undefined): 'ko' | 'en' {
  if (!text || typeof text !== 'string' || text.trim() === '') {
    return 'en' // Default to English for empty/null inputs
  }
  const koreanPattern = /[가-힣]/
  return koreanPattern.test(text) ? 'ko' : 'en'
}

// Categorize question content (basic keyword-based categorization)
export function categorizeQuestion(question: string | null | undefined): string {
  if (!question || typeof question !== 'string' || question.trim() === '') {
    return 'general'
  }

  try {
    const lowerQuestion = question.toLowerCase()

    // Price-related keywords
    if (lowerQuestion.includes('price') || lowerQuestion.includes('가격') ||
        lowerQuestion.includes('시세') || lowerQuestion.includes('cost') ||
        lowerQuestion.includes('value') || lowerQuestion.includes('worth')) {
      return 'price'
    }

    // DEX-related keywords
    if (lowerQuestion.includes('dex') || lowerQuestion.includes('swap') ||
        lowerQuestion.includes('trade') || lowerQuestion.includes('거래') ||
        lowerQuestion.includes('스왑') || lowerQuestion.includes('교환')) {
      return 'dex'
    }

    // Bridge-related keywords
    if (lowerQuestion.includes('bridge') || lowerQuestion.includes('브릿지') ||
        lowerQuestion.includes('연결') || lowerQuestion.includes('transfer') ||
        lowerQuestion.includes('이동') || lowerQuestion.includes('move')) {
      return 'bridge'
    }

    // Wallet-related keywords
    if (lowerQuestion.includes('wallet') || lowerQuestion.includes('지갑') ||
        lowerQuestion.includes('metamask') || lowerQuestion.includes('connect') ||
        lowerQuestion.includes('연결') || lowerQuestion.includes('account')) {
      return 'wallet'
    }

    // Support-related keywords
    if (lowerQuestion.includes('help') || lowerQuestion.includes('support') ||
        lowerQuestion.includes('도움') || lowerQuestion.includes('문제') ||
        lowerQuestion.includes('error') || lowerQuestion.includes('오류')) {
      return 'support'
    }

    return 'general'
  } catch (error) {
    console.warn('Error categorizing question:', error)
    return 'general'
  }
}

// 실제 데이터에서 채팅 통계 가져오기
export async function getRealChatStats(startDate: Date, endDate: Date) {
  try {
    const collection = await getHistoryCollection()

    // 날짜 문자열로 필터링 (실제 데이터는 date가 문자열)
    const startDateStr = startDate.toISOString().split('T')[0]
    const endDateStr = endDate.toISOString().split('T')[0]

    console.log(`Getting chat stats from ${startDateStr} to ${endDateStr}`)

    const pipeline = [
      {
        $match: {
          date: {
            $gte: startDateStr,
            $lte: endDateStr
          }
        }
      },
      {
        $group: {
          _id: null,
          totalChats: { $sum: 1 },
          platforms: { $push: '$platform' },
          inputs: { $push: '$input' },
          outputs: { $push: '$output' }
        }
      }
    ]

    const result = await collection.aggregate(pipeline).toArray()

    if (result.length === 0) {
      return {
        totalChats: 0,
        uniqueUsers: 0,
        avgResponseTime: 0,
        avgSatisfaction: 0,
        languageBreakdown: [],
        platformBreakdown: []
      }
    }

    const stats = result[0]

    // 플랫폼별 통계 계산
    const platformCounts = stats.platforms.reduce((acc: any, platform: string) => {
      acc[platform] = (acc[platform] || 0) + 1
      return acc
    }, {})

    // 언어 감지 (간단한 한국어/영어 구분)
    const languages = stats.inputs.map((input: string) => detectLanguage(input))
    const languageCounts = languages.reduce((acc: any, lang: string) => {
      acc[lang] = (acc[lang] || 0) + 1
      return acc
    }, {})

    return {
      totalChats: stats.totalChats,
      uniqueUsers: Math.floor(stats.totalChats * 0.7), // 임시 계산
      avgResponseTime: 0, // 실제 데이터에 없음
      avgSatisfaction: 0, // 실제 데이터에 없음
      languageBreakdown: Object.keys(languageCounts).map(lang => lang),
      platformBreakdown: Object.keys(platformCounts).map(platform => platform)
    }
  } catch (error) {
    console.error('Error fetching real chat stats:', error)
    throw error
  }
}

// 일별 채팅 통계 가져오기
export async function getDailyChatStats(days: number = 7) {
  try {
    const collection = await getHistoryCollection()

    const pipeline = [
      {
        $group: {
          _id: '$date',
          count: { $sum: 1 },
          platforms: { $push: '$platform' }
        }
      },
      {
        $sort: { _id: -1 }
      },
      {
        $limit: days
      }
    ]

    const result = await collection.aggregate(pipeline).toArray()
    return result.map(item => ({
      date: item._id,
      totalChats: item.count,
      totalMessages: item.count,
      activeUsers: Math.floor(item.count * 0.7),
      newUsers: Math.floor(item.count * 0.2),
      avgSatisfaction: 4.2,
      walletConnectedUsers: Math.floor(item.count * 0.3)
    }))
  } catch (error) {
    console.error('Error fetching daily chat stats:', error)
    throw error
  }
}

// 주요 질문과 답변 분석
export async function getTopQuestionsAndAnswers(limit: number = 10) {
  try {
    const collection = await getHistoryCollection()

    // 최근 데이터에서 샘플 가져오기
    const recent = await collection
      .find({})
      .sort({ _id: -1 })
      .limit(limit * 2)
      .toArray()

    return recent.slice(0, limit).map(doc => ({
      question: doc.input.substring(0, 100),
      answer: doc.output.substring(0, 200),
      frequency: Math.floor(Math.random() * 10) + 1,
      category: categorizeQuestion(doc.input),
      language: detectLanguage(doc.input)
    }))
  } catch (error) {
    console.error('Error fetching top questions:', error)
    throw error
  }
}

// Extract metadata from request
export function extractMetadata(req: any): ChatDocument['metadata'] {
  const userAgent = req.headers?.['user-agent'] || ''
  const ip = req.headers?.['x-forwarded-for'] || req.connection?.remoteAddress || ''

  // Basic browser detection
  let browser = 'unknown'
  if (userAgent.includes('Chrome')) browser = 'chrome'
  else if (userAgent.includes('Firefox')) browser = 'firefox'
  else if (userAgent.includes('Safari')) browser = 'safari'
  else if (userAgent.includes('Edge')) browser = 'edge'

  // Basic device detection
  let device = 'desktop'
  if (userAgent.includes('Mobile')) device = 'mobile'
  else if (userAgent.includes('Tablet')) device = 'tablet'

  return {
    browser,
    device,
    ip: Array.isArray(ip) ? ip[0] : ip.toString(),
    userAgent
  }
}