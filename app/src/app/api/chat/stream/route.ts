import { NextRequest } from 'next/server'

const N8N_WEBHOOK_URL = 'https://tonexus.app.n8n.cloud/webhook/ara'

export async function POST(req: NextRequest) {
  try {
    const { message, messages = [], chatId, walletAddress } = await req.json()

    if (!message) {
      return new Response('Message is required', { status: 400 })
    }

    // Build conversation history (최대 5개 대화까지만)
    const recentMessages = messages.slice(-10) // 최대 10개 메시지 (5개 대화 = user + assistant)

    // 대화 히스토리를 String으로 묶기
    let historyString = ""
    if (recentMessages.length > 0) {
      const historyPairs: string[] = []

      for (let i = 0; i < recentMessages.length; i += 2) {
        const userMsg = recentMessages[i]
        const assistantMsg = recentMessages[i + 1]

        if (userMsg && assistantMsg) {
          historyPairs.push(`User: ${userMsg.content}\nARA: ${assistantMsg.content}`)
        } else if (userMsg) {
          historyPairs.push(`User: ${userMsg.content}`)
        }
      }

      // 최대 5개 대화까지만 포함
      historyString = historyPairs.slice(-5).join('\n\n')
    }

    // Build payload for n8n webhook
    const payload = {
      systemPrompt: "You are ARA, an intelligent AI assistant specialized in the CrossToken ecosystem. Always respond in English with helpful information about CrossToken services, DEX trading, bridge usage, token prices, and Web3 gaming platform.",
      history: historyString,
      currentMessage: message,
      chatId: chatId || Date.now().toString(),
      chatInput: message,
      walletAddress: walletAddress || null // Add wallet address if provided
    }


    // Create a streaming response that processes n8n chunks in real-time
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Call n8n webhook and process streaming response
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

          // Check if response is streaming
          const contentType = response.headers.get('Content-Type') || ''
          const isStreaming = contentType.includes('stream') ||
                             contentType.includes('text/plain') ||
                             response.headers.get('Transfer-Encoding') === 'chunked'

          if (isStreaming && response.body) {
            // Real-time streaming processing
            const reader = response.body.getReader()
            const decoder = new TextDecoder()
            let buffer = ''

            while (true) {
              const { done, value } = await reader.read()
              if (done) break

              const chunk = decoder.decode(value, { stream: true })
              buffer += chunk

              // Process complete JSON objects from buffer
              while (true) {
                const startIdx = buffer.indexOf('{')
                if (startIdx === -1) break

                // Find matching closing brace
                let braceCount = 0
                let endIdx = -1

                for (let i = startIdx; i < buffer.length; i++) {
                  if (buffer[i] === '{') braceCount++
                  else if (buffer[i] === '}') {
                    braceCount--
                    if (braceCount === 0) {
                      endIdx = i
                      break
                    }
                  }
                }

                if (endIdx === -1) break // Incomplete JSON, wait for more data

                // Extract and process the JSON chunk
                const jsonChunk = buffer.substring(startIdx, endIdx + 1)
                buffer = buffer.substring(endIdx + 1)

                try {
                  const jsonData = JSON.parse(jsonChunk)

                  // Skip metadata chunks
                  if (jsonData.type && ['begin', 'end', 'error', 'metadata'].includes(jsonData.type)) {
                    continue
                  }

                  // Extract content from item chunks
                  if (jsonData.type === 'item' && jsonData.content) {
                    const sseChunk = `data: ${JSON.stringify({
                      content: jsonData.content,
                      done: false
                    })}\n\n`
                    controller.enqueue(new TextEncoder().encode(sseChunk))
                  }
                } catch (parseError) {
                }
              }
            }
          } else {
            // Non-streaming response - parse and send as chunks
            const result = await response.text()
            const lines = result.split('\n').filter(line => line.trim())

            for (const line of lines) {
              try {
                const jsonData = JSON.parse(line)

                if (jsonData.type === 'item' && jsonData.content) {
                  const chunk = `data: ${JSON.stringify({
                    content: jsonData.content,
                    done: false
                  })}\n\n`
                  controller.enqueue(new TextEncoder().encode(chunk))

                  // Add delay for visual effect
                  await new Promise(resolve => setTimeout(resolve, 50))
                }
              } catch (parseError) {
                // Handle plain text
                if (line.trim() && !line.startsWith('{')) {
                  const chunk = `data: ${JSON.stringify({
                    content: line.trim(),
                    done: false
                  })}\n\n`
                  controller.enqueue(new TextEncoder().encode(chunk))
                }
              }
            }
          }

          // Send completion signal
          const doneChunk = `data: ${JSON.stringify({ done: true })}\n\n`
          controller.enqueue(new TextEncoder().encode(doneChunk))
          controller.close()
        } catch (error) {
          // Stream error occurred

          // Send error message
          const errorChunk = `data: ${JSON.stringify({
            content: 'I apologize for the temporary error. Please try again with your CrossToken-related question! 🤖',
            done: false
          })}\n\n`
          controller.enqueue(new TextEncoder().encode(errorChunk))

          const doneChunk = `data: ${JSON.stringify({ done: true })}\n\n`
          controller.enqueue(new TextEncoder().encode(doneChunk))
          controller.close()
        }
      }
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (error) {
    // Chat API error occurred
    return new Response(
      JSON.stringify({ error: 'I apologize for the temporary error. Please try again with your CrossToken-related question! 🤖' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}