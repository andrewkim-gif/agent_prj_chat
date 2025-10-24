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

    const creatorAnalytics = await InsightQueries.getCreatorAnalytics(languages, dateRange);

    return NextResponse.json({
      success: true,
      data: creatorAnalytics
    });
  } catch (error) {
    console.error('Creator analytics API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch creator analytics'
      },
      { status: 500 }
    );
  }
}