import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

// DEV ONLY — instantly gives you 9999 credits
// Remove before production deployment
export async function GET(request: NextRequest) {
    if (process.env.NODE_ENV === 'production') {
        return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
        return NextResponse.json({ error: 'Pass ?email=your@email.com' }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { data, error } = await (supabase as any)
        .from('profiles')
        .update({ credits_remaining: 9999, tier: 'pro' })
        .eq('email', email)
        .select('email, credits_remaining, tier')
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, profile: data });
}
