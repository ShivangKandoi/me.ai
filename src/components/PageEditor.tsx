'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  MoreHorizontal,
  Share2,
  Star,
  Clock,
  MessageSquare,
  Lock,
  FileText,
  Trash,
  ChevronRight,
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TiptapEditor } from './TiptapEditor';
import { ThemeSwitcher } from './ThemeSwitcher';
import { cn } from "@/lib/utils";
import { getSupabaseBrowser } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { JSONContent } from '@tiptap/react';

// Default content structure for new documents
const DEFAULT_CONTENT: JSONContent = {
  type: 'doc',
  content: [
    {
      type: 'paragraph',
    },
  ],
};

interface PageEditorProps {
  isCollapsed?: boolean;
  pageId?: string;
  slug?: string;
}

export function PageEditor({ isCollapsed = false, pageId, slug }: PageEditorProps) {
  const [title, setTitle] = useState('Untitled');
  const [content, setContent] = useState<JSONContent>(DEFAULT_CONTENT);
  const [isFavorite, setIsFavorite] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(title);

  const supabase = getSupabaseBrowser();
  const router = useRouter();

  // Load page data or create new page
  useEffect(() => {
    let isMounted = true;
    
    async function loadPage() {
      if (!pageId && !slug) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        let page = null;
        let attempts = 0;
        const maxAttempts = 3;

        while (!page && attempts < maxAttempts) {
          try {
            const query = supabase
              .from('pages')
              .select('*');

            if (pageId) {
              query.eq('id', pageId);
            } else if (slug) {
              query.eq('slug', slug);
            }

            const { data, error } = await query.single();

            if (error) {
              if (error.code === '42P17' && attempts < maxAttempts - 1) {
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
            await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
          }
        }

        if (isMounted && page) {
          setTitle(page.title);
          setTitleInput(page.title);
          // Ensure content is in the correct format for Tiptap
          const pageContent = page.content && typeof page.content === 'object' ? page.content : null;
          
          // Validate the content structure
          if (pageContent && pageContent.type === 'doc' && Array.isArray(pageContent.content)) {
            setContent(pageContent);
          } else {
            // If content is invalid, use default content
            setContent(DEFAULT_CONTENT);
          }
          
          setIsFavorite(page.is_favorite);
          setLastSaved(new Date(page.updated_at));
        } else if (isMounted) {
          router.push('/');
        }
      } catch (error) {
        console.error('Error loading page:', error);
        if (isMounted) {
          router.push('/');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadPage();
    
    return () => {
      isMounted = false;
    };
  }, [pageId, slug, supabase, router]);

  // Update URL when title changes
  useEffect(() => {
    if (!pageId || !title) return;

    const timeoutId = setTimeout(async () => {
      const newSlug = `${title.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
      try {
        const { error } = await supabase
          .from('pages')
          .update({ 
            slug: newSlug,
            title 
          })
          .eq('id', pageId);

        if (error) throw error;

        // Update URL without full page reload
        router.replace(`/${newSlug}`, { scroll: false });
      } catch (error) {
        console.error('Error updating page slug:', error);
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [title, pageId, supabase, router]);

  // Debounced save function
  const saveContent = useCallback(async () => {
    if (!pageId) return;

    try {
      const { error } = await supabase
        .from('pages')
        .update({
          title,
          content,
          updated_at: new Date().toISOString(),
        })
        .eq('id', pageId);

      if (error) throw error;

      setLastSaved(new Date());
    } catch (error) {
      console.error('Error saving page:', error);
    }
  }, [pageId, title, content, supabase]);

  // Save content when it changes (debounced)
  useEffect(() => {
    if (!content || !pageId) return;

    const timeoutId = setTimeout(() => {
      saveContent();
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [content, pageId, saveContent]);

  const handleUpdate = useCallback((newContent: JSONContent) => {
    // Validate the content structure
    if (newContent && typeof newContent === 'object' && newContent.type === 'doc' && Array.isArray(newContent.content)) {
      setContent(newContent);
    } else {
      console.warn('Invalid content structure received:', newContent);
      setContent(DEFAULT_CONTENT);
    }
  }, []);

  const toggleFavorite = async () => {
    if (!pageId) return;

    try {
      const { error } = await supabase
        .from('pages')
        .update({ is_favorite: !isFavorite })
        .eq('id', pageId);

      if (error) throw error;

      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const deletePage = async () => {
    if (!pageId || !window.confirm('Are you sure you want to delete this page? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('pages')
        .delete()
        .eq('id', pageId);

      if (error) throw error;

      router.push('/');
    } catch (error) {
      console.error('Error deleting page:', error);
    }
  };

  // Update title input when title prop changes
  useEffect(() => {
    setTitleInput(title);
  }, [title]);

  // Handle title update
  const handleTitleUpdate = async (newTitle: string) => {
    if (!pageId || newTitle === title) return;

    try {
      const { error } = await supabase
        .from('pages')
        .update({ 
          title: newTitle,
          updated_at: new Date().toISOString(),
        })
        .eq('id', pageId);

      if (error) throw error;

      setTitle(newTitle);
      setLastSaved(new Date());
    } catch (error) {
      console.error('Error updating title:', error);
    }
  };

  const handleTitleBlur = () => {
    setIsEditingTitle(false);
    handleTitleUpdate(titleInput);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleTitleBlur();
    } else if (e.key === 'Escape') {
      setIsEditingTitle(false);
      setTitleInput(title);
    }
  };

  if (isLoading) {
    return <div className="flex-1 min-h-screen bg-base-100" />;
  }

  return (
    <div className="flex-1 min-h-screen bg-base-100 text-base-content">
      {/* Top Bar */}
      <div className="sticky top-0 z-10 bg-base-100 border-b border-base-300">
        <div className="flex items-center justify-between h-14 px-4">
          {/* Left section */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-sm text-base-content/70">
              <Lock className="w-3.5 h-3.5" />
              <span>Private</span>
              <ChevronRight className="w-3.5 h-3.5" />
              <span>{title}</span>
            </div>
          </div>

          {/* Right section */}
          <div className="flex items-center gap-1">
            <ThemeSwitcher pageId={pageId} />
            <Button variant="ghost" size="sm" className="text-xs gap-1.5 h-8 hover:bg-base-200 text-base-content">
              <Clock className="w-3.5 h-3.5" />
              {lastSaved ? `Edited ${lastSaved.toLocaleString()}` : 'Not saved yet'}
            </Button>
            <Button variant="ghost" size="sm" className="text-xs gap-1.5 h-8 hover:bg-base-200 text-base-content">
              <MessageSquare className="w-3.5 h-3.5" />
              Comment
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-8 hover:bg-base-200 text-base-content",
                isFavorite && "text-warning"
              )}
              onClick={toggleFavorite}
            >
              <Star className="w-3.5 h-3.5" fill={isFavorite ? "currentColor" : "none"} />
            </Button>
            <Button variant="ghost" size="sm" className="text-xs gap-1.5 h-8 hover:bg-base-200 text-base-content">
              <Share2 className="w-3.5 h-3.5" />
              Share
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 hover:bg-base-200 text-base-content">
                  <MoreHorizontal className="w-3.5 h-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-base-100 border-base-300">
                <DropdownMenuItem className="text-base-content hover:bg-base-200">
                  <FileText className="w-4 h-4 mr-2" />
                  Export
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="text-error hover:bg-base-200"
                  onClick={deletePage}
                >
                  <Trash className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Editor Content */}
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div 
          className="relative group cursor-text mb-4"
          onClick={() => !isEditingTitle && setIsEditingTitle(true)}
        >
          {isEditingTitle ? (
            <input
              type="text"
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              onBlur={handleTitleBlur}
              onKeyDown={handleTitleKeyDown}
              className="w-full text-4xl font-bold bg-transparent border-none outline-none mb-4 placeholder-base-content/50 text-base-content focus:ring-2 focus:ring-primary/20 rounded-lg"
              placeholder="Untitled"
              autoFocus
            />
          ) : (
            <h1 className="text-4xl font-bold text-base-content group-hover:bg-base-200/50 rounded-lg py-1 px-2 -mx-2 transition-colors">
              {title || 'Untitled'}
            </h1>
          )}
        </div>
        
        <TiptapEditor 
          content={content}
          onUpdate={handleUpdate}
        />
      </div>
    </div>
  );
}