import { NextRequest, NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'

const uri = 'mongodb://ara:dkfkakstp~!23@10.100.100.10:3004/test?authSource=admin'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { date, recipients, format = 'html' } = body

    // 날짜 설정 (기본값: 오늘)
    const reportDate = date ? new Date(date) : new Date()
    const reportDateStr = reportDate.toISOString().split('T')[0]

    const client = new MongoClient(uri)

    try {
      await client.connect()
      const db = client.db('trend')
      const collection = db.collection('da')

      // 1. 전체 통계 수집
      const totalVideos = await collection.countDocuments({})
      const totalChannels = (await collection.distinct('channel')).length

      // 2. 언어별 통계
      const languageStats = await collection.aggregate([
        {
          $group: {
            _id: { $ifNull: ['$lang', '$location'] },
            videoCount: { $sum: 1 },
            avgSentiment: { $avg: '$sentiment' },
            avgHarm: { $avg: '$harm' }
          }
        },
        { $sort: { videoCount: -1 } }
      ]).toArray()

      // 3. 상위 채널 통계
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
        { $limit: 5 }
      ]).toArray()

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

      // 5. AI 인사이트 생성
      const insights = generateInsights({
        totalVideos,
        totalChannels,
        languageStats,
        topChannels,
        recentWeek: recentWeek[0],
        previousWeek: previousWeek[0]
      })

      // 6. 요약 생성
      const summary = generateSummary(insights, languageStats)

      const reportData = {
        date: reportDateStr,
        totalVideos,
        totalChannels,
        languageStats: languageStats.map(r => ({
          language: r._id,
          videoCount: r.videoCount,
          avgSentiment: Math.round(r.avgSentiment * 100),
          avgHarm: Math.round(r.avgHarm * 100)
        })),
        topChannels: topChannels.map(c => ({
          name: c._id,
          videoCount: c.videoCount,
          avgSentiment: Math.round(c.avgSentiment * 100)
        })),
        trends: calculateTrends(recentWeek[0], previousWeek[0]),
        insights,
        summary
      }

      // n8n에서 사용할 수 있는 형태로 응답
      return NextResponse.json({
        success: true,
        data: {
          report: reportData,
          html: format === 'html' ? generateHTMLReport(reportData) : null,
          recipients: recipients || [],
          metadata: {
            generatedAt: new Date().toISOString(),
            format: format,
            reportDate: reportDateStr
          }
        }
      })

    } catch (error) {
      console.error('Daily report generation error:', error)
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to generate daily report',
          message: error instanceof Error ? error.message : 'Unknown error'
        },
        { status: 500 }
      )
    } finally {
      await client.close()
    }

  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Invalid request body',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 400 }
    )
  }
}

// GET 요청도 지원 (간단한 테스트용)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const date = searchParams.get('date')
  const format = searchParams.get('format') || 'html'

  return POST(new NextRequest(request.url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ date, format })
  }))
}

