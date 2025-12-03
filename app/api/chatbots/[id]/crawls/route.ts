import { NextResponse } from 'next/server';
import { getCrawledContent } from '@/lib/supabase/database';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'Chatbot ID is required' },
        { status: 400 }
      );
    }

    const crawls = await getCrawledContent(id);

    return NextResponse.json({
      success: true,
      crawls,
    });
  } catch (error) {
    console.error('Error fetching crawl history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch crawl history' },
      { status: 500 }
    );
  }
}
