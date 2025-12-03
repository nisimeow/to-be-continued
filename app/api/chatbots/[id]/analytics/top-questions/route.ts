import { NextResponse } from 'next/server';
import { getSessions } from '@/lib/supabase/database';
import { createClient } from '@/lib/supabase/server';

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
        { error: 'Chatbot ID is required' },
        { status: 400, headers: corsHeaders }
      );
    }

    const supabase = await createClient();

    // Get all messages for this chatbot's sessions
    const { data: messages, error } = await supabase
      .from('chat_messages')
      .select(`
        id,
        matched_question_id,
        session_id,
        chat_sessions!inner(chatbot_id)
      `)
      .eq('chat_sessions.chatbot_id', id)
      .eq('sender', 'bot')
      .not('matched_question_id', 'is', null);

    if (error) throw error;

    console.log(`📊 Top Questions: Found ${messages?.length || 0} matched messages`);

    // Count occurrences of each question
    const questionCounts = new Map<string, number>();
    messages?.forEach((msg: any) => {
      if (msg.matched_question_id) {
        questionCounts.set(
          msg.matched_question_id,
          (questionCounts.get(msg.matched_question_id) || 0) + 1
        );
      }
    });

    // Get question details
    const questionIds = Array.from(questionCounts.keys());
    const { data: questions, error: questionsError } = await supabase
      .from('questions')
      .select('id, question')
      .in('id', questionIds);

    if (questionsError) throw questionsError;

    // Combine and sort
    const data = questions
      ?.map((q) => ({
        question: q.question,
        count: questionCounts.get(q.id) || 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10) || [];

    console.log(`📊 Top Questions: Returning ${data.length} top questions`);

    return NextResponse.json({
      success: true,
      data,
    }, { headers: corsHeaders });
  } catch (error) {
    console.error('❌ Error fetching top questions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500, headers: corsHeaders }
    );
  }
}
