import { NextRequest, NextResponse } from 'next/server'
import { getHistoryCollection, detectLanguage, categorizeQuestion, HistoryDocument } from '@/lib/mongodb-chat'
import { ChatConversation } from '@/types/chat-insight'

// Get specific conversations for a time slot
async function getConversationsByTimeSlot(
  dayName: string,
  hour: number,
  startDateStr: string,
  endDateStr: string
): Promise<ChatConversation[]> {
  const historyCollection = await getHistoryCollection()

  // Convert date strings to Date objects for proper comparison
  const startDate = new Date(startDateStr + 'T00:00:00.000Z')
  const endDate = new Date(endDateStr + 'T23:59:59.999Z')

  console.log('Getting conversations for time slot:', {
    dayName,
    hour,
    startDateStr,
    endDateStr,
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString()
  })

  // Query MongoDB for conversations in the date range
  const data = await historyCollection
    .find({
      date: {
        $gte: startDate,
        $lte: endDate
      }
    })
    .sort({ date: -1 })
    .limit(10000) // Increased limit to match heatmap data processing
    .toArray()

  console.log('Total conversations found in date range:', data.length)

  // Filter conversations by day and hour
  const dayIndex = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(dayName)

  const filteredConversations = data
    .filter(chat => {
      if (!chat || !chat.date || !chat.input || !chat.output) return false

      try {
        const chatDate = new Date(chat.date)
        const chatDayOfWeek = chatDate.getDay() // 0=Sunday, 6=Saturday
        const chatHour = chatDate.getHours()

        return chatDayOfWeek === dayIndex && chatHour === hour
      } catch (error) {
        console.warn('Error filtering conversation by time:', error)
        return false
      }
    })
    .slice(0, 50) // Limit to 50 conversations per time slot
    .map(chat => {
      try {
        return {
          id: chat._id?.toString() || Math.random().toString(),
          userId: `user_${Math.random().toString(36).substr(2, 9)}`,
          question: chat.input || '',
          response: chat.output || '',
          timestamp: new Date(chat.date),
          platform: (chat.platform === 'extension' ? 'extension' :
                    chat.platform === 'crossx' ? 'crossx' : 'web') as 'web' | 'mobile' | 'api' | 'extension' | 'crossx',
          language: detectLanguage(chat.input || '') as 'ko' | 'en',
          satisfaction: 4 + Math.random(), // Mock satisfaction 4-5
          responseTime: 2 + Math.random() * 2, // Mock response time 2-4s
          category: categorizeQuestion(chat.input || '') as 'price' | 'dex' | 'bridge' | 'wallet' | 'general' | 'support'
        }
      } catch (error) {
        console.warn('Error processing conversation:', error)
        return {
          id: chat._id?.toString() || Math.random().toString(),
          userId: `user_${Math.random().toString(36).substr(2, 9)}`,
          question: chat.input || '',
          response: chat.output || '',
          timestamp: new Date(chat.date),
          platform: 'web' as const,
          language: 'en' as const,
          satisfaction: 4.0,
          responseTime: 2.5,
          category: 'general' as const
        }
      }
    })

  console.log('Filtered conversations for', dayName, 'at', hour + ':00:', filteredConversations.length)

  return filteredConversations
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const dayName = searchParams.get('day') // 'Mon', 'Tue', etc.
    const hour = searchParams.get('hour') // '0', '1', '2', ... '23'
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    if (!dayName || !hour || !startDate || !endDate) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required parameters: day, hour, startDate, endDate'
        },
        { status: 400 }
      )
    }

    const hourNum = parseInt(hour, 10)
    if (isNaN(hourNum) || hourNum < 0 || hourNum > 23) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid hour parameter. Must be 0-23'
        },
        { status: 400 }
      )
    }

    const validDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    if (!validDays.includes(dayName)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid day parameter. Must be one of: ' + validDays.join(', ')
        },
        { status: 400 }
      )
    }

    const conversations = await getConversationsByTimeSlot(dayName, hourNum, startDate, endDate)

    return NextResponse.json({
      success: true,
      data: {
        conversations,
        timeSlot: {
          day: dayName,
          hour: hourNum,
          count: conversations.length
        },
        meta: {
          totalFound: conversations.length,
          dateRange: `${startDate} to ${endDate}`,
          queryTime: new Date().toISOString()
        }
      }
    })

  } catch (error) {
    console.error('Chat conversations API error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch conversations',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}