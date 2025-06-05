'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Search,
  Home,
  Inbox,
  File,
  Settings,
  Trash2,
  Plus,
  Users,
  ChevronDown,
  MessageSquare,
  Calendar,
  FileText,
  LayoutGrid,
  ChevronLeft,
  Menu,
  X,
  Pencil,
  HelpCircle,
  Lock,
  Star,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { getSupabaseBrowser } from '@/lib/supabase'
import type { Database } from '@/types/database';
import { toast } from 'sonner';
import type { AuthError, Session, SupabaseClient } from '@supabase/supabase-js';

type Page = Database['public']['Tables']['pages']['Row'];

interface SidebarProps {
  className?: string;
  isCollapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}

export function Sidebar({ className, isCollapsed = false, onCollapsedChange }: SidebarProps) {
  const pathname = usePathname();
  const [isPrivateExpanded, setIsPrivateExpanded] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const supabase = getSupabaseBrowser();
  const router = useRouter();

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setIsAuthenticated(!!session);
        
        // If authenticated, immediately start fetching pages to reduce wait time
        if (session) {
          fetchPages(session.user.id);
        } else {
          setLoading(false);
        }
        
        // Subscribe to auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: string, session: Session | null) => {
          const isAuth = !!session;
          setIsAuthenticated(isAuth);
          
          // If auth state changed to logged in, fetch pages
          if (isAuth && session) {
            fetchPages(session.user.id);
          } else {
            setPages([]);
            setLoading(false);
          }
        });

        return () => subscription.unsubscribe();
      } catch (error) {
        console.error('Error checking auth status:', error);
        setIsAuthenticated(false);
        setLoading(false);
      }
    };

    checkAuth();
  }, []);
  
  // Function to fetch pages - separated for reuse
  const fetchPages = async (userId: string) => {
    if (!userId) {
      setLoading(false);
      return;
    }
    
    let retryCount = 0;
    const maxRetries = 3;
    
    while (retryCount < maxRetries) {
      try {
        setLoading(true);
        const { data: pages, error } = await supabase
          .from('pages')
          .select('*')
          .eq('owner_id', userId)
          .order('updated_at', { ascending: false });

        if (error) {
          if (error.code === '42P17') {
            // If it's a policy recursion error, wait a bit before retrying
            await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
            retryCount++;
            continue;
          }
          throw error;
        }

        setPages(pages || []);
        
        // If no pages exist, create a default page
        if (!pages?.length) {
          const newPage = await createNewPage(userId);
          if (newPage) {
            setPages([newPage]);
          }
        }
        
        // Set up realtime subscription
        setupRealtimeSubscription(userId);
        break; // Success, exit the retry loop
        
      } catch (error) {
        console.error('Error fetching pages:', error);
        if (retryCount === maxRetries - 1) {
          // Only show error to user on final retry
          toast.error('Failed to fetch pages. Please try again.');
        }
        retryCount++;
      } finally {
        if (retryCount === maxRetries) {
          setLoading(false);
        }
      }
    }
  };

  // Setup realtime subscription for page changes
  const setupRealtimeSubscription = (userId: string) => {
    const channel = supabase
      .channel('pages_changes')
      .on('postgres_changes', 
        {
          event: '*',
          schema: 'public',
          table: 'pages',
          filter: `owner_id=eq.${userId}`
        }, 
        (payload: { eventType: string; new: Page; old: { id: string } }) => {
          if (payload.eventType === 'INSERT') {
            setPages(current => [payload.new as Page, ...current]);
          } else if (payload.eventType === 'UPDATE') {
            setPages(current => 
              current.map(page => 
                page.id === payload.new.id ? { ...page, ...payload.new } : page
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setPages(current => 
              current.filter(page => page.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    return channel;
  };

  const createNewPage = async (userId?: string) => {
    try {
      // If userId is not provided, get it from the session
      let ownerId = userId;
      if (!ownerId) {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user?.id) {
          toast.error('Please sign in to create a new page');
          router.push('/login');
          return null;
        }
        ownerId = session.user.id;
      }

      const timestamp = Date.now();
      const defaultTitle = 'Untitled';
      const slug = `${defaultTitle.toLowerCase().replace(/\s+/g, '-')}-${timestamp}`;
      
      // Create the new page with retry logic
      let attempts = 0;
      const maxAttempts = 3;
      let page = null;
      
      while (attempts < maxAttempts && !page) {
        attempts++;
        try {
          const { data, error } = await supabase
            .from('pages')
            .insert([
              {
                title: defaultTitle,
                content: {},
                slug,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                is_favorite: false,
                owner_id: ownerId,
              }
            ])
            .select()
            .single();

          if (error) {
            console.error(`Attempt ${attempts} failed:`, error);
            if (attempts === maxAttempts) throw error;
            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, 500));
          } else {
            page = data;
          }
        } catch (insertError) {
          console.error(`Insert attempt ${attempts} exception:`, insertError);
          if (attempts === maxAttempts) throw insertError;
        }
      }

      if (page) {
        // Only navigate if this is triggered by a user action (not during initial load)
        if (!userId) {
          router.push(`/${page.slug}`);
        }
        return page;
      }
      return null;
    } catch (error) {
      console.error('Error creating new page:', error);
      toast.error('Failed to create new page. Please try again.');
      return null;
    }
  };

  const handleCollapse = () => {
    onCollapsedChange?.(!isCollapsed);
  };

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const mainNavItems = [
    { icon: Search, label: 'Search', href: '/search' },
    { icon: Home, label: 'Home', href: '/' },
    { icon: Inbox, label: 'Inbox', href: '/inbox' },
  ];

  const sidebarWidth = isCollapsed ? 'w-[50px]' : 'w-64';
  const mobileClass = isMobile ? (isOpen ? 'translate-x-0' : '-translate-x-full') : 'translate-x-0';

  if (isCollapsed) {
    return (
      <div className="fixed top-0 left-0 z-40 h-14 px-3 flex items-center">
        <Button
          variant="ghost"
          size="icon"
          className="hover:bg-base-300 rounded-lg"
          onClick={handleCollapse}
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>
    );
  }

  return (
    <>
      {/* Mobile Menu Button */}
      {isMobile && (
        <Button
          variant="ghost"
          size="icon"
          className="fixed top-4 left-4 z-50 md:hidden"
          onClick={() => setIsOpen(!isOpen)}
        >
          <Menu className="h-6 w-6" />
        </Button>
      )}

      {/* Backdrop for mobile */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 left-0 z-40 h-screen bg-base-200 text-base-content transition-all duration-300 border-r border-base-300",
          sidebarWidth,
          mobileClass,
          className
        )}
      >
        {/* User Section */}
        <div className="h-14 flex items-center justify-between px-3 border-b border-base-300">
          {isAuthenticated ? (
            <div className="flex items-center gap-2 flex-1">
              <button className="flex items-center gap-2 hover:bg-base-300 rounded-lg px-2 py-1.5 flex-1 group">
                <div className="avatar placeholder shrink-0">
                  <div className="bg-neutral text-neutral-content rounded-lg w-6 h-6">
                    <span className="text-xs">S</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-1">
                  <span className="text-sm font-medium truncate">SHIVANG</span>
                  <ChevronDown className="w-4 h-4 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </button>
              <div className="flex items-center gap-1">
                <button 
                  className="p-1 hover:bg-base-300 rounded-lg"
                  title="Edit"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button 
                  className="p-1 hover:bg-base-300 rounded-lg"
                  onClick={handleCollapse}
                  title="Close sidebar"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 flex-1">
              <Link
                href="/login"
                className="flex items-center gap-2 hover:bg-base-300 rounded-lg px-2 py-1.5 flex-1"
              >
                <span className="text-sm">Sign in</span>
              </Link>
              <button 
                className="p-1 hover:bg-base-300 rounded-lg"
                onClick={handleCollapse}
                title="Close sidebar"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* Main Navigation */}
        <nav className="flex flex-col h-[calc(100vh-3.5rem)]">
          <div className="flex-1 overflow-y-auto">
            <ul className="menu menu-sm px-2 py-2 gap-1">
              {mainNavItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-base-300 text-sm",
                      pathname === item.href && "bg-base-300"
                    )}
                  >
                    <item.icon className="w-4 h-4 shrink-0" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Private Section - Only show if authenticated */}
            {isAuthenticated && (
              <div className="px-2 mt-2">
                <button
                  onClick={() => setIsPrivateExpanded(!isPrivateExpanded)}
                  className="w-full flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-base-300 rounded-lg text-base-content/70"
                >
                  <div className="flex items-center gap-2">
                    <ChevronDown
                      className={cn(
                        "w-4 h-4 shrink-0 transition-transform",
                        !isPrivateExpanded && "-rotate-90"
                      )}
                    />
                    <Lock className="w-4 h-4 shrink-0" />
                    <span>Private</span>
                  </div>
                </button>
                {isPrivateExpanded && (
                  <ul className="menu menu-sm gap-1 mt-1">
                    {/* New Page Button */}
                    <li>
                      <button 
                        onClick={() => createNewPage()}
                        className="w-full flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 hover:bg-base-300 text-sm"
                        disabled={loading}
                      >
                        <div className="flex items-center gap-2">
                          {loading ? (
                            <>
                              <span className="loading loading-spinner loading-sm"></span>
                              Creating...
                            </>
                          ) : (
                            <>
                              <Plus className="w-4 h-4 shrink-0" />
                              New page
                            </>
                          )}
                        </div>
                      </button>
                    </li>
                    {loading ? (
                      <div className="flex justify-center py-4">
                        <span className="loading loading-spinner loading-sm"></span>
                      </div>
                    ) : (
                      pages.map((page) => (
                        <li key={page.id}>
                          <Link
                            href={`/${page.slug}`}
                            className={cn(
                              "group flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 hover:bg-base-300 text-sm",
                              pathname === `/${page.slug}` && "bg-base-300"
                            )}
                          >
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 shrink-0" />
                              <span className="truncate">{page.title}</span>
                            </div>
                            {page.is_favorite && (
                              <div className="text-warning">
                                <Star className="w-3 h-3 fill-current" />
                              </div>
                            )}
                          </Link>
                        </li>
                      ))
                    )}
                  </ul>
                )}
              </div>
            )}
          </div>

          {/* Bottom Section */}
          <div className="border-t border-base-300 p-3 space-y-1">
            {isAuthenticated ? (
              <>
                <button className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-base-300 text-sm">
                  <Users className="w-4 h-4 shrink-0" />
                  <span>Invite members</span>
                </button>
                <button className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-base-300 text-sm">
                  <Settings className="w-4 h-4 shrink-0" />
                  <span>Settings</span>
                </button>
                <button className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-base-300 text-sm text-error">
                  <Trash2 className="w-4 h-4 shrink-0" />
                  <span>Trash</span>
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-base-300 text-sm"
              >
                <Lock className="w-4 h-4 shrink-0" />
                <span>Sign in to create pages</span>
              </Link>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-3 flex items-center justify-between">
            <div className="flex items-center gap-1">
              {isAuthenticated && (
                <button className="p-1 hover:bg-base-300 rounded-lg">
                  <Plus className="h-4 w-4" />
                </button>
              )}
            </div>
            <button className="p-1 hover:bg-base-300 rounded-lg">
              <HelpCircle className="h-4 w-4" />
            </button>
          </div>
        </nav>
      </aside>
    </>
  );
}