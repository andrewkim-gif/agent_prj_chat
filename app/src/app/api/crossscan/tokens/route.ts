import { NextResponse } from 'next/server'

interface CrossscanToken {
  address_hash: string
  name: string
  symbol: string
  type: string
  decimals: string | null
  total_supply: string | null
  holders_count: number
  reputation: string
  circulating_market_cap: string | null
  exchange_rate: string | null
  icon_url: string | null
  volume_24h: string | null
}

interface CrossscanResponse {
  items: CrossscanToken[]
  next_page_params: Record<string, unknown>
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = searchParams.get('limit') || '100'
    const offset = searchParams.get('offset') || '0'
    const network = searchParams.get('network') || 'mainnet'

    // Check if we need to use testnet API
    let baseUrl = 'https://www.crossscan.io/api/v2'

    if (network === 'testnet') {
      // Try testnet API endpoint - might be different subdomain or path
      console.log('Testnet requested - attempting testnet API')
      // Check if there's a testnet-specific API endpoint
      // Common patterns: test.crossscan.io, testnet.crossscan.io, crossscan.io/testnet
      baseUrl = 'https://testnet.crossscan.io/api/v2'  // Try testnet subdomain first
    }

    const crossscanUrl = `${baseUrl}/tokens?limit=${limit}&offset=${offset}`

    const response = await fetch(crossscanUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'ARA-Chat/1.0.0',
      },
    })

    if (!response.ok) {
      console.error(`Crossscan API error: ${response.status} ${response.statusText}`)
      return NextResponse.json(
        { error: 'Failed to fetch tokens from crossscan' },
        { status: response.status }
      )
    }

    const data: CrossscanResponse = await response.json()

    // Return the data with CORS headers
    return NextResponse.json(data, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    })
  } catch (error) {
    console.error('Error fetching crossscan tokens:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}