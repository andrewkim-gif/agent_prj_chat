import { MongoClient } from 'mongodb'

const uri = 'mongodb://ara:dkfkakstp~!23@10.100.100.10:3004/test?authSource=admin'

export interface DailyReportData {
  date: string
  totalVideos: number
  totalChannels: number
  languageStats: Array<{
    language: string
    videoCount: number
    avgSentiment: number
    avgHarm: number
  }>
  topChannels: Array<{
    name: string
    videoCount: number
    avgSentiment: number
  }>
  trends: Array<{
    metric: string
    change: number
    timeframe: string
  }>
  insights: Array<{
    id: string
    type: string
    priority: string
    title: string
    description: string
    confidence: number
    supportingData: Array<{
      metric: string
      value: string
    }>
    timestamp: string
  }>
  summary: {
    keyFindings: string[]
    recommendations: string[]
    overallSentiment: string
  }
}

export class DailyReportService {
  private client: MongoClient

  constructor() {
    this.client = new MongoClient(uri)
  }

  async generateDailyReport(date?: Date): Promise<DailyReportData> {
    const reportDate = date || new Date()
    const reportDateStr = reportDate.toISOString().split('T')[0]

    try {
      await this.client.connect()
      const db = this.client.db('trend')
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
      const insights = await this.generateInsights({
        totalVideos,
        totalChannels,
        languageStats,
        topChannels,
        recentWeek: recentWeek[0],
        previousWeek: previousWeek[0]
      })

      // 6. 요약 생성
      const summary = this.generateSummary(insights, languageStats)

      return {
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
        trends: this.calculateTrends(recentWeek[0], previousWeek[0]),
        insights,
        summary
      }

    } catch (error) {
      console.error('Daily report generation error:', error)
      throw new Error('Failed to generate daily report')
    } finally {
      await this.client.close()
    }
  }

  private async generateInsights(data: any): Promise<any[]> {
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

  private calculateTrends(recent: any, previous: any): Array<{metric: string, change: number, timeframe: string}> {
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

  private generateSummary(insights: any[], languageStats: any[]): {
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
}
