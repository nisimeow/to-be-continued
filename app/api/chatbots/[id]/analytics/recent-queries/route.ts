import { NextResponse } from 'next/server';
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

        // Get recent user messages for this chatbot's sessions
        const { data: messages, error } = await supabase
            .from('chat_messages')
            .select(`
        id,
        message_text,
        sent_at,
        session_id,
        chat_sessions!inner(chatbot_id)
      `)
            .eq('chat_sessions.chatbot_id', id)
            .eq('sender', 'user')
            .order('sent_at', { ascending: false })
            .limit(20);

        if (error) throw error;

        console.log(`📊 Recent Queries: Found ${messages?.length || 0} user messages`);

        // Format for display
        const data = messages?.map((msg: any) => ({
            query: msg.message_text,
            time: msg.sent_at,
        })) || [];

        return NextResponse.json({
            success: true,
            data,
        }, { headers: corsHeaders });
    } catch (error) {
        console.error('❌ Error fetching recent queries:', error);
        return NextResponse.json(
            { error: 'Failed to fetch analytics data' },
            { status: 500, headers: corsHeaders }
        );
    }
}
