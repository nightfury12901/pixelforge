import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/server';
import { createTemplate } from '@/lib/templates';

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const adminSupabase = createAdminClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];
    if (!adminEmails.includes(user.email || '')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const promptTemplate = formData.get('prompt_template') as string;
    const category = formData.get('category') as string;
    const tier = formData.get('tier') as string;
    const isTrending = formData.get('is_trending') === 'true';
    const isNew = formData.get('is_new') === 'true';
    const aspectRatio = formData.get('aspect_ratio') as string || '3:4';

    if (!file || !name || !promptTemplate || !category) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // ── Security: only allow image file types, max 10MB ──────────────────
    const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const MAX_SIZE = 10 * 1024 * 1024; // 10 MB
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, and WebP images are allowed.' },
        { status: 400 },
      );
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB.' },
        { status: 400 },
      );
    }

    // Upload image to Supabase Storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `templates/${fileName}`;

    const { error: uploadError } = await adminSupabase.storage
      .from('templates')
      .upload(filePath, file, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 });
    }

    // Get public URL
    const { data: urlData } = adminSupabase.storage
      .from('templates')
      .getPublicUrl(filePath);

    // Create template in database
    const result = await createTemplate({
      name,
      description: description || null,
      preview_image_url: urlData.publicUrl,
      prompt_template: promptTemplate,
      category: category as any,
      tier: (tier as any) || 'starter',
      is_trending: isTrending,
      is_new: isNew,
      is_published: true,
      aspect_ratio: aspectRatio,
      mask_image: null,
      instagram_example_urls: null,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: result.template,
    });
  } catch (error: any) {
    console.error('Template upload error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
