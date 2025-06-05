import { getSupabaseBrowser } from '../supabase';
import type { Database } from '@/types/database';

type Profile = Database['public']['Tables']['profiles']['Row'];
type Page = Database['public']['Tables']['pages']['Row'];
type Block = Database['public']['Tables']['blocks']['Row'];

export const DatabaseService = {
  // Profile operations
  async getProfile(userId: string): Promise<Profile | null> {
    const supabase = getSupabaseBrowser();
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  },

  async updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile> {
    const supabase = getSupabaseBrowser();
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Page operations
  async createPage(ownerId: string, title: string, parentId?: string): Promise<Page> {
    const supabase = getSupabaseBrowser();
    const timestamp = new Date().toISOString();
    const slug = `${title.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;

    const { data, error } = await supabase
      .from('pages')
      .insert({
        title,
        owner_id: ownerId,
        parent_page_id: parentId || null,
        content: {},
        slug,
        created_at: timestamp,
        updated_at: timestamp,
        is_favorite: false,
        is_private: true,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getPages(ownerId: string): Promise<Page[]> {
    const supabase = getSupabaseBrowser();
    const { data, error } = await supabase
      .from('pages')
      .select('*')
      .eq('owner_id', ownerId)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getPage(pageId: string): Promise<Page | null> {
    const supabase = getSupabaseBrowser();
    const { data, error } = await supabase
      .from('pages')
      .select('*')
      .eq('id', pageId)
      .single();

    if (error) throw error;
    return data;
  },

  async getPageBySlug(slug: string): Promise<Page | null> {
    const supabase = getSupabaseBrowser();
    const { data, error } = await supabase
      .from('pages')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) throw error;
    return data;
  },

  async updatePage(pageId: string, updates: Partial<Page>): Promise<Page> {
    const supabase = getSupabaseBrowser();
    const { data, error } = await supabase
      .from('pages')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', pageId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deletePage(pageId: string): Promise<void> {
    const supabase = getSupabaseBrowser();
    const { error } = await supabase
      .from('pages')
      .delete()
      .eq('id', pageId);

    if (error) throw error;
  },

  // Block operations
  async createBlock(pageId: string, type: string, content: any, position: number): Promise<Block> {
    const supabase = getSupabaseBrowser();
    const timestamp = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('blocks')
      .insert({
        page_id: pageId,
        type,
        content,
        position,
        created_at: timestamp,
        updated_at: timestamp,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getBlocks(pageId: string): Promise<Block[]> {
    const supabase = getSupabaseBrowser();
    const { data, error } = await supabase
      .from('blocks')
      .select('*')
      .eq('page_id', pageId)
      .order('position', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async updateBlock(blockId: string, updates: Partial<Block>): Promise<Block> {
    const supabase = getSupabaseBrowser();
    const { data, error } = await supabase
      .from('blocks')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', blockId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteBlock(blockId: string): Promise<void> {
    const supabase = getSupabaseBrowser();
    const { error } = await supabase
      .from('blocks')
      .delete()
      .eq('id', blockId);

    if (error) throw error;
  },

  // Realtime subscriptions
  subscribeToPage(pageId: string, callback: (payload: any) => void) {
    const supabase = getSupabaseBrowser();
    return supabase
      .channel(`page:${pageId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'pages',
          filter: `id=eq.${pageId}`,
        },
        callback
      )
      .subscribe();
  },
}; 