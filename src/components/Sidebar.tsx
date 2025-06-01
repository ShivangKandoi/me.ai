'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
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
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';

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

  const privatePages = [
    { icon: FileText, label: 'New page', href: '/new' },
    { icon: Calendar, label: 'Plan for Next', href: '/plan' },
    { icon: MessageSquare, label: 'Zemon', href: '/zemon' },
    { icon: LayoutGrid, label: 'ME.ai', href: '/me-ai' },
    { icon: File, label: 'Sample', href: '/sample' },
    { icon: FileText, label: 'Getting Started', href: '/getting-started' },
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

            {/* Private Section */}
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
                    <button className="w-full flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 hover:bg-base-300 text-sm">
                      <div className="flex items-center gap-2">
                        <Plus className="w-4 h-4 shrink-0" />
                        New page
                      </div>
                      <X className="w-3 h-3 opacity-0 group-hover:opacity-100" />
                    </button>
                  </li>
                  {privatePages.map((page) => (
                    <li key={page.href}>
                      <Link
                        href={page.href}
                        className={cn(
                          "group flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 hover:bg-base-300 text-sm",
                          pathname === page.href && "bg-base-300"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <page.icon className="w-4 h-4 shrink-0" />
                          {page.label}
                        </div>
                        <X className="w-3 h-3 opacity-0 group-hover:opacity-100" />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Bottom Section */}
          <div className="border-t border-base-300 p-3 space-y-1">
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
          </div>

          {/* Footer Actions */}
          <div className="p-3 flex items-center justify-between">
            <div className="flex items-center gap-1">
              <button className="p-1 hover:bg-base-300 rounded-lg">
                <Plus className="h-4 w-4" />
              </button>
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