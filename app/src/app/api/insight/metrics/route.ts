import { NextRequest, NextResponse } from 'next/server';
import { InsightQueries } from '@/lib/mongodb-insight';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    // Support both languages and locations for backward compatibility
    const locations = searchParams.get('locations')?.split(',').filter(Boolean);
    const languages = searchParams.get('languages')?.split(',').filter(Boolean);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Use languages if provided, otherwise fall back to locations
    const filterParams = languages || locations;

    let dateRange;
    if (startDate && endDate) {
      dateRange = {
        start: new Date(startDate),
        end: new Date(endDate)
      };
    }

    const metrics = await InsightQueries.getDashboardMetrics(filterParams, dateRange);

    return NextResponse.json({
      success: true,
      data: metrics
    });
  } catch (error) {
    console.error('Metrics API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch dashboard metrics'
      },
      { status: 500 }
    );
  }
}