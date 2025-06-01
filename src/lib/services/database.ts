import { supabase } from '../supabase';
import type { Database } from '@/types/database';

type Profile = Database['public']['Tables']['profiles']['Row'];
type Page = Database['public']['Tables']['pages']['Row'];
type Block = Database['public']['Tables']['blocks']['Row'];

export const DatabaseService = {
  // Profile operations
  async getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  },

  async updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile> {
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
  async createPage(userId: string, title: string, parentId?: string): Promise<Page> {
    const { data, error } = await supabase
      .from('pages')
      .insert({
        title,
        user_id: userId,
        parent_id: parentId || null,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getPages(userId: string): Promise<Page[]> {
    const { data, error } = await supabase
      .from('pages')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getPage(pageId: string): Promise<Page | null> {
    const { data, error } = await supabase
      .from('pages')
      .select('*')
      .eq('id', pageId)
      .single();

    if (error) throw error;
    return data;
  },

  async updatePage(pageId: string, updates: Partial<Page>): Promise<Page> {
    const { data, error } = await supabase
      .from('pages')
      .update(updates)
      .eq('id', pageId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deletePage(pageId: string): Promise<void> {
    const { error } = await supabase
      .from('pages')
      .delete()
      .eq('id', pageId);

    if (error) throw error;
  },

  // Block operations
  async createBlock(pageId: string, type: string, content: any, position: number): Promise<Block> {
    const { data, error } = await supabase
      .from('blocks')
      .insert({
        page_id: pageId,
        type,
        content,
        position,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getBlocks(pageId: string): Promise<Block[]> {
    const { data, error } = await supabase
      .from('blocks')
      .select('*')
      .eq('page_id', pageId)
      .order('position', { ascending: true });

    if (error) throw error;
    return data;
  },

  async updateBlock(blockId: string, updates: Partial<Block>): Promise<Block> {
    const { data, error } = await supabase
      .from('blocks')
      .update(updates)
      .eq('id', blockId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteBlock(blockId: string): Promise<void> {
    const { error } = await supabase
      .from('blocks')
      .delete()
      .eq('id', blockId);

    if (error) throw error;
  },

  // Realtime subscriptions
  subscribeToPage(pageId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`page:${pageId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'blocks',
          filter: `page_id=eq.${pageId}`,
        },
        callback
      )
      .subscribe();
  },
}; 