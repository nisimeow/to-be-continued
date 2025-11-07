import { NextResponse } from 'next/server';
import { mockChatbots, mockQuestions } from '@/lib/mock-data';

export async function GET() {
  return NextResponse.json({
    chatbots: mockChatbots,
    questions: mockQuestions
  });
}
