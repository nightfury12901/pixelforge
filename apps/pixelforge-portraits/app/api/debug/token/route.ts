import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// DEV ONLY — returns the current user's access token for Postman testing
// Remove this file before deploying to production
export async function GET() {
    if (process.env.NODE_ENV === 'production') {
        return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
    }

    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
        return NextResponse.json({ error: 'Not logged in' }, { status: 401 });
    }

    return NextResponse.json({
        access_token: session.access_token,
        user_id: session.user.id,
        email: session.user.email,
        expires_at: session.expires_at,
        hint: 'Use this as: Authorization: Bearer <access_token> in Postman',
    });
}
