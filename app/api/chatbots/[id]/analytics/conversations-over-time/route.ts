import { NextResponse } from 'next/server';
import { getSessions } from '@/lib/supabase/database';

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
        { status: 400 }
      );
    }

    const sessions = await getSessions(id);

    // Group by date
    const dateMap = new Map<string, number>();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Initialize all dates with 0
    for (let i = 0; i < days; i++) {
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

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Error fetching conversations over time:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
}
