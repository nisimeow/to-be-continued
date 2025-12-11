import { NextResponse } from 'next/server';
import { getSessions } from '@/lib/supabase/database';

// CORS headers for cross-origin requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Handle OPTIONS request for CORS preflight
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');

    if (!id) {
      return NextResponse.json(
        { error: 'Chatbot ID is required' },
        { status: 400, headers: corsHeaders }
      );
    }

    const sessions = await getSessions(id);

    console.log(`📊 Analytics: Found ${sessions.length} sessions for chatbot ${id}`);

    // Group by date
    const dateMap = new Map<string, number>();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Initialize all dates with 0
    for (let i = 0; i <= days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateKey = date.toISOString().split('T')[0];
      dateMap.set(dateKey, 0);
    }

    // Count sessions per date
    sessions.forEach((session) => {
      const sessionDate = new Date(session.started_at).toISOString().split('T')[0];
      if (dateMap.has(sessionDate)) {
        dateMap.set(sessionDate, (dateMap.get(sessionDate) || 0) + 1);
      }
    });

    // Convert to array format for charts
    const data = Array.from(dateMap.entries())
      .map(([date, count]) => ({
        date,
        conversations: count,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    console.log(`📊 Analytics: Returning ${data.length} data points`);

    return NextResponse.json({
      success: true,
      data,
    }, { headers: corsHeaders });
  } catch (error) {
    console.error('❌ Error fetching conversations over time:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500, headers: corsHeaders }
    );
  }
}
