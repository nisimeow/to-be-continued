import { NextResponse } from 'next/server';
import { getSessionById, updateSession } from '@/lib/supabase/database';

// Helper to get CORS headers based on request origin
function getCorsHeaders(requestOrigin: string | null) {
  return {
    'Access-Control-Allow-Origin': requestOrigin || '*', // Echo origin or wildcard
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true', // Needed for sendBeacon/credentials: include
  };
}

// Handle OPTIONS request for CORS preflight
export async function OPTIONS(request: Request) {
  const origin = request.headers.get('origin');
  return NextResponse.json({}, { headers: getCorsHeaders(origin) });
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
        { status: 400, headers: getCorsHeaders(request.headers.get('origin')) }
      );
    }

    const session = await getSessionById(id);

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404, headers: getCorsHeaders(request.headers.get('origin')) }
      );
    }

    return NextResponse.json({
      success: true,
      session,
    }, { headers: getCorsHeaders(request.headers.get('origin')) });
  } catch (error) {
    console.error('❌ Error fetching session:', error);
    return NextResponse.json(
      { error: 'Failed to fetch session' },
      { status: 500, headers: getCorsHeaders(request.headers.get('origin')) }
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
        { status: 400, headers: getCorsHeaders(request.headers.get('origin')) }
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
    }, { headers: getCorsHeaders(request.headers.get('origin')) });
  } catch (error) {
    console.error('❌ Error updating session:', error);
    return NextResponse.json(
      {
        error: 'Failed to update session',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500, headers: getCorsHeaders(request.headers.get('origin')) }
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
