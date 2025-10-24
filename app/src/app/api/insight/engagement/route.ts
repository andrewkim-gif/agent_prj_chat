import { NextRequest, NextResponse } from 'next/server';
import { InsightQueries } from '@/lib/mongodb-insight';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const languages = searchParams.get('languages')?.split(',').filter(Boolean);

    let dateRange;
    if (startDate && endDate) {
      dateRange = {
        start: new Date(startDate),
        end: new Date(endDate)
      };
    }

    const engagementAnalytics = await InsightQueries.getEngagementAnalytics(languages, dateRange);

    return NextResponse.json({
      success: true,
      data: engagementAnalytics
    });
  } catch (error) {
    console.error('Engagement analytics API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch engagement analytics'
      },
      { status: 500 }
    );
  }
}