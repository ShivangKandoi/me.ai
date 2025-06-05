import { createBrowserClient } from '@supabase/ssr'

// Create a singleton instance that can be shared across the app
let supabase: ReturnType<typeof createBrowserClient> | null = null;

export function getSupabaseBrowser() {
  if (!supabase) {
    supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return supabase;
} 