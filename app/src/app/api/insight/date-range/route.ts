import { NextRequest, NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'

const uri = 'mongodb://ara:dkfkakstp~!23@10.100.100.10:3004/test?authSource=admin'

export async function GET() {
  const client = new MongoClient(uri)

  try {
    await client.connect()
    const db = client.db('trend')
    const collection = db.collection('da')

    // Get oldest and newest dates
    const oldest = await collection.findOne({}, {
      sort: { createdat: 1 },
      projection: { createdat: 1, _id: 0 }
    })

    const newest = await collection.findOne({}, {
      sort: { createdat: -1 },
      projection: { createdat: 1, _id: 0 }
    })

    // Count total videos to confirm
    const count = await collection.countDocuments({})

    return NextResponse.json({
      success: true,
      data: {
        oldest: oldest?.createdat,
        newest: newest?.createdat,
        totalVideos: count
      }
    })

  } catch (error) {
    console.error('Date range query error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch date range' },
      { status: 500 }
    )
  } finally {
    await client.close()
  }
}