import { NextRequest, NextResponse } from 'next/server';
import { InsightQueries } from '@/lib/mongodb-insight';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const locations = searchParams.get('locations')?.split(',').filter(Boolean);
    const limit = parseInt(searchParams.get('limit') || '7');

    const dailyInsights = await InsightQueries.getDailyInsights(locations, limit);

    return NextResponse.json({
      success: true,
      data: dailyInsights
    });
  } catch (error) {
    console.error('Daily insights API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch daily insights'
      },
      { status: 500 }
    );
  }
}