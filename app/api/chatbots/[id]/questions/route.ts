import { NextResponse } from 'next/server';
import { getQuestions, createQuestion, getChatbotById } from '@/lib/supabase/database';
import { z } from 'zod';

// Validation schema
const createQuestionSchema = z.object({
  question: z.string().min(10, 'Question must be at least 10 characters').max(200, 'Question must be at most 200 characters'),
  answer: z.string().min(10, 'Answer must be at least 10 characters').max(500, 'Answer must be at most 500 characters'),
  keywords: z.array(z.string().min(1).max(50)).min(1, 'At least one keyword is required'),
});

/**
 * GET /api/chatbots/[id]/questions - Get all questions for a chatbot
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Verify chatbot exists
    const chatbot = await getChatbotById(id);
    if (!chatbot) {
      return NextResponse.json(
        { error: 'Chatbot not found' },
        { status: 404 }
      );
    }

    const questions = await getQuestions(id);

    return NextResponse.json({
      success: true,
      questions,
    });
  } catch (error) {
    console.error('Error fetching questions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch questions', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/chatbots/[id]/questions - Create a new question
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: chatbotId } = await params;
    const body = await request.json();

    // Verify chatbot exists
    const chatbot = await getChatbotById(chatbotId);
    if (!chatbot) {
      return NextResponse.json(
        { error: 'Chatbot not found' },
        { status: 404 }
      );
    }

    // Validate input
    const validatedData = createQuestionSchema.parse(body);

    // Create question
    const newQuestion = await createQuestion({
      chatbot_id: chatbotId,
      ...validatedData,
      is_active: true,
    });

    return NextResponse.json({
      success: true,
      question: newQuestion,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating question:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create question', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
