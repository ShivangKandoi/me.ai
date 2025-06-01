'use client';

import { useState, useEffect, useRef } from 'react';
import {
  MoreHorizontal,
  Share2,
  Star,
  Clock,
  Plus,
  ChevronRight,
  MessageSquare,
  Lock,
  Type,
  Hash,
  List,
  Bot,
  CalendarDays,
  Database,
  FileText,
  Palette,
  MoreVertical,
  Trash,
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { cn } from "@/lib/utils";

interface PageEditorProps {
  isCollapsed?: boolean;
}

export function PageEditor({ isCollapsed = false }: PageEditorProps) {
  const [title, setTitle] = useState('Untitled');
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [commandPosition, setCommandPosition] = useState({ top: 0, left: 0 });
  const [content, setContent] = useState('');
  const editorRef = useRef<HTMLDivElement>(null);
  const commandRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (commandRef.current && !commandRef.current.contains(event.target as Node)) {
        setIsCommandOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const getCaretCoordinates = () => {
    const selection = window.getSelection();
    if (!selection || !selection.rangeCount) return null;

    const range = selection.getRangeAt(0);
    const rects = range.getClientRects();
    if (rects.length === 0) {
      // If no client rects, create a temporary span at caret position
      const span = document.createElement('span');
      range.insertNode(span);
      const rect = span.getBoundingClientRect();
      span.parentNode?.removeChild(span);
      return rect;
    }
    return rects[0];
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === '/') {
      const caretRect = getCaretCoordinates();
      if (caretRect) {
        // Position the menu slightly below and to the right of the caret
        setCommandPosition({
          top: caretRect.bottom + window.scrollY + 5,
          left: caretRect.left + window.scrollX
        });
        // Delay opening the command menu to allow the slash to be typed
        setTimeout(() => {
          setIsCommandOpen(true);
        }, 0);
      }
    } else if (e.key === 'Escape' && isCommandOpen) {
      e.preventDefault();
      setIsCommandOpen(false);
    }
  };

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    setContent(e.currentTarget.textContent || '');
  };

  const handleCommandSelect = (value: string) => {
    setIsCommandOpen(false);
  };

  return (
    <div className="flex-1 min-h-screen bg-base-100">
      {/* Top Bar */}
      <div className="sticky top-0 z-10 bg-base-100 border-b border-base-300">
        <div className="flex items-center justify-between h-14 px-4">
          {/* Left section */}
          <div className={cn(
            "flex items-center gap-2",
            isCollapsed ? "pl-14" : "pl-0"
          )}>
            <div className="flex items-center gap-1 text-sm text-base-content/70">
              <Lock className="w-3.5 h-3.5" />
              <span>Private</span>
              <ChevronRight className="w-3.5 h-3.5" />
              <span>{title}</span>
            </div>
          </div>

          {/* Right section */}
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" className="text-xs gap-1.5 h-8">
              <Clock className="w-3.5 h-3.5" />
              Edited just now
            </Button>
            <Button variant="ghost" size="sm" className="text-xs gap-1.5 h-8">
              <MessageSquare className="w-3.5 h-3.5" />
              Comment
            </Button>
            <Button variant="ghost" size="sm" className="h-8">
              <Star className="w-3.5 h-3.5" />
            </Button>
            <Button variant="ghost" size="sm" className="text-xs gap-1.5 h-8">
              <Share2 className="w-3.5 h-3.5" />
              Share
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8">
                  <MoreHorizontal className="w-3.5 h-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem>
                  <FileText className="w-4 h-4 mr-2" />
                  Export
                </DropdownMenuItem>
                <DropdownMenuItem className="text-red-600">
                  <Trash className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Editor Content */}
      <div className="max-w-3xl mx-auto px-4 py-12" ref={editorRef}>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full text-4xl font-bold bg-transparent border-none outline-none mb-4 placeholder-base-content/50"
          placeholder="Untitled"
        />
        <div 
          className="prose prose-lg max-w-none min-h-[200px] outline-none"
          contentEditable
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          suppressContentEditableWarning
        >
          {!content && (
            <div className="text-base-content/50 pointer-events-none absolute">
              Type '/' for commands...
            </div>
          )}
        </div>
      </div>

      {/* Inline Command Menu */}
      {isCommandOpen && (
        <div
          ref={commandRef}
          className="fixed z-50 w-80"
          style={{
            top: `${commandPosition.top}px`,
            left: `${commandPosition.left}px`,
          }}
        >
          <Command className="rounded-lg border shadow-md">
            <CommandInput placeholder="Type a command..." className="h-9" autoFocus />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup heading="Suggested">
                <CommandItem 
                  className="flex items-center gap-2 h-11"
                  onSelect={() => handleCommandSelect('ai-notes')}
                >
                  <Bot className="w-4 h-4" />
                  <div className="flex flex-col">
                    <span>AI Meeting Notes</span>
                    <span className="text-xs text-base-content/50">Beta</span>
                  </div>
                </CommandItem>
              </CommandGroup>
              <CommandGroup heading="Basic blocks">
                <CommandItem 
                  className="h-11"
                  onSelect={() => handleCommandSelect('text')}
                >
                  <Type className="w-4 h-4 mr-2" />
                  Text
                </CommandItem>
                <CommandItem className="h-11">
                  <Hash className="w-4 h-4 mr-2" />
                  <div className="flex flex-col">
                    <span>Heading 1</span>
                    <span className="text-xs text-base-content/50"># </span>
                  </div>
                </CommandItem>
                <CommandItem className="h-11">
                  <Hash className="w-4 h-4 mr-2" />
                  <div className="flex flex-col">
                    <span>Heading 2</span>
                    <span className="text-xs text-base-content/50">## </span>
                  </div>
                </CommandItem>
                <CommandItem className="h-11">
                  <Hash className="w-4 h-4 mr-2" />
                  <div className="flex flex-col">
                    <span>Heading 3</span>
                    <span className="text-xs text-base-content/50">### </span>
                  </div>
                </CommandItem>
                <CommandItem className="h-11">
                  <List className="w-4 h-4 mr-2" />
                  <span>Bulleted list</span>
                  <span className="ml-auto text-xs text-base-content/50">- </span>
                </CommandItem>
              </CommandGroup>
              <CommandGroup heading="Get started with">
                <CommandItem className="h-11">
                  <Bot className="w-4 h-4 mr-2" />
                  Ask AI
                </CommandItem>
                <CommandItem className="h-11">
                  <CalendarDays className="w-4 h-4 mr-2" />
                  Meet
                </CommandItem>
                <CommandItem className="h-11">
                  <Database className="w-4 h-4 mr-2" />
                  Database
                </CommandItem>
                <CommandItem className="h-11">
                  <FileText className="w-4 h-4 mr-2" />
                  Form
                </CommandItem>
                <CommandItem className="h-11">
                  <Palette className="w-4 h-4 mr-2" />
                  Templates
                </CommandItem>
                <CommandItem className="h-11">
                  <MoreVertical className="w-4 h-4 mr-2" />
                  More
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </div>
      )}
    </div>
  );
} 