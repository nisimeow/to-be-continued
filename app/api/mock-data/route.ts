import { NextResponse } from 'next/server';

/**
 * @deprecated This route is deprecated. Use Supabase database queries instead.
 * Kept for backward compatibility during migration.
 */
export async function GET() {
  return NextResponse.json({
    error: 'This endpoint is deprecated. Please use the Supabase database directly.',
    message: 'Mock data is no longer available. All data is now stored in Supabase.',
  }, { status: 410 }); // 410 Gone
}
