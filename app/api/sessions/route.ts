import { NextResponse } from 'next/server';
import { createSession } from '@/lib/supabase/database';

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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { chatbotId } = body;

    console.log('📝 Creating session for chatbot:', chatbotId);

    if (!chatbotId) {
      console.error('❌ Missing chatbotId in request');
      return NextResponse.json(
        { error: 'Chatbot ID is required' },
        { status: 400, headers: corsHeaders }
      );
    }

    const session = await createSession({
      chatbot_id: chatbotId,
    });

    console.log('✅ Session created successfully:', session.id);

    return NextResponse.json({
      success: true,
      session,
    }, { headers: corsHeaders });
  } catch (error) {
    console.error('❌ Error creating session:', error);
    return NextResponse.json(
      {
        error: 'Failed to create session',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500, headers: corsHeaders }
    );
  }
}
