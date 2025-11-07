import { NextResponse } from 'next/server';
import { getChatbotById } from '@/lib/server-storage';
import { mockChatbots, mockQuestions } from '@/lib/mock-data';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Try to get from server storage first
  const serverData = getChatbotById(id);

  if (serverData) {
    return NextResponse.json(
      {
        chatbot: serverData.chatbot,
        questions: serverData.questions
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

  // Fallback to mock data
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
