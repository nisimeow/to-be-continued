import { NextResponse } from 'next/server';
import { getSessions } from '@/lib/supabase/database';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'Chatbot ID is required' },
        { status: 400 }
      );
    }

    const sessions = await getSessions(id);

    // Calculate stats
    const totalConversations = sessions.length;
    const totalMessages = sessions.reduce((sum, s) => sum + (s.message_count || 0), 0);

    const sessionsWithDuration = sessions.filter((s) => s.duration_seconds);
    const avgDuration = sessionsWithDuration.length > 0
      ? Math.round(
          sessionsWithDuration.reduce((sum, s) => sum + (s.duration_seconds || 0), 0) /
            sessionsWithDuration.length
        )
      : 0;

    const activeConversations = sessions.filter((s) => !s.ended_at).length;

    const engagedConversations = sessions.filter((s) => (s.message_count || 0) > 2).length;
    const responseRate = totalConversations > 0
      ? Math.round((engagedConversations / totalConversations) * 100)
      : 0;

    // Calculate outcomes
    const resolved = sessions.filter((s) => s.ended_at && (s.message_count || 0) > 3).length;
    const unresolved = sessions.filter((s) => s.ended_at && (s.message_count || 0) <= 2).length;
    const ongoing = activeConversations;

    return NextResponse.json({
      success: true,
      stats: {
        totalConversations,
        avgDuration,
        totalMessages,
        responseRate,
        activeConversations,
      },
      outcomes: {
        resolved,
        unresolved,
        ongoing,
      },
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
}
