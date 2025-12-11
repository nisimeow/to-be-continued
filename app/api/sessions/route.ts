import { NextResponse } from 'next/server';
import { createSession } from '@/lib/supabase/database';

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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { chatbotId } = body;

    console.log('📝 Creating session for chatbot:', chatbotId);

    if (!chatbotId) {
      console.error('❌ Missing chatbotId in request');
      return NextResponse.json(
        { error: 'Chatbot ID is required' },
        { status: 400, headers: getCorsHeaders(request.headers.get('origin')) }
      );
    }

    const session = await createSession({
      chatbot_id: chatbotId,
    });

    console.log('✅ Session created successfully:', session.id);

    return NextResponse.json({
      success: true,
      session,
    }, { headers: getCorsHeaders(request.headers.get('origin')) });
  } catch (error) {
    console.error('❌ Error creating session:', error);
    return NextResponse.json(
      {
        error: 'Failed to create session',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500, headers: getCorsHeaders(request.headers.get('origin')) }
    );
  }
}
