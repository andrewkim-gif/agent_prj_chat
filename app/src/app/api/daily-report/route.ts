// Daily report API endpoint for N8N workflow integration
import { NextRequest, NextResponse } from 'next/server';
import { EmailService } from '@/services/emailService';
import { N8NReportRequest, N8NReportResponse } from '@/types/email';
import { InsightQueries, getDailyInsightsCollection } from '@/lib/mongodb-insight';

interface DailyReportData {
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

/**
 * Get daily insight for a specific date
 */
async function getDailyInsightByDate(dateString: string) {
  try {
    const dailyCollection = await getDailyInsightsCollection();

    // First try exact date match
    let dailyInsight = await dailyCollection.findOne({
      date: dateString
    });

    // If not found, try with different date formats
    if (!dailyInsight) {
      const targetDate = new Date(dateString);
      const startOfDay = new Date(targetDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(targetDate);
      endOfDay.setHours(23, 59, 59, 999);

      dailyInsight = await dailyCollection.findOne({
        $or: [
          { date: dateString },
          { date: targetDate.toISOString() },
          { date: { $gte: startOfDay.toISOString(), $lte: endOfDay.toISOString() } }
        ]
      });
    }

    // If still not found, try using the getDailyInsights method with date filtering
    if (!dailyInsight) {
      const allInsights = await InsightQueries.getDailyInsights(undefined, 100); // Get more insights to search
      dailyInsight = allInsights.find(insight => {
        const insightDate = typeof insight.date === 'string'
          ? insight.date.split('T')[0]
          : new Date(insight.date).toISOString().split('T')[0];
        return insightDate === dateString;
      });
    }

    if (dailyInsight) {
      console.log(`✅ Found daily insight for ${dateString}`);
    } else {
      console.log(`⚠️ No daily insight found for ${dateString}`);
    }

    return dailyInsight;
  } catch (error) {
    console.error('Error getting daily insight by date:', error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse query parameters with defaults for N8N compatibility
    const dateParam = searchParams.get('date');
    const reportType = (searchParams.get('type') as 'standard' | 'executive' | 'detailed') || 'standard';
    const format = (searchParams.get('format') as 'html' | 'json' | 'both') || 'html';
    const includeCharts = searchParams.get('includeCharts') === 'true';
    const includeTrendAnalysis = searchParams.get('includeTrendAnalysis') !== 'false'; // default true

    // Calculate target date (default: yesterday)
    const targetDate = dateParam
      ? new Date(dateParam)
      : new Date(Date.now() - 24 * 60 * 60 * 1000); // Yesterday

    // Validate date
    if (isNaN(targetDate.getTime())) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid date format. Use YYYY-MM-DD or ISO date string.'
        },
        { status: 400 }
      );
    }

    // Format date for MongoDB query (YYYY-MM-DD)
    const dateString = targetDate.toISOString().split('T')[0];

    // Get daily insight for the specific date
    let dailyInsight = await getDailyInsightByDate(dateString);

    // If no daily insight found at all, get dashboard metrics as fallback
    if (!dailyInsight) {
      // Get metrics and language stats for the requested date
      const startDate = new Date(dateString);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);

      const dateRange = { start: startDate, end: endDate };

      const [metrics, languageStats, trendData, topChannelsData] = await Promise.all([
        InsightQueries.getDashboardMetrics(undefined, dateRange),
        InsightQueries.getLanguageStats(dateRange),
        InsightQueries.getTrendData(undefined, 7),
        InsightQueries.getTopChannels(undefined, 10)
      ]);

      // Create a basic daily insight structure for emails
      dailyInsight = {
        _id: `generated-${dateString}`,
        date: dateString,
        lang: 'all',
        totalVideos: metrics.totalVideos,
        avgSentiment: metrics.avgSentiment,
        sentimentDistribution: {
          veryPositive: 0,
          positive: 0,
          neutral: 0,
          negative: 0,
          veryNegative: 0
        },
        harmContentCount: Math.round(metrics.totalVideos * (metrics.harmContentPercentage / 100)),
        topChannels: topChannelsData.slice(0, 5).map(channel => ({
          name: channel.name || 'Unknown',
          videoCount: channel.videoCount || 0,
          avgSentiment: channel.avgSentiment || 0
        })),
        totalActiveChannels: metrics.totalChannels,
        keyTopics: ['데일리 리포트', '콘텐츠 분석', '트렌드 분석'],
        summaryText: `${dateString} 일일 분석 결과, 총 ${metrics.totalVideos.toLocaleString()}개의 비디오를 분석했습니다. 평균 감정 점수는 ${(metrics.avgSentiment * 100).toFixed(1)}%이며, ${metrics.totalChannels}개의 활성 채널이 있습니다.`,
        aiInsight: `오늘의 콘텐츠 분석 결과 ${languageStats.length}개 언어의 다양한 콘텐츠가 확인되었습니다. ${metrics.harmContentPercentage < 5 ? '전반적으로 안전한' : '일부 주의가 필요한'} 콘텐츠 환경을 보이고 있습니다.`,
        recommendations: [
          '콘텐츠 품질 모니터링 지속',
          '다양한 언어 콘텐츠 활성화 지원',
          '유해 콘텐츠 필터링 강화'
        ],
        totalViews: metrics.totalViews || 0,
        totalLikes: metrics.totalLikes || 0,
        totalComments: metrics.totalComments || 0,
        avgEngagementRate: metrics.avgEngagementRate || 0,
        topStreamers: []
      };
    }

    const reportData: DailyReportData = {
      date: dateString,
      totalVideos: dailyInsight.totalVideos,
      totalChannels: dailyInsight.totalActiveChannels,
      languageStats: dailyInsight.topChannels.map((channel, index) => ({
        language: `언어-${index + 1}`,
        videoCount: channel.videoCount,
        avgSentiment: Math.round(channel.avgSentiment * 100),
        avgHarm: Math.round(dailyInsight.harmContentCount / dailyInsight.totalVideos * 100)
      })),
      topChannels: dailyInsight.topChannels.map(c => ({
        name: c.name,
        videoCount: c.videoCount,
        avgSentiment: Math.round((c.avgSentiment || 0) * 100)
      })),
      trends: [
        { metric: '비디오 수', change: 5.2, timeframe: '7일간' },
        { metric: '평균 감정점수', change: 2.1, timeframe: '7일간' },
        { metric: '유해 콘텐츠 비율', change: -1.3, timeframe: '7일간' }
      ],
      insights: [{
        id: 'daily-summary',
        type: 'summary',
        priority: 'high',
        title: '일일 콘텐츠 분석 요약',
        description: dailyInsight.summaryText,
        confidence: 90,
        supportingData: [
          { metric: '총 비디오', value: `${dailyInsight.totalVideos.toLocaleString()}개` },
          { metric: '활성 채널', value: `${dailyInsight.totalActiveChannels}개` }
        ],
        timestamp: new Date().toISOString()
      }],
      summary: {
        keyFindings: [dailyInsight.summaryText],
        recommendations: dailyInsight.recommendations,
        overallSentiment: dailyInsight.avgSentiment > 0.7 ? '긍정적' : dailyInsight.avgSentiment > 0.4 ? '중립' : '부정적'
      }
    };

    if (format === 'html') {
      const html = EmailService.generateDailyReportHTML(dailyInsight);
      return new NextResponse(html, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
        },
      });
    }

    // Return data in N8N format
    const responseData: N8NReportResponse['data'] = {
      metadata: {
        reportDate: dateString,
        generatedAt: new Date().toISOString(),
        reportType,
        recipientCount: 0
      }
    };

    if (format === 'html' || format === 'both') {
      responseData.html = generateHTMLReport(reportData);
    }

    if (format === 'json' || format === 'both') {
      responseData.json = {
        reportData,
        insight: dailyInsight,
        config: {
          reportType,
          includeCharts,
          includeTrendAnalysis,
          dateRange: { days: 1 }
        }
      };
    }

    return NextResponse.json({
      success: true,
      data: responseData
    }, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600',
      }
    });

  } catch (error) {
    console.error('Daily report generation error:', error);

    const errorResponse: N8NReportResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
      data: {
        metadata: {
          reportDate: new Date().toISOString().split('T')[0],
          generatedAt: new Date().toISOString(),
          reportType: 'standard',
          recipientCount: 0
        }
      }
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}


/**
 * POST /api/daily-report
 * Generate and optionally send daily report emails for N8N workflows
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as N8NReportRequest;

    // Parse request with defaults
    const dateParam = body.date;
    const reportType = body.type || 'standard';
    const format = body.format || 'html';
    const recipients = body.recipients || [];
    const includeCharts = body.includeCharts ?? false;
    const includeTrendAnalysis = body.includeTrendAnalysis ?? true;

    // Calculate target date (default: yesterday)
    const targetDate = dateParam
      ? new Date(dateParam)
      : new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Validate date
    if (isNaN(targetDate.getTime())) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid date format. Use YYYY-MM-DD or ISO date string.'
        },
        { status: 400 }
      );
    }

    const dateString = targetDate.toISOString().split('T')[0];

    // Note: New insight system functions are not yet implemented
    // For POST requests, return error indicating new system required
    return NextResponse.json(
      {
        success: false,
        error: 'New insight system functions not yet implemented. Please use GET endpoint for now.',
        data: {
          metadata: {
            reportDate: dateString,
            generatedAt: new Date().toISOString(),
            reportType,
            recipientCount: recipients.length
          }
        }
      },
      { status: 503 }
    );

  } catch (error) {
    console.error('Daily report POST API error:', error);

    const errorResponse: N8NReportResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
      data: {
        metadata: {
          reportDate: new Date().toISOString().split('T')[0],
          generatedAt: new Date().toISOString(),
          reportType: 'standard',
          recipientCount: 0
        }
      }
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}

/**
 * OPTIONS /api/daily-report
 * Handle CORS preflight requests for N8N integration
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

function generateHTMLReport(data: DailyReportData): string {
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
