import { NextResponse } from 'next/server';
import { getChatbots, createChatbot } from '@/lib/supabase/database';
import { z } from 'zod';

// Validation schema
const createChatbotSchema = z.object({
  name: z.string().min(1).max(100),
  colors: z.object({
    primary: z.string(),
    secondary: z.string(),
    text: z.string(),
  }),
  welcome_message: z.string().min(1).max(500),
  fallback_message: z.string().min(1).max(500),
  is_active: z.boolean(),
});

/**
 * GET /api/users/[id]/chatbots - Get all chatbots for a user
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params;

    const chatbots = await getChatbots(userId);

    return NextResponse.json({
      success: true,
      chatbots,
    });
  } catch (error) {
    console.error('Error fetching chatbots:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chatbots', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/users/[id]/chatbots - Create a new chatbot
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params;
    const body = await request.json();

    // Validate input
    const validatedData = createChatbotSchema.parse(body);

    // Create chatbot
    const newChatbot = await createChatbot({
      user_id: userId,
      custom_context: '', // Default empty context
      ...validatedData,
    });

    return NextResponse.json({
      success: true,
      chatbot: newChatbot,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating chatbot:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create chatbot', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
