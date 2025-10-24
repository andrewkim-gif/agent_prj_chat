import { NextRequest, NextResponse } from 'next/server'

const N8N_WEBHOOK_URL = 'https://tonexus.app.n8n.cloud/webhook/ara'

export async function POST(req: NextRequest) {
  try {
    const { message, messages = [], chatId, walletAddress } = await req.json()

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // Build conversation history
    const conversationHistory = messages.map((msg: { type: string; content: string }) => ({
      role: msg.type === 'user' ? 'user' : 'assistant',
      content: msg.content
    }))

    // Add current message to history
    conversationHistory.push({
      role: 'user',
      content: message
    })

    // Build payload for n8n webhook
    const payload = {
      systemPrompt: "",
      messages: conversationHistory,
      currentMessage: message,
      chatId: chatId || Date.now().toString(),
      chatInput: message, // for backward compatibility
      walletAddress: walletAddress || null // Add wallet address if provided
    }


    // Call n8n webhook
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`N8N webhook failed: ${response.status} - ${errorText}`)
    }

    const result = await response.text()

    // Parse streaming JSON response from n8n
    let responseText = ''
    const lines = result.split('\n').filter(line => line.trim())

    for (const line of lines) {
      try {
        const jsonData = JSON.parse(line)
        if (jsonData.type === 'item' && jsonData.content) {
          responseText += jsonData.content
        }
      } catch (parseError) {
        // If not JSON, append the line as is
        responseText += line
      }
    }

    // Fallback: if no content was extracted, use the full result
    if (!responseText.trim()) {
      responseText = result
    }

    return NextResponse.json({ response: responseText.trim() })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'I apologize for the temporary error. Please try again with your CrossToken-related question! 🤖' },
      { status: 500 }
    )
  }
}

// Demo response generator for when API key is not configured
async function generateDemoResponse(message: string): Promise<string> {
  const lowerMessage = message.toLowerCase()

  if (lowerMessage.includes('price') || lowerMessage.includes('bngo') || lowerMessage.includes('cross')) {
    return `📊 **현재 토큰 가격 정보**

🪙 **BNGO**: $2.45 (+12.5%)
🔷 **CROSS**: $0.89 (+8.2%)
💎 **ETH**: $2,341 (-2.1%)

최근 24시간 동안 게임 토큰들이 강세를 보이고 있습니다! 더 자세한 분석이 필요하시면 말씀해 주세요. 📈`
  }

  if (lowerMessage.includes('bridge') || lowerMessage.includes('브릿지')) {
    return `🌉 **CROSS Bridge 사용 가이드**

1. Bridge 섹션으로 이동
2. 출발/도착 체인 선택
3. 브릿지할 토큰과 수량 입력
4. 수수료 확인 후 거래 승인
5. 도착 체인에서 토큰 확인

CROSS Bridge는 안전하고 빠른 크로스체인 자산 이동을 제공합니다! 🚀`
  }

  if (lowerMessage.includes('dex') || lowerMessage.includes('거래') || lowerMessage.includes('trading')) {
    return `💹 **CROSS GameToken DEX 특징**

🎮 **게임 토큰 전문 거래소**
- Market/Limit 주문 지원
- 실시간 가격 추적
- 낮은 거래 수수료
- Order book 기능

📱 **사용법**:
1. DEX 섹션 접속
2. 토큰 페어 선택
3. 주문 타입 및 수량 입력
4. 거래 실행

게임 생태계에 특화된 최고의 거래 경험을 제공합니다! 🎯`
  }

  if (lowerMessage.includes('crosstoken') || lowerMessage.includes('crossx') || lowerMessage.includes('소개')) {
    return `🌟 **CROSSx 소개**

CROSSx는 CROSS 블록체인 생태계의 **올인원 Web3 슈퍼 앱**입니다!

🎮 **주요 특징**:
- 게임 중심 Web3 서비스
- 직관적인 사용자 인터페이스
- 멀티체인 생태계 지원
- 개발자 친화적 SDK/API

🛠️ **핵심 서비스**:
- DEX: 게임 토큰 거래
- Bridge: 크로스체인 자산 이동
- Wallet: 다중 지갑 지원

게임과 DeFi가 만나는 혁신적인 플랫폼입니다! ✨`
  }

  // Default response
  return `안녕하세요! 저는 ARA, CrossToken 생태계 전문 어시스턴트입니다! 🤖

다음과 같은 도움을 드릴 수 있어요:

💰 **토큰 정보**: 현재 가격, 시장 동향
🔄 **DEX 거래**: 게임 토큰 거래 가이드
🌉 **브릿지**: 크로스체인 자산 이동
📱 **서비스 안내**: CROSSx 플랫폼 사용법

"${message}"에 대해 더 구체적으로 질문해 주시면 자세히 설명드리겠습니다!

*참고: 현재는 데모 모드로 실행 중이며, 실제 AI 연동을 위해서는 OpenAI API 키 설정이 필요합니다.*`
}