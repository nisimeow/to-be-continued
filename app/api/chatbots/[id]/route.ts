import { NextResponse } from 'next/server';
import { getChatbotById, updateChatbot, deleteChatbot } from '@/lib/supabase/database';
import { z } from 'zod';

// Validation schema
const updateChatbotSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  colors: z.object({
    primary: z.string(),
    secondary: z.string(),
    text: z.string(),
  }).optional(),
  welcome_message: z.string().min(1).max(500).optional(),
  fallback_message: z.string().min(1).max(500).optional(),
  is_active: z.boolean().optional(),
});

/**
 * GET /api/chatbots/[id] - Get a single chatbot
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const chatbot = await getChatbotById(id);

    if (!chatbot) {
      return NextResponse.json(
        { error: 'Chatbot not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      chatbot,
    });
  } catch (error) {
    console.error('Error fetching chatbot:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chatbot', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/chatbots/[id] - Update chatbot
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Validate input
    const validatedData = updateChatbotSchema.parse(body);

    // Check if chatbot exists
    const existingChatbot = await getChatbotById(id);
    if (!existingChatbot) {
      return NextResponse.json(
        { error: 'Chatbot not found' },
        { status: 404 }
      );
    }

    // Update chatbot
    const updatedChatbot = await updateChatbot(id, validatedData);

    return NextResponse.json({
      success: true,
      chatbot: updatedChatbot,
    });
  } catch (error) {
    console.error('Error updating chatbot:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update chatbot', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/chatbots/[id] - Delete chatbot
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if chatbot exists
    const existingChatbot = await getChatbotById(id);
    if (!existingChatbot) {
      return NextResponse.json(
        { error: 'Chatbot not found' },
        { status: 404 }
      );
    }

    // Delete chatbot (soft delete)
    await deleteChatbot(id);

    return NextResponse.json({
      success: true,
      message: 'Chatbot deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting chatbot:', error);
    return NextResponse.json(
      { error: 'Failed to delete chatbot', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
