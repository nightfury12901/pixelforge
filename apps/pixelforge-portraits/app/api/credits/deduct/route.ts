import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { deductCredits } from '@/lib/credits';
import { OPERATION_COSTS } from '@/lib/constants';

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { operation, template_id } = body;

    if (!operation || !OPERATION_COSTS.hasOwnProperty(operation)) {
      return NextResponse.json({ error: 'Invalid operation' }, { status: 400 });
    }

    const result = await deductCredits(user.id, operation, template_id);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { remaining: result.remaining },
    });
  } catch (error: any) {
    console.error('Credits deduction error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
