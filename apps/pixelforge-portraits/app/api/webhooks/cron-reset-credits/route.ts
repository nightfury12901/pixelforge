import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminSupabase = createAdminClient();

    // Call stored procedures to reset credits and extension prompts
    await adminSupabase.rpc('reset_monthly_credits');
    await adminSupabase.rpc('reset_extension_prompts');

    return NextResponse.json({
      success: true,
      message: 'Credits and extension prompts reset successfully',
    });
  } catch (error: any) {
    console.error('Cron reset error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
