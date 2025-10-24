import { NextRequest, NextResponse } from 'next/server'
import { collectChatData, collectSatisfaction, chatDataCollector } from '@/services/chatDataCollector'

// POST /api/chat/collect - Collect chat interaction data
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, data } = body

    switch (type) {
      case 'interaction': {
        const {
          userId,
          sessionId,
          userMessage,
          botResponse,
          platform = 'web',
          responseTime,
          walletConnected,
          walletAddress
        } = data

        // Validate required fields
        if (!userId || !sessionId || !userMessage || !botResponse) {
          return NextResponse.json(
            {
              success: false,
              error: 'Missing required fields: userId, sessionId, userMessage, botResponse'
            },
            { status: 400 }
          )
        }

        const chatId = await collectChatData(
          userId,
          sessionId,
          userMessage,
          botResponse,
          {
            platform,
            responseTime,
            walletConnected,
            walletAddress,
            request
          }
        )

        return NextResponse.json({
          success: true,
          chatId,
          message: 'Chat interaction collected successfully'
        })
      }

      case 'satisfaction': {
        const { chatId, rating } = data

        // Validate required fields
        if (!chatId || typeof rating !== 'number') {
          return NextResponse.json(
            {
              success: false,
              error: 'Missing required fields: chatId, rating'
            },
            { status: 400 }
          )
        }

        // Validate rating range
        if (rating < 1 || rating > 5) {
          return NextResponse.json(
            {
              success: false,
              error: 'Rating must be between 1 and 5'
            },
            { status: 400 }
          )
        }

        const success = await collectSatisfaction(chatId, rating)

        return NextResponse.json({
          success,
          message: success ? 'Satisfaction rating collected successfully' : 'Failed to update satisfaction rating'
        })
      }

      case 'batch-flush': {
        // Force flush any pending batch data
        await chatDataCollector.forceBatchFlush()

        return NextResponse.json({
          success: true,
          message: 'Batch data flushed successfully'
        })
      }

      default:
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid type. Must be "interaction", "satisfaction", or "batch-flush"'
          },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Chat collection API error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// GET /api/chat/collect - Get collection status and stats
export async function GET() {
  try {
    const stats = chatDataCollector.getCollectionStats()

    return NextResponse.json({
      success: true,
      stats,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Chat collection status API error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get collection stats',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// PUT /api/chat/collect - Update collection settings
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { enabled } = body

    if (typeof enabled !== 'boolean') {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid enabled value. Must be boolean'
        },
        { status: 400 }
      )
    }

    chatDataCollector.setEnabled(enabled)

    return NextResponse.json({
      success: true,
      message: `Chat data collection ${enabled ? 'enabled' : 'disabled'}`,
      stats: chatDataCollector.getCollectionStats()
    })
  } catch (error) {
    console.error('Chat collection settings API error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update collection settings',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}