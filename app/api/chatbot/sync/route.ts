import { NextResponse } from 'next/server';
import { writeChatbots, writeQuestions } from '@/lib/server-storage';
import { Chatbot, Question } from '@/lib/types';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { chatbots, questions } = body as { chatbots: Chatbot[]; questions: Question[] };

    if (!chatbots || !questions) {
      return NextResponse.json(
        { error: 'Missing chatbots or questions data' },
        { status: 400 }
      );
    }

    // Save to server storage
    writeChatbots(chatbots);
    writeQuestions(questions);

    return NextResponse.json(
      { success: true, message: 'Data synced successfully' },
      {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        }
      }
    );
  } catch (error) {
    console.error('Error syncing data:', error);
    return NextResponse.json(
      { error: 'Failed to sync data' },
      {
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        }
      }
    );
  }
}

// Handle CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
