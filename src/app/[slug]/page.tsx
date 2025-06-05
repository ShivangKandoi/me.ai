import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { PageEditor } from '@/components/PageEditor';

interface PageProps {
  params: {
    slug: string;
  };
}

export default async function Page({ params }: PageProps) {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );
  
  try {
    // Check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      redirect('/login');
    }

    // Load page data - with retry logic for policy errors
    let page = null;
    let attempts = 0;
    const maxAttempts = 3;
    
    while (!page && attempts < maxAttempts) {
      try {
        const { data, error } = await supabase
          .from('pages')
          .select('*')
          .eq('slug', params.slug)
          .single();
        
        if (error) {
          if (error.code === '42P17' && attempts < maxAttempts - 1) {
            // If it's a policy recursion error and we haven't hit max retries,
            // wait a bit and try again
            await new Promise(resolve => setTimeout(resolve, 1000 * (attempts + 1)));
            attempts++;
            continue;
          }
          throw error;
        }
        
        page = data;
      } catch (error) {
        console.error('Error loading page:', error);
        if (attempts >= maxAttempts - 1) {
          throw error;
        }
        attempts++;
      }
    }

    if (!page) {
      redirect('/');
    }

    return (
      <PageEditor 
        pageId={page.id} 
        slug={params.slug}
      />
    );
  } catch (error) {
    // If we hit an error after retries, redirect to home
    console.error('Error in page route:', error);
    redirect('/');
  }
} 