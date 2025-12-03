import { NextResponse } from 'next/server';
import { createMessage, getSessionMessages } from '@/lib/supabase/database';

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

    if (!id) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400, headers: corsHeaders }
      );
    }

    const messages = await getSessionMessages(id);

    return NextResponse.json({
      success: true,
      messages,
    }, { headers: corsHeaders });
  } catch (error) {
    console.error('❌ Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500, headers: corsHeaders }
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
        { status: 400, headers: corsHeaders }
      );
    }

    const { sender, message_text, matched_question_id } = body;

    if (!sender || !message_text) {
      console.error('❌ Missing required fields:', { sender, message_text });
      return NextResponse.json(
        { error: 'Sender and message_text are required' },
        { status: 400, headers: corsHeaders }
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
    }, { headers: corsHeaders });
  } catch (error) {
    console.error('❌ Error creating message:', error);
    return NextResponse.json(
      {
        error: 'Failed to create message',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500, headers: corsHeaders }
    );
  }
}
