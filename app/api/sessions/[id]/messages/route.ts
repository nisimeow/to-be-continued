import { NextResponse } from 'next/server';
import { createMessage, getSessionMessages } from '@/lib/supabase/database';

// Helper to get CORS headers based on request origin
function getCorsHeaders(requestOrigin: string | null) {
  return {
    'Access-Control-Allow-Origin': requestOrigin || '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
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

    const messages = await getSessionMessages(id);

    return NextResponse.json({
      success: true,
      messages,
    }, { headers: getCorsHeaders(request.headers.get('origin')) });
  } catch (error) {
    console.error('❌ Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500, headers: getCorsHeaders(request.headers.get('origin')) }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    console.log('💬 Saving message for session:', id);

    if (!id) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400, headers: getCorsHeaders(request.headers.get('origin')) }
      );
    }

    const { sender, message_text, matched_question_id } = body;

    if (!sender || !message_text) {
      console.error('❌ Missing required fields:', { sender, message_text });
      return NextResponse.json(
        { error: 'Sender and message_text are required' },
        { status: 400, headers: getCorsHeaders(request.headers.get('origin')) }
      );
    }

    const message = await createMessage({
      session_id: id,
      sender,
      message_text,
      matched_question_id: matched_question_id || null,
    });

    console.log('✅ Message saved successfully:', message.id);

    return NextResponse.json({
      success: true,
      message,
    }, { headers: getCorsHeaders(request.headers.get('origin')) });
  } catch (error) {
    console.error('❌ Error creating message:', error);
    return NextResponse.json(
      {
        error: 'Failed to create message',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500, headers: getCorsHeaders(request.headers.get('origin')) }
    );
  }
}
