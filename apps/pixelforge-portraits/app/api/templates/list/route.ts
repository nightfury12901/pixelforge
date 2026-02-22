import { NextRequest, NextResponse } from 'next/server';
import { getAllTemplates } from '@/lib/templates';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category') || 'all';
    const sortBy = searchParams.get('sort') as 'popularity' | 'newest' | 'name' | undefined;
    const search = searchParams.get('search');
    const publishedParam = searchParams.get('published');

    // Default to true (public only), unless 'all' or 'false' is specified
    let published: boolean | undefined = true;
    if (publishedParam === 'all') published = undefined;
    else if (publishedParam === 'false') published = false;

    let templates = await getAllTemplates({
      category: category !== 'all' ? category : undefined,
      published,
      sortBy: sortBy || 'popularity',
    });

    // Filter by search query if provided
    if (search) {
      const query = search.toLowerCase();
      templates = templates.filter(
        (t) =>
          t.name.toLowerCase().includes(query) ||
          t.description?.toLowerCase().includes(query)
      );
    }

    return NextResponse.json({
      success: true,
      data: templates,
    });
  } catch (error: any) {
    console.error('Templates list error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
