import { NextRequest, NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'

const uri = 'mongodb://ara:dkfkakstp~!23@10.100.100.10:3004/test?authSource=admin'

export async function GET() {
  const client = new MongoClient(uri)

  try {
    await client.connect()
    const db = client.db('trend')
    const collection = db.collection('da')

    // 1. 실제 데이터 샘플 10개
    const sampleData = await collection.find({}).limit(10).toArray()

    // 2. 채널별 통계
    const channelStats = await collection.aggregate([
      {
        $group: {
          _id: '$channel',
          videoCount: { $sum: 1 },
          avgSentiment: { $avg: '$sentiment' },
          avgHarm: { $avg: '$harm' },
          latestVideo: { $max: '$createdat' },
          firstVideo: { $min: '$createdat' }
        }
      },
      { $sort: { videoCount: -1 } },
      { $limit: 10 }
    ]).toArray()

    // 3. 지역별 트렌드 (최근 7일)
    const recentDate = new Date()
    recentDate.setDate(recentDate.getDate() - 7)
    const regionTrends = await collection.aggregate([
      {
        $match: {
          createdat: { $gte: recentDate.toISOString() }
        }
      },
      {
        $group: {
          _id: '$location',
          videoCount: { $sum: 1 },
          avgSentiment: { $avg: '$sentiment' },
          avgHarm: { $avg: '$harm' },
          channels: { $addToSet: '$channel' }
        }
      },
      { $sort: { videoCount: -1 } }
    ]).toArray()

    // 4. 감정 점수 분포
    const sentimentDistribution = await collection.aggregate([
      {
        $bucket: {
          groupBy: '$sentiment',
          boundaries: [0, 0.2, 0.4, 0.6, 0.8, 1.0],
          default: 'Other',
          output: {
            count: { $sum: 1 },
            avgHarm: { $avg: '$harm' }
          }
        }
      }
    ]).toArray()

    // 5. 시간대별 업로드 패턴
    const timePatterns = await collection.aggregate([
      {
        $project: {
          hour: { $hour: { $dateFromString: { dateString: '$createdat' } } },
          location: 1,
          sentiment: 1
        }
      },
      {
        $group: {
          _id: '$hour',
          uploadCount: { $sum: 1 },
          avgSentiment: { $avg: '$sentiment' }
        }
      },
      { $sort: { _id: 1 } }
    ]).toArray()

    // 6. 제목 키워드 분석 (Rohan 관련)
    const titleAnalysis = await collection.aggregate([
      {
        $match: {
          title: { $regex: /rohan/i }
        }
      },
      {
        $group: {
          _id: '$location',
          rohanVideos: { $sum: 1 },
          avgSentiment: { $avg: '$sentiment' },
          sampleTitles: { $push: { $substr: ['$title', 0, 50] } }
        }
      },
      { $sort: { rohanVideos: -1 } }
    ]).toArray()

    return NextResponse.json({
      success: true,
      analysis: {
        totalVideos: await collection.countDocuments({}),
        sampleData: sampleData.map(doc => ({
          title: doc.title?.substring(0, 60),
          channel: doc.channel,
          location: doc.location,
          createdat: doc.createdat,
          sentiment: doc.sentiment,
          harm: doc.harm,
          isscript: doc.isscript
        })),
        channelStats,
        regionTrends,
        sentimentDistribution,
        timePatterns,
        titleAnalysis
      }
    })

  } catch (error) {
    console.error('Real data analysis error:', error)
    return NextResponse.json(
      { success: false, error: 'Analysis failed' },
      { status: 500 }
    )
  } finally {
    await client.close()
  }
}