function generateInsights(data: any): any[] {
  const insights = []

  // 1. 언어 집중도 분석
  const topLanguage = data.languageStats[0]
  if (topLanguage) {
    const languageDominance = (topLanguage.videoCount / data.totalVideos) * 100

    if (languageDominance > 70) {
      insights.push({
        id: 'language-dominance',
        type: 'trend',
        priority: 'high',
        title: `${topLanguage._id} 언어가 전체 콘텐츠의 ${Math.round(languageDominance)}% 점유`,
        description: `${topLanguage._id} 언어의 압도적인 콘텐츠 생산량이 전체 플랫폼 트렌드를 주도하고 있습니다.`,
        confidence: 95,
        supportingData: [
          { metric: `${topLanguage._id} 비디오`, value: `${topLanguage.videoCount}개` },
          { metric: '감정점수', value: `${Math.round(topLanguage.avgSentiment * 100)}%` },
          { metric: '언어 점유율', value: `${Math.round(languageDominance)}%` }
        ],
        timestamp: new Date().toISOString()
      })
    }
  }

  // 2. 유해 콘텐츠 경고
  const highHarmLanguages = data.languageStats.filter((r: any) => r.avgHarm > 0.05)
  if (highHarmLanguages.length > 0) {
    const language = highHarmLanguages[0]
    insights.push({
      id: 'harm-alert',
      type: 'alert',
      priority: 'medium',
      title: `${language._id} 언어 유해 콘텐츠 증가 감지`,
      description: `${language._id} 언어에서 평균 대비 유해 콘텐츠 비율이 상승했습니다.`,
      confidence: 82,
      supportingData: [
        { metric: '유해 콘텐츠 비율', value: `${Math.round(language.avgHarm * 100)}%` },
        { metric: '영향 비디오', value: `${language.videoCount}개` }
      ],
      timestamp: new Date().toISOString()
    })
  }

  // 3. 채널 집중도 분석
  const topChannelShare = (data.topChannels.slice(0, 3).reduce((sum: number, c: any) => sum + c.videoCount, 0) / data.totalVideos) * 100

  if (topChannelShare > 40) {
    insights.push({
      id: 'channel-concentration',
      type: 'trend',
      priority: 'medium',
      title: `상위 3개 채널이 전체 콘텐츠의 ${Math.round(topChannelShare)}% 점유`,
      description: '소수의 채널이 플랫폼 콘텐츠를 지배하고 있어 다양성 확보가 필요합니다.',
      confidence: 88,
      supportingData: [
        { metric: '상위 3개 채널 점유율', value: `${Math.round(topChannelShare)}%` },
        { metric: '전체 활성 채널', value: `${data.totalChannels}개` }
      ],
      timestamp: new Date().toISOString()
    })
  }

  // 4. 트렌드 분석
  if (data.recentWeek && data.previousWeek) {
    const videoGrowth = ((data.recentWeek.count - data.previousWeek.count) / data.previousWeek.count) * 100
    
    if (Math.abs(videoGrowth) > 10) {
      insights.push({
        id: 'video-growth-trend',
        type: 'trend',
        priority: videoGrowth > 0 ? 'high' : 'medium',
        title: `최근 7일간 비디오 업로드 ${videoGrowth > 0 ? '증가' : '감소'} ${Math.round(Math.abs(videoGrowth))}%`,
        description: `콘텐츠 생산량이 ${videoGrowth > 0 ? '크게 증가' : '감소'}하고 있어 ${videoGrowth > 0 ? '플랫폼 활성도가 상승' : '관리가 필요'}합니다.`,
        confidence: 90,
        supportingData: [
          { metric: '최근 7일', value: `${data.recentWeek.count}개` },
          { metric: '이전 7일', value: `${data.previousWeek.count}개` },
          { metric: '변화율', value: `${Math.round(videoGrowth)}%` }
        ],
        timestamp: new Date().toISOString()
      })
    }
  }

  return insights
}

function calculateTrends(recent: any, previous: any): Array<{metric: string, change: number, timeframe: string}> {
  if (!recent || !previous) return []

  const videoChange = ((recent.count - previous.count) / previous.count) * 100
  const sentimentChange = recent.avgSentiment - previous.avgSentiment
  const harmChange = recent.avgHarm - previous.avgHarm

  return [
    { metric: '비디오 수', change: Math.round(videoChange * 10) / 10, timeframe: '7일간' },
    { metric: '평균 감정점수', change: Math.round(sentimentChange * 100) / 100, timeframe: '7일간' },
    { metric: '유해 콘텐츠 비율', change: Math.round(harmChange * 1000) / 10, timeframe: '7일간' }
  ]
}

function generateSummary(insights: any[], languageStats: any[]): {
  keyFindings: string[]
  recommendations: string[]
  overallSentiment: string
} {
  const keyFindings: string[] = []
  const recommendations: string[] = []

  // 주요 발견사항
  if (insights.length > 0) {
    keyFindings.push(`총 ${insights.length}개의 주요 인사이트가 발견되었습니다.`)
    
    const highPriorityInsights = insights.filter(i => i.priority === 'high')
    if (highPriorityInsights.length > 0) {
      keyFindings.push(`높은 우선순위 인사이트 ${highPriorityInsights.length}개가 있습니다.`)
    }
  }

  // 전체 감정 분석
  const avgSentiment = languageStats.reduce((sum, r) => sum + r.avgSentiment, 0) / languageStats.length
  let overallSentiment = '중립'
  if (avgSentiment > 0.6) overallSentiment = '긍정적'
  else if (avgSentiment < 0.4) overallSentiment = '부정적'

  keyFindings.push(`전체 플랫폼 감정은 ${overallSentiment}입니다.`)

  // 추천사항
  const highHarmLanguages = languageStats.filter(r => r.avgHarm > 0.05)
  if (highHarmLanguages.length > 0) {
    recommendations.push('유해 콘텐츠 비율이 높은 언어에 대한 모니터링을 강화하세요.')
  }

  const topLanguage = languageStats[0]
  if (topLanguage && (topLanguage.videoCount / languageStats.reduce((sum, r) => sum + r.videoCount, 0)) > 0.7) {
    recommendations.push('언어 다양성 확보를 위한 정책을 검토하세요.')
  }

  if (insights.some(i => i.type === 'alert')) {
    recommendations.push('경고 인사이트에 대한 즉시 조치가 필요합니다.')
  }

  return {
    keyFindings,
    recommendations,
    overallSentiment
  }
}

