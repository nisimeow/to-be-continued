import { NextResponse } from 'next/server';
import { mockChatbots, mockQuestions } from '@/lib/mock-data';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  // In production, this would fetch from database
  // For now, we'll use mock data and localStorage-like simulation

  const chatbot = mockChatbots.find(c => c.id === id);

  if (!chatbot) {
    return NextResponse.json(
      { error: 'Chatbot not found' },
      {
        status: 404,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        }
      }
    );
  }

  const questions = mockQuestions.filter(q => q.chatbotId === id);

  return NextResponse.json(
    {
      chatbot,
      questions
    },
    {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    }
  );
}

// Handle CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
