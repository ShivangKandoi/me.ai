import { Editor } from '@tiptap/react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Type,
  Hash,
  List,
  CheckSquare,
  Heading1,
  Heading2,
  Heading3,
  ListOrdered,
  Quote,
  Code2,
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { useState, useRef } from 'react';

interface CommandItem {
  title: string;
  description: string;
  icon: any;
  command: (editor: Editor) => void;
  shortcut?: string;
}

interface EditorCommandMenuProps {
  editor: Editor | null;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  position: { top: number; left: number };
}

const items: CommandItem[] = [
  {
    title: 'Heading 1',
    description: 'Large section heading',
    icon: Heading1,
    command: (editor) => {
      editor
        .chain()
        .focus()
        .clearNodes()
        .setHeading({ level: 1 })
        .run();
    },
    shortcut: 'H1',
  },
  {
    title: 'Heading 2',
    description: 'Medium section heading',
    icon: Heading2,
    command: (editor) => {
      editor
        .chain()
        .focus()
        .clearNodes()
        .setHeading({ level: 2 })
        .run();
    },
    shortcut: 'H2',
  },
  {
    title: 'Heading 3',
    description: 'Small section heading',
    icon: Heading3,
    command: (editor) => {
      editor
        .chain()
        .focus()
        .clearNodes()
        .setHeading({ level: 3 })
        .run();
    },
    shortcut: 'H3',
  },
  {
    title: 'Bullet List',
    description: 'Create a simple bullet list',
    icon: List,
    command: (editor) => {
      editor
        .chain()
        .focus()
        .clearNodes()
        .toggleBulletList()
        .run();
    },
  },
  {
    title: 'Numbered List',
    description: 'Create a numbered list',
    icon: ListOrdered,
    command: (editor) => {
      editor
        .chain()
        .focus()
        .clearNodes()
        .toggleOrderedList()
        .run();
    },
  },
  {
    title: 'Quote',
    description: 'Add a quote block',
    icon: Quote,
    command: (editor) => {
      editor
        .chain()
        .focus()
        .clearNodes()
        .toggleBlockquote()
        .run();
    },
  },
  {
    title: 'Code Block',
    description: 'Add a code block',
    icon: Code2,
    command: (editor) => {
      editor
        .chain()
        .focus()
        .clearNodes()
        .toggleCodeBlock()
        .run();
    },
  },
  {
    title: 'Task List',
    description: 'Add a task list',
    icon: CheckSquare,
    command: (editor) => {
      editor
        .chain()
        .focus()
        .clearNodes()
        .toggleTaskList()
        .run();
    },
  },
];

export function EditorCommandMenu({ editor, isOpen, setIsOpen, position }: EditorCommandMenuProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredItems = items.filter((item) =>
    item.title.toLowerCase().includes(query.toLowerCase()) ||
    item.description.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (item: CommandItem) => {
    if (editor) {
      item.command(editor);
      setIsOpen(false);
      setQuery('');
      setSelectedIndex(0);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((i) => (i + 1) % filteredItems.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((i) => (i - 1 + filteredItems.length) % filteredItems.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const selectedItem = filteredItems[selectedIndex];
      if (selectedItem) {
        handleSelect(selectedItem);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setQuery('');
      setSelectedIndex(0);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed z-50 w-[300px] bg-base-100 rounded-xl shadow-xl border border-base-200 overflow-hidden"
      style={{
        top: position.top,
        left: position.left,
      }}
    >
      <div className="p-2">
        <input
          type="text"
          placeholder="Type a command..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full px-3 py-2 text-sm bg-base-100 rounded-lg border-none outline-none text-base-content placeholder-base-content/50"
          onKeyDown={handleKeyDown}
          ref={inputRef}
          autoFocus
        />
      </div>

      <div className="max-h-[300px] overflow-y-auto">
        {filteredItems.length === 0 ? (
          <div className="px-4 py-3 text-sm text-base-content/70 text-center">
            No commands found
          </div>
        ) : (
          <div className="p-1">
            {filteredItems.map((item, index) => (
              <button
                key={item.title}
                className={cn(
                  "w-full px-3 py-2 text-sm rounded-lg text-left flex items-center gap-3",
                  index === selectedIndex
                    ? "bg-primary text-primary-content"
                    : "text-base-content hover:bg-base-200"
                )}
                onClick={() => handleSelect(item)}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <div className={cn(
                  "flex items-center justify-center w-6 h-6 rounded",
                  index === selectedIndex
                    ? "bg-primary-content/20 text-primary-content"
                    : "bg-base-200 text-base-content"
                )}>
                  <item.icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{item.title}</div>
                  <div className={cn(
                    "text-xs truncate",
                    index === selectedIndex
                      ? "text-primary-content/70"
                      : "text-base-content/70"
                  )}>
                    {item.description}
                  </div>
                </div>
                {item.shortcut && (
                  <div className={cn(
                    "text-xs px-1.5 py-0.5 rounded font-medium",
                    index === selectedIndex
                      ? "bg-primary-content/20 text-primary-content"
                      : "bg-base-200 text-base-content/70"
                  )}>
                    {item.shortcut}
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 