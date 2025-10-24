import { NextRequest, NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'

const uri = 'mongodb://ara:dkfkakstp~!23@10.100.100.10:3004/test?authSource=admin'

interface AnalysisData {
  totalVideos: number
  languages: string[]
  avgSentiment: number
  harmRate: number
  totalActiveChannels: number
  languageStats: Array<{
    language: string
    videoCount: number
    avgSentiment: number
    avgHarm: number
  }>
  trends: Array<{
    metric: string
    change: number
    timeframe: string
  }>
  topChannels: Array<{
    name: string
    videoCount: number
    avgSentiment: number
  }>
}

export async function POST() {
  const client = new MongoClient(uri)

  try {
    await client.connect()
    const db = client.db('trend')
    const collection = db.collection('da')

    // 1. 전체 통계 수집
    const totalVideos = await collection.countDocuments({})

    // 2. 언어별 통계
    const languageStats = await collection.aggregate([
      {
        $group: {
          _id: { $ifNull: ['$lang', '$location'] }, // lang 필드를 우선 사용하고, 없으면 location 사용 (마이그레이션 중 호환성)
          videoCount: { $sum: 1 },
          avgSentiment: { $avg: '$sentiment' },
          avgHarm: { $avg: '$harm' }
        }
      },
      { $sort: { videoCount: -1 } }
    ]).toArray()

    // 3. 상위 채널 통계 및 전체 활성 채널 수
    const topChannels = await collection.aggregate([
      {
        $group: {
          _id: '$channel',
          videoCount: { $sum: 1 },
          avgSentiment: { $avg: '$sentiment' },
          avgHarm: { $avg: '$harm' }
        }
      },
      { $sort: { videoCount: -1 } },
      { $limit: 10 }
    ]).toArray()

    // 전체 고유 채널 수 계산 (상위 10개가 아닌 모든 채널)
    const totalActiveChannels = await collection.distinct('channel')

    // 4. 최근 7일 vs 이전 7일 트렌드 비교
    const now = new Date()
    const week1Start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const week2Start = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)

    const recentWeek = await collection.aggregate([
      {
        $match: {
          createdat: { $gte: week1Start.toISOString() }
        }
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          avgSentiment: { $avg: '$sentiment' },
          avgHarm: { $avg: '$harm' }
        }
      }
    ]).toArray()

    const previousWeek = await collection.aggregate([
      {
        $match: {
          createdat: {
            $gte: week2Start.toISOString(),
            $lt: week1Start.toISOString()
          }
        }
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          avgSentiment: { $avg: '$sentiment' },
          avgHarm: { $avg: '$harm' }
        }
      }
    ]).toArray()

    // 5. 데이터 구조화
    const analysisData: AnalysisData = {
      totalVideos,
      languages: languageStats.map(r => r._id),
      avgSentiment: languageStats.reduce((sum, r) => sum + r.avgSentiment, 0) / languageStats.length,
      harmRate: languageStats.reduce((sum, r) => sum + r.avgHarm, 0) / languageStats.length * 100,
      totalActiveChannels: totalActiveChannels.length, // 실제 활성 채널 수
      languageStats: languageStats.map(r => ({
        language: r._id,
        videoCount: r.videoCount,
        avgSentiment: Math.round(r.avgSentiment * 100),
        avgHarm: Math.round(r.avgHarm * 100)
      })),
      trends: calculateTrends(recentWeek[0], previousWeek[0]),
      topChannels: topChannels.slice(0, 5).map(c => ({
        name: c._id,
        videoCount: c.videoCount,
        avgSentiment: Math.round(c.avgSentiment * 100)
      }))
    }

    // 6. AI 인사이트 생성
    const insights = await generateInsights(analysisData)

    return NextResponse.json({
      success: true,
      insights,
      metadata: {
        analysisTimestamp: new Date().toISOString(),
        dataPoints: totalVideos,
        languagesAnalyzed: languageStats.length
      }
    })

  } catch (error) {
    console.error('AI insights generation error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate insights',
        insights: getFallbackInsights()
      },
      { status: 500 }
    )
  } finally {
    await client.close()
  }
}

function calculateTrends(recent: any, previous: any) {
  if (!recent || !previous) return []

  const volumeChange = ((recent.count - previous.count) / previous.count) * 100
  const sentimentChange = ((recent.avgSentiment - previous.avgSentiment) / previous.avgSentiment) * 100
  const harmChange = ((recent.avgHarm - previous.avgHarm) / previous.avgHarm) * 100

  return [
    { metric: '콘텐츠 볼륨', change: Math.round(volumeChange * 10) / 10, timeframe: '7일간' },
    { metric: '감정 점수', change: Math.round(sentimentChange * 10) / 10, timeframe: '7일간' },
    { metric: '유해 콘텐츠', change: Math.round(harmChange * 10) / 10, timeframe: '7일간' }
  ]
}

async function generateInsights(data: AnalysisData) {
  // 실제 환경에서는 OpenAI/Claude API 호출
  // 현재는 룰 기반 인사이트 생성

  const insights = []

  // 1. 언어 집중도 분석
  const topLanguage = data.languageStats[0]
  const languageDominance = (topLanguage.videoCount / data.totalVideos) * 100

  if (languageDominance > 70) {
    insights.push({
      id: 'language-dominance',
      type: 'trend',
      priority: 'high',
      title: `${topLanguage.language} 언어가 전체 콘텐츠의 ${Math.round(languageDominance)}% 점유`,
      description: `${topLanguage.language} 언어의 압도적인 콘텐츠 생산량이 전체 플랫폼 트렌드를 주도하고 있습니다.`,
      confidence: 95,
      supportingData: [
        { metric: `${topLanguage.language} 비디오`, value: `${topLanguage.videoCount}개` },
        { metric: '감정점수', value: `${topLanguage.avgSentiment}%` },
        { metric: '언어 점유율', value: `${Math.round(languageDominance)}%` }
      ],
      timestamp: new Date().toISOString()
    })
  }

  // 2. 유해 콘텐츠 경고
  const highHarmLanguages = data.languageStats.filter(r => r.avgHarm > 5)
  if (highHarmLanguages.length > 0) {
    const language = highHarmLanguages[0]
    insights.push({
      id: 'harm-alert',
      type: 'alert',
      priority: 'medium',
      title: `${language.language} 언어 유해 콘텐츠 증가 감지`,
      description: `${language.language} 언어에서 평균 대비 유해 콘텐츠 비율이 상승했습니다.`,
      confidence: 82,
      supportingData: [
        { metric: '유해 콘텐츠 비율', value: `${language.avgHarm}%` },
        { metric: '영향 비디오', value: `${language.videoCount}개` }
      ],
      timestamp: new Date().toISOString()
    })
  }

  // 3. 채널 집중도 분석
  const topChannelShare = (data.topChannels.slice(0, 3).reduce((sum, c) => sum + c.videoCount, 0) / data.totalVideos) * 100

  if (topChannelShare > 40) {
    insights.push({
      id: 'channel-concentration',
      type: 'opportunity',
      priority: 'medium',
      title: `상위 3개 채널이 전체 트래픽의 ${Math.round(topChannelShare)}% 생성`,
      description: `총 ${data.totalActiveChannels}개 채널 중 핵심 채널들의 의존도가 높아 채널 다양성 증진이 필요합니다.`,
      confidence: 88,
      supportingData: [
        { metric: '상위 채널 점유율', value: `${Math.round(topChannelShare)}%` },
        { metric: '전체 활성 채널', value: `${data.totalActiveChannels}개` },
        { metric: '주요 채널', value: data.topChannels[0].name }
      ],
      timestamp: new Date().toISOString()
    })
  }

  // 4. 전반적 품질 점수
  const avgSentiment = Math.round(data.avgSentiment * 100)
  insights.push({
    id: 'quality-summary',
    type: 'summary',
    priority: 'low',
    title: `전체 콘텐츠 감정 점수 ${avgSentiment}% 유지`,
    description: `플랫폼 전반의 콘텐츠 품질이 양호한 수준을 유지하고 있습니다.`,
    confidence: 92,
    supportingData: [
      { metric: '평균 감정점수', value: `${avgSentiment}%` },
      { metric: '분석 비디오', value: `${data.totalVideos}개` }
    ],
    timestamp: new Date().toISOString()
  })

  return insights
}

function getFallbackInsights() {
  return [
    {
      id: 'fallback-1',
      type: 'summary',
      priority: 'low',
      title: 'AI 분석 시스템 준비 중',
      description: '실시간 데이터 분석을 위해 시스템을 준비하고 있습니다.',
      confidence: 90,
      supportingData: [
        { metric: '상태', value: '준비중' }
      ],
      timestamp: new Date().toISOString()
    }
  ]
}