'use client';

import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { PageEditor } from '@/components/PageEditor';
import { cn } from '@/lib/utils';
import { getSupabaseBrowser } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = getSupabaseBrowser();
  const router = useRouter();

  // Check for existing pages and redirect to the most recent one
  useEffect(() => {
    async function checkForPages() {
      try {
        // Check if user is authenticated
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user?.id) {
          setIsLoading(false);
          return;
        }

        // Get the most recent page
        const { data: pages, error } = await supabase
          .from('pages')
          .select('*')
          .eq('owner_id', session.user.id)
          .order('updated_at', { ascending: false })
          .limit(1);

        if (error) throw error;

        if (pages && pages.length > 0) {
          // Redirect to the most recent page
          router.push(`/${pages[0].slug}`);
        } else {
          // Create a new page
          const timestamp = Date.now();
          const defaultTitle = 'Untitled';
          const newSlug = `${defaultTitle.toLowerCase().replace(/\s+/g, '-')}-${timestamp}`;
          
          const { data: page, error: insertError } = await supabase
            .from('pages')
            .insert([{
              title: defaultTitle,
              content: {},
              slug: newSlug,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              is_favorite: false,
              owner_id: session.user.id,
            }])
            .select()
            .single();

          if (insertError) throw insertError;
          
          if (page) {
            // Redirect to the new page
            router.push(`/${page.slug}`);
          }
        }
      } catch (error) {
        console.error('Error checking for pages:', error);
      } finally {
        setIsLoading(false);
      }
    }

    checkForPages();
  }, [supabase, router]);

  return (
    <div className="min-h-screen bg-base-100">
      <Sidebar 
        className="print:hidden"
        isCollapsed={isCollapsed}
        onCollapsedChange={setIsCollapsed}
      />
      <main className={cn(
        "transition-all duration-300",
        isCollapsed ? "ml-0" : "ml-64"
      )}>
        {isLoading ? (
          <div className="flex items-center justify-center h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <PageEditor isCollapsed={isCollapsed} />
        )}
      </main>
    </div>
  );
}