function generateHTMLReport(data: any): string {
  return `
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ara Insight 데일리 리포트 - ${data.date}</title>
    <style>
        :root {
            --background: 255 255 255;
            --foreground: 10 10 10;
            --primary: 23 23 23;
            --primary-foreground: 250 250 250;
            --secondary: 245 245 245;
            --secondary-foreground: 23 23 23;
            --muted: 245 245 245;
            --muted-foreground: 115 115 115;
            --accent: 245 245 245;
            --accent-foreground: 23 23 23;
            --border: 229 229 229;
            --input: 229 229 229;
            --ring: 23 23 23;
            --destructive: 255 51 51;
            --destructive-foreground: 255 255 255;
            --card: 255 255 255;
            --card-foreground: 10 10 10;
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: ui-sans-serif, system-ui, -apple-system, "system-ui", "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif;
            line-height: 1.6;
            color: rgb(var(--foreground));
            background-color: rgb(var(--background));
            font-size: 14px;
        }
        
        .container {
            max-width: 1024px;
            margin: 0 auto;
            padding: 0 1rem;
        }
        
        /* Header Section - Ara Insight Style */
        .header {
            background: linear-gradient(135deg, rgb(var(--primary)) 0%, rgb(var(--primary) / 0.9) 100%);
            color: rgb(var(--primary-foreground));
            padding: 2rem 1.5rem;
            border-radius: 0.75rem 0.75rem 0 0;
            position: relative;
            overflow: hidden;
        }
        
        .header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.05) 50%, transparent 70%);
            animation: shimmer 4s infinite;
        }
        
        @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
        }
        
        .header-content {
            position: relative;
            z-index: 1;
            text-align: center;
        }
        
        .header h1 {
            font-size: 2rem;
            font-weight: 700;
            margin-bottom: 0.5rem;
            letter-spacing: -0.025em;
        }
        
        .header .subtitle {
            font-size: 1rem;
            opacity: 0.9;
            margin-bottom: 0.5rem;
            font-weight: 500;
        }
        
        .header .date {
            font-size: 0.875rem;
            opacity: 0.8;
            font-weight: 400;
        }
        
        /* Content Sections */
        .content {
            background: rgb(var(--background));
            border-radius: 0 0 0.75rem 0.75rem;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        
        .section {
            padding: 1.5rem;
            border-bottom: 1px solid rgb(var(--border) / 0.4);
        }
        
        .section:last-child {
            border-bottom: none;
        }
        
        .section h2 {
            font-size: 1.25rem;
            font-weight: 600;
            color: rgb(var(--foreground));
            margin-bottom: 1rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        
        .section h3 {
            font-size: 1rem;
            font-weight: 600;
            color: rgb(var(--foreground));
            margin-bottom: 0.75rem;
        }
        
        /* ARA Chat Message Style */
        .ara-message {
            background: rgb(var(--card));
            border: 1px solid rgb(var(--border));
            border-radius: 0.75rem;
            padding: 1rem;
            margin-bottom: 1.5rem;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        
        .ara-message-header {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            margin-bottom: 0.75rem;
        }
        
        .ara-avatar {
            width: 2.5rem;
            height: 2.5rem;
            border-radius: 50%;
            background: rgb(var(--secondary));
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            color: rgb(var(--primary));
            font-size: 1rem;
        }
        
        .ara-info {
            flex: 1;
        }
        
        .ara-name {
            font-size: 0.875rem;
            font-weight: 600;
            color: rgb(var(--foreground));
        }
        
        .ara-date {
            font-size: 0.75rem;
            color: rgb(var(--muted-foreground));
        }
        
        .ara-message-content {
            background: rgb(var(--muted) / 0.5);
            border: 1px solid rgb(var(--border));
            border-radius: 0.5rem;
            padding: 0.75rem 1rem;
            margin-left: 3.25rem;
        }
        
        .ara-message-text {
            font-size: 0.875rem;
            color: rgb(var(--foreground));
            line-height: 1.5;
            font-weight: 500;
        }
        
        /* Metrics Grid - Ara Style */
        .metrics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
            margin-bottom: 1.5rem;
        }
        
        .metric-card {
            background: rgb(var(--card));
            border: 1px solid rgb(var(--border));
            border-radius: 0.5rem;
            padding: 1.25rem;
            transition: all 0.2s ease;
        }
        
        .metric-card:hover {
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        
        .metric-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 0.75rem;
        }
        
        .metric-title {
            font-size: 0.875rem;
            font-weight: 500;
            color: rgb(var(--muted-foreground));
        }
        
        .metric-icon {
            width: 2rem;
            height: 2rem;
            border-radius: 0.5rem;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1rem;
        }
        
        .metric-icon.blue {
            background: rgb(59 130 246 / 0.1);
            color: rgb(59 130 246);
        }
        
        .metric-icon.green {
            background: rgb(34 197 94 / 0.1);
            color: rgb(34 197 94);
        }
        
        .metric-icon.purple {
            background: rgb(147 51 234 / 0.1);
            color: rgb(147 51 234);
        }
        
        .metric-icon.orange {
            background: rgb(249 115 22 / 0.1);
            color: rgb(249 115 22);
        }
        
        .metric-value {
            font-size: 1.5rem;
            font-weight: 700;
            color: rgb(var(--foreground));
            margin-bottom: 0.25rem;
        }
        
        .metric-trend {
            display: flex;
            align-items: center;
            gap: 0.25rem;
            font-size: 0.75rem;
        }
        
        .metric-trend.positive {
            color: rgb(34 197 94);
        }
        
        .metric-trend.negative {
            color: rgb(var(--destructive));
        }
        
        /* Insight Cards - Ara Style */
        .insights-grid {
            display: grid;
            gap: 1rem;
            margin-bottom: 1.5rem;
        }
        
        .insight-card {
            background: rgb(var(--card));
            border: 1px solid rgb(var(--border));
            border-left: 3px solid rgb(var(--primary));
            border-radius: 0.5rem;
            padding: 1.25rem;
            transition: all 0.2s ease;
        }
        
        .insight-card:hover {
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        
        .insight-card.alert {
            border-left-color: rgb(var(--destructive));
            background: linear-gradient(135deg, rgb(255 245 245) 0%, rgb(var(--card)) 100%);
        }
        
        .insight-card.high {
            border-left-color: rgb(249 115 22);
            background: linear-gradient(135deg, rgb(255 251 235) 0%, rgb(var(--card)) 100%);
        }
        
        .insight-card.medium {
            border-left-color: rgb(59 130 246);
            background: linear-gradient(135deg, rgb(239 246 255) 0%, rgb(var(--card)) 100%);
        }
        
        .insight-title {
            font-weight: 600;
            color: rgb(var(--foreground));
            margin-bottom: 0.5rem;
            font-size: 0.875rem;
        }
        
        .insight-description {
            color: rgb(var(--muted-foreground));
            margin-bottom: 0.75rem;
            line-height: 1.5;
            font-size: 0.875rem;
        }
        
        .insight-data {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
        }
        
        .data-item {
            background: rgb(var(--muted));
            color: rgb(var(--muted-foreground));
            padding: 0.25rem 0.5rem;
            border-radius: 0.375rem;
            font-size: 0.75rem;
            font-weight: 500;
        }
        
        .confidence-badge {
            background: rgb(var(--primary));
            color: rgb(var(--primary-foreground));
            padding: 0.25rem 0.5rem;
            border-radius: 0.375rem;
            font-size: 0.75rem;
            font-weight: 600;
        }
        
        /* Tables - Ara Style */
        .table-container {
            overflow-x: auto;
            border-radius: 0.5rem;
            border: 1px solid rgb(var(--border));
        }
        
        .table {
            width: 100%;
            border-collapse: collapse;
            background: rgb(var(--card));
        }
        
        .table th {
            background: rgb(var(--muted));
            color: rgb(var(--foreground));
            font-weight: 600;
            padding: 0.75rem;
            text-align: left;
            border-bottom: 1px solid rgb(var(--border));
            font-size: 0.875rem;
        }
        
        .table td {
            padding: 0.75rem;
            border-bottom: 1px solid rgb(var(--border) / 0.5);
            color: rgb(var(--foreground));
            font-size: 0.875rem;
        }
        
        .table tr:hover {
            background: rgb(var(--muted) / 0.5);
        }
        
        .table tr:last-child td {
            border-bottom: none;
        }
        
        /* Trend Indicators */
        .trend-positive {
            color: rgb(34 197 94);
            font-weight: 600;
        }
        
        .trend-negative {
            color: rgb(var(--destructive));
            font-weight: 600;
        }
        
        .trend-neutral {
            color: rgb(var(--muted-foreground));
            font-weight: 500;
        }
        
        /* Summary Boxes - Ara Style */
        .summary-box {
            background: rgb(var(--card));
            border: 1px solid rgb(var(--border));
            border-radius: 0.5rem;
            padding: 1.25rem;
            margin-bottom: 1rem;
        }
        
        .summary-box.warning {
            border-left: 3px solid rgb(249 115 22);
            background: linear-gradient(135deg, rgb(255 251 235) 0%, rgb(var(--card)) 100%);
        }
        
        .summary-box.danger {
            border-left: 3px solid rgb(var(--destructive));
            background: linear-gradient(135deg, rgb(255 245 245) 0%, rgb(var(--card)) 100%);
        }
        
        .summary-box h3 {
            color: rgb(var(--foreground));
            margin-top: 0;
            margin-bottom: 0.75rem;
            font-size: 0.875rem;
            font-weight: 600;
        }
        
        .summary-list {
            margin: 0;
            padding-left: 1rem;
        }
        
        .summary-list li {
            margin-bottom: 0.5rem;
            line-height: 1.5;
            font-size: 0.875rem;
        }
        
        /* Daily Summary Section */
        .daily-summary {
            background: rgb(var(--card));
            border: 1px solid rgb(var(--border));
            border-radius: 0.5rem;
            padding: 1.25rem;
            margin-bottom: 1.5rem;
        }
        
        .summary-header {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            margin-bottom: 1rem;
        }
        
        .summary-title {
            font-size: 1rem;
            font-weight: 600;
            color: rgb(var(--foreground));
        }
        
        .summary-divider {
            flex: 1;
            height: 1px;
            background: rgb(var(--border));
        }
        
        .summary-date {
            font-size: 0.75rem;
            color: rgb(var(--muted-foreground));
        }
        
        .summary-content {
            padding-left: 1.75rem;
        }
        
        .summary-text {
            font-size: 0.875rem;
            color: rgb(var(--foreground));
            line-height: 1.5;
        }
        
        /* Footer */
        .footer {
            background: rgb(var(--primary));
            color: rgb(var(--primary-foreground));
            padding: 1.5rem;
            text-align: center;
            border-radius: 0 0 0.75rem 0.75rem;
        }
        
        .footer p {
            margin-bottom: 0.5rem;
            opacity: 0.9;
            font-size: 0.875rem;
        }
        
        .footer .timestamp {
            font-size: 0.75rem;
            opacity: 0.7;
        }
        
        /* Responsive Design */
        @media (max-width: 768px) {
            .container {
                padding: 0 0.5rem;
            }
            
            .header {
                padding: 1.5rem 1rem;
            }
            
            .header h1 {
                font-size: 1.5rem;
            }
            
            .section {
                padding: 1rem;
            }
            
            .metrics-grid {
                grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                gap: 0.75rem;
            }
            
            .ara-message-content {
                margin-left: 0;
                margin-top: 0.75rem;
            }
        }
        
        /* Print Styles */
        @media print {
            .section {
                break-inside: avoid;
                page-break-inside: avoid;
            }
            
            .metric-card, .insight-card {
                break-inside: avoid;
                page-break-inside: avoid;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <div class="header-content">
                <h1>ARA Insight</h1>
                <div class="subtitle">Daily Report</div>
                <div class="date">${data.date}</div>
            </div>
        </div>
        
        <div class="content">
            <!-- ARA Chat Message -->
            <div class="section">
                <div class="ara-message">
                    <div class="ara-message-header">
                        <div class="ara-avatar">ARA</div>
                        <div class="ara-info">
                            <div class="ara-name">ARA</div>
                            <div class="ara-date">${new Date(data.date).toLocaleDateString('ko-KR')}</div>
                        </div>
                    </div>
                    <div class="ara-message-content">
                        <div class="ara-message-text">
                            안녕하세요! ${data.date}의 Ara Insight 데일리 리포트를 분석해드리겠습니다. 
                            총 ${data.totalVideos.toLocaleString()}개의 비디오와 ${data.totalChannels.toLocaleString()}개의 활성 채널을 분석한 결과, 
                            ${data.insights.length}개의 주요 인사이트를 발견했습니다. 
                            ${data.summary.overallSentiment}한 감정 상태를 보이고 있으며, 
                            ${data.languageStats.length}개 언어의 다양한 콘텐츠가 분석되었습니다.
                        </div>
                    </div>
                </div>
            </div>

            <!-- Daily Summary -->
            <div class="section">
                <div class="daily-summary">
                    <div class="summary-header">
                        <h3 class="summary-title">Daily Summary</h3>
                        <div class="summary-divider"></div>
                        <span class="summary-date">${new Date(data.date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}</span>
                    </div>
                    <div class="summary-content">
                        <p class="summary-text">
                            ${data.summary.keyFindings.join(' ')} 
                            ${data.summary.recommendations.length > 0 ? '추가로 ' + data.summary.recommendations.slice(0, 2).join(', ') + ' 등의 조치가 필요합니다.' : ''}
                        </p>
                    </div>
                </div>
            </div>

            <!-- Key Metrics -->
            <div class="section">
                <h2>📊 Key Metrics</h2>
                <div class="metrics-grid">
                    <div class="metric-card">
                        <div class="metric-header">
                            <span class="metric-title">Total Videos</span>
                            <div class="metric-icon blue">📹</div>
                        </div>
                        <div class="metric-value">${data.totalVideos.toLocaleString()}</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-header">
                            <span class="metric-title">Active Channels</span>
                            <div class="metric-icon green">👥</div>
                        </div>
                        <div class="metric-value">${data.totalChannels.toLocaleString()}</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-header">
                            <span class="metric-title">Avg Sentiment</span>
                            <div class="metric-icon purple">❤️</div>
                        </div>
                        <div class="metric-value">${Math.round(data.languageStats.reduce((sum, stat) => sum + stat.avgSentiment, 0) / data.languageStats.length)}%</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-header">
                            <span class="metric-title">Harmful Content</span>
                            <div class="metric-icon orange">🛡️</div>
                        </div>
                        <div class="metric-value">${Math.round(data.languageStats.reduce((sum, stat) => sum + stat.avgHarm, 0) / data.languageStats.length)}%</div>
                    </div>
                </div>
            </div>

            <!-- AI Insights -->
            <div class="section">
                <h2>🤖 AI Insights</h2>
                <div class="insights-grid">
                    ${data.insights.map(insight => `
                        <div class="insight-card ${insight.priority}">
                            <div class="insight-title">${insight.title}</div>
                            <div class="insight-description">${insight.description}</div>
                            <div class="insight-data">
                                ${insight.supportingData.map(data => `
                                    <div class="data-item">
                                        <strong>${data.metric}:</strong> ${data.value}
                                    </div>
                                `).join('')}
                                <div class="confidence-badge">
                                    신뢰도: ${insight.confidence}%
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <!-- Language Analysis -->
            <div class="section">
                <h2>🌍 Language Analysis</h2>
                <div class="table-container">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Language</th>
                                <th>Videos</th>
                                <th>Share</th>
                                <th>Sentiment</th>
                                <th>Harm Rate</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${data.languageStats.map((stat, index) => {
                                const percentage = ((stat.videoCount / data.totalVideos) * 100).toFixed(1);
                                const status = stat.avgHarm > 5 ? '⚠️ Warning' : stat.avgSentiment > 70 ? '✅ Good' : '📊 Normal';
                                return `
                                    <tr>
                                        <td><strong>${stat.language}</strong></td>
                                        <td>${stat.videoCount.toLocaleString()}</td>
                                        <td>${percentage}%</td>
                                        <td>${stat.avgSentiment}%</td>
                                        <td>${stat.avgHarm}%</td>
                                        <td>${status}</td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Top Channels -->
            <div class="section">
                <h2>🏆 Top Channels</h2>
                <div class="table-container">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Rank</th>
                                <th>Channel</th>
                                <th>Videos</th>
                                <th>Share</th>
                                <th>Sentiment</th>
                                <th>Grade</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${data.topChannels.map((channel, index) => {
                                const percentage = ((channel.videoCount / data.totalVideos) * 100).toFixed(1);
                                const grade = channel.avgSentiment > 80 ? '🥇 Excellent' : channel.avgSentiment > 60 ? '🥈 Good' : '🥉 Normal';
                                return `
                                    <tr>
                                        <td><strong>#${index + 1}</strong></td>
                                        <td>${channel.name}</td>
                                        <td>${channel.videoCount.toLocaleString()}</td>
                                        <td>${percentage}%</td>
                                        <td>${channel.avgSentiment}%</td>
                                        <td>${grade}</td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Trend Analysis -->
            <div class="section">
                <h2>📈 7-Day Trends</h2>
                <div class="table-container">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Metric</th>
                                <th>Change</th>
                                <th>Period</th>
                                <th>Analysis</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${data.trends.map(trend => {
                                const analysis = trend.change > 10 ? '📈 Surge' : 
                                               trend.change > 0 ? '📊 Rise' : 
                                               trend.change < -10 ? '📉 Drop' : 
                                               trend.change < 0 ? '📊 Fall' : '➡️ Stable';
                                const trendClass = trend.change > 0 ? 'trend-positive' : 
                                                 trend.change < 0 ? 'trend-negative' : 'trend-neutral';
                                return `
                                    <tr>
                                        <td><strong>${trend.metric}</strong></td>
                                        <td class="${trendClass}">
                                            ${trend.change >= 0 ? '+' : ''}${trend.change}%
                                        </td>
                                        <td>${trend.timeframe}</td>
                                        <td>${analysis}</td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Summary & Recommendations -->
            <div class="section">
                <h2>📋 Summary & Recommendations</h2>
                
                <div class="summary-box">
                    <h3>🔍 Key Findings</h3>
                    <ul class="summary-list">
                        ${data.summary.keyFindings.map(finding => `<li>${finding}</li>`).join('')}
                    </ul>
                </div>
                
                ${data.summary.recommendations.length > 0 ? `
                <div class="summary-box ${data.summary.recommendations.some(rec => rec.includes('경고') || rec.includes('즉시')) ? 'danger' : 'warning'}">
                    <h3>💡 Recommendations</h3>
                    <ul class="summary-list">
                        ${data.summary.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                    </ul>
                </div>
                ` : ''}
                
                <div class="summary-box">
                    <h3>🎯 Platform Performance</h3>
                    <ul class="summary-list">
                        <li><strong>Overall Sentiment:</strong> ${data.summary.overallSentiment}</li>
                        <li><strong>Data Quality:</strong> ${data.totalVideos > 1000 ? 'Excellent' : 'Good'}</li>
                        <li><strong>Language Diversity:</strong> ${data.languageStats.length > 10 ? 'High' : 'Normal'}</li>
                        <li><strong>AI Analysis:</strong> ${data.insights.length > 0 ? 'Active' : 'Standby'}</li>
                    </ul>
                </div>
            </div>
        </div>

        <div class="footer">
            <p><strong>Ara Insight AI System</strong> - Automated Daily Report</p>
            <p>Comprehensive analysis of platform performance and insights</p>
            <div class="timestamp">Generated: ${new Date().toLocaleString('ko-KR')}</div>
        </div>
    </div>
</body>
</html>
  `
}
