import { createClient } from './supabase/server';
import { createAdminClient } from './supabase/server';
import type { PortraitTemplate } from './types';

export async function getAllTemplates(options?: {
  category?: string;
  published?: boolean;
  sortBy?: 'popularity' | 'newest' | 'name';
}): Promise<PortraitTemplate[]> {
  // Use admin client temporarily to bypass RLS issues
  const supabase = createAdminClient();

  let query = supabase.from('portrait_templates').select('*');

  if (options?.category && options.category !== 'all') {
    if (options.category === 'trending') {
      query = query.eq('is_trending', true);
    } else {
      query = query.eq('category', options.category);
    }
  }

  if (options?.published !== undefined) {
    query = query.eq('is_published', options.published);
  }

  // Sorting
  switch (options?.sortBy) {
    case 'popularity':
      query = query.order('popularity_score', { ascending: false });
      break;
    case 'newest':
      query = query.order('created_at', { ascending: false });
      break;
    case 'name':
      query = query.order('name', { ascending: true });
      break;
    default:
      query = query.order('popularity_score', { ascending: false });
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching templates:', error);
    return [];
  }

  return data || [];
}

export async function getTemplateById(id: string): Promise<PortraitTemplate | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('portrait_templates')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching template:', error);
    return null;
  }

  return data;
}

export async function trackTemplateUsage(
  templateId: string,
  userId?: string
): Promise<void> {
  const supabase = createAdminClient();

  await (supabase as any).from('template_usage').insert({
    template_id: templateId,
    user_id: userId,
  });
}

export async function getPopularTemplates(limit: number = 6): Promise<PortraitTemplate[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('portrait_templates')
    .select('*')
    .eq('is_published', true)
    .order('popularity_score', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching popular templates:', error);
    return [];
  }

  return data || [];
}

export async function getTrendingTemplates(limit: number = 6): Promise<PortraitTemplate[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('portrait_templates')
    .select('*')
    .eq('is_published', true)
    .eq('is_trending', true)
    .order('popularity_score', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching trending templates:', error);
    return [];
  }

  return data || [];
}

export async function searchTemplates(query: string): Promise<PortraitTemplate[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('portrait_templates')
    .select('*')
    .eq('is_published', true)
    .ilike('name', `%${query}%`);

  if (error) {
    console.error('Error searching templates:', error);
    return [];
  }

  return data || [];
}

export async function createTemplate(
  template: Omit<PortraitTemplate, 'id' | 'created_at' | 'updated_at' | 'popularity_score' | 'usage_count'>
): Promise<{ success: boolean; template?: PortraitTemplate; error?: string }> {
  const supabase = createAdminClient();

  const { data, error } = await (supabase as any)
    .from('portrait_templates')
    .insert(template)
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, template: data };
}

export async function updateTemplate(
  id: string,
  updates: Partial<PortraitTemplate>
): Promise<{ success: boolean; error?: string }> {
  const supabase = createAdminClient();

  const { error } = await (supabase as any)
    .from('portrait_templates')
    .update(updates)
    .eq('id', id);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function deleteTemplate(id: string): Promise<{ success: boolean; error?: string }> {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from('portrait_templates')
    .delete()
    .eq('id', id);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function getFreeTemplates(): Promise<PortraitTemplate[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('portrait_templates')
    .select('*')
    .eq('is_published', true)
    .eq('tier', 'free')
    .order('popularity_score', { ascending: false });

  if (error) {
    console.error('Error fetching free templates:', error);
    return [];
  }

  return data || [];
}
