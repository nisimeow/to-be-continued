import { NextResponse } from 'next/server';

/**
 * @deprecated This route is deprecated. Data is now automatically synced with Supabase.
 * Kept for backward compatibility during migration.
 */
export async function POST(request: Request) {
  try {
    return NextResponse.json(
      {
        success: true,
        message: 'Sync endpoint is deprecated. Data is automatically saved to Supabase.',
        deprecated: true,
      },
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
      { error: 'This endpoint is deprecated' },
      {
        status: 410,
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
