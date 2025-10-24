import { NextRequest, NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'

const uri = 'mongodb://ara:dkfkakstp~!23@10.100.100.10:3004/test?authSource=admin'

export async function GET(request: NextRequest) {
  const client = new MongoClient(uri)

  try {
    await client.connect()
    const db = client.db('trend')
    const collection = db.collection('da')

    const searchParams = request.nextUrl.searchParams;
    const startDateStr = searchParams.get('startDate');
    const endDateStr = searchParams.get('endDate');

    let matchQuery: any = {}

    if (startDateStr && endDateStr) {
      // Try string comparison since DB stores dates as strings
      matchQuery.createdat = {
        $gte: startDateStr,
        $lte: endDateStr
      }
    }

    // First, check if we have matching documents
    const matchingCount = await collection.countDocuments(matchQuery)

    // Sample a few documents to see their structure
    const sampleDocs = await collection.find(matchQuery).limit(3).toArray()

    // Try the aggregation
    const aggregationResult = await collection.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          totalVideos: { $sum: 1 },
          uniqueChannels: { $addToSet: '$channel' },
          avgSentiment: { $avg: '$sentiment' },
          avgHarm: { $avg: '$harm' },
          scriptsAvailable: { $sum: { $cond: ['$isscript', 1, 0] } },
          locations: { $addToSet: '$location' }
        }
      },
      {
        $project: {
          totalVideos: 1,
          totalChannels: { $size: '$uniqueChannels' },
          avgSentiment: { $round: ['$avgSentiment', 2] },
          harmContentPercentage: { $round: [{ $multiply: ['$avgHarm', 100] }, 1] },
          scriptsAvailable: 1,
          topLocations: '$locations'
        }
      }
    ]).toArray()

    return NextResponse.json({
      success: true,
      data: {
        matchQuery,
        matchingCount,
        sampleDocs: sampleDocs.map(doc => ({
          _id: doc._id,
          title: doc.title?.substring(0, 50),
          channel: doc.channel,
          location: doc.location,
          createdat: doc.createdat,
          sentiment: doc.sentiment,
          harm: doc.harm,
          isscript: doc.isscript
        })),
        aggregationResult,
        resultLength: aggregationResult.length
      }
    })

  } catch (error) {
    console.error('Debug metrics error:', error)
    return NextResponse.json(
      { success: false, error: 'Debug failed' },
      { status: 500 }
    )
  } finally {
    await client.close()
  }
}