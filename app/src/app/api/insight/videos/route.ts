import { NextRequest, NextResponse } from 'next/server';
import { InsightQueries } from '@/lib/mongodb-insight';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const locations = searchParams.get('locations')?.split(',').filter(Boolean);
    const limit = parseInt(searchParams.get('limit') || '10');

    const videos = await InsightQueries.getRecentVideos(limit, locations);

    return NextResponse.json({
      success: true,
      data: videos
    });
  } catch (error) {
    console.error('Videos API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch videos'
      },
      { status: 500 }
    );
  }
}