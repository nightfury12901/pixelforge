import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient, createClientFromToken } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    // Support both cookie auth (browser) and Bearer token auth (Postman/curl)
    const authHeader = request.headers.get('authorization');
    const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

    const supabase = bearerToken ? createClientFromToken(bearerToken) : createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const generationId = searchParams.get('id');

    if (!generationId) {
      return NextResponse.json({ error: 'Generation ID required' }, { status: 400 });
    }

    // Use admin client to fetch generation (bypasses RLS, works with both auth methods)
    const adminSupabase = createAdminClient() as any;
    const { data: generation, error } = await adminSupabase
      .from('generations')
      .select('*')
      .eq('id', generationId)
      .eq('user_id', user.id)
      .single();

    if (error || !generation) {
      return NextResponse.json({ error: 'Generation not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        status: generation.status,
        output_image_url: generation.output_image_url,
        error_message: generation.error_message,
        processing_time_ms: generation.processing_time_ms,
        operation_type: generation.operation_type,
      },
    });
  } catch (error: any) {
    console.error('Status check error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
