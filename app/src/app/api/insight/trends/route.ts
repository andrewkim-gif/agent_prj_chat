import { NextRequest, NextResponse } from 'next/server';
import { InsightQueries } from '@/lib/mongodb-insight';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    // Support both languages and locations for backward compatibility
    const locations = searchParams.get('locations')?.split(',').filter(Boolean);
    const languages = searchParams.get('languages')?.split(',').filter(Boolean);
    const days = parseInt(searchParams.get('days') || '14');

    // Use languages if provided, otherwise fall back to locations
    const filterParams = languages || locations;

    const trendData = await InsightQueries.getTrendData(filterParams, days);

    return NextResponse.json({
      success: true,
      data: trendData
    });
  } catch (error) {
    console.error('Trends API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch trend data'
      },
      { status: 500 }
    );
  }
}