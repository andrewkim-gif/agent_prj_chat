import { NextRequest, NextResponse } from 'next/server';
import { InsightQueries } from '@/lib/mongodb-insight';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let dateRange;
    if (startDate && endDate) {
      dateRange = {
        start: new Date(startDate),
        end: new Date(endDate)
      };
    }

    const languageStats = await InsightQueries.getLanguageStats(dateRange);

    return NextResponse.json({
      success: true,
      data: languageStats
    });
  } catch (error) {
    console.error('Language stats API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch language statistics'
      },
      { status: 500 }
    );
  }
}