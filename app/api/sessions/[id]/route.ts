import { NextResponse } from 'next/server';
import { getSessionById, updateSession } from '@/lib/supabase/database';

// CORS headers for cross-origin requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
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

    if (!id) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400, headers: corsHeaders }
      );
    }

    const session = await getSessionById(id);

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json({
      success: true,
      session,
    }, { headers: corsHeaders });
  } catch (error) {
    console.error('❌ Error fetching session:', error);
    return NextResponse.json(
      { error: 'Failed to fetch session' },
      { status: 500, headers: corsHeaders }
    );
  }
}

// Handle both PATCH and POST (for sendBeacon compatibility)
async function handleSessionUpdate(
  request: Request,
  params: Promise<{ id: string }>
) {
  try {
    const { id } = await params;
    const body = await request.json();

    console.log('🔄 Updating session:', id, body);

    if (!id) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Calculate duration if ended_at is provided
    let updates = { ...body };
    if (body.ended_at && body.started_at) {
      const start = new Date(body.started_at);
      const end = new Date(body.ended_at);
      updates.duration_seconds = Math.floor((end.getTime() - start.getTime()) / 1000);
    }

    const session = await updateSession(id, updates);

    console.log('✅ Session updated successfully:', session.id);

    return NextResponse.json({
      success: true,
      session,
    }, { headers: corsHeaders });
  } catch (error) {
    console.error('❌ Error updating session:', error);
    return NextResponse.json(
      {
        error: 'Failed to update session',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return handleSessionUpdate(request, params);
}

// Also accept POST for sendBeacon compatibility
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return handleSessionUpdate(request, params);
}
