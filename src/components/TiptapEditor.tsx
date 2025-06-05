import { useState } from 'react';
import { useEditor, EditorContent, BubbleMenu, JSONContent } from '@tiptap/react';
import { TextSelection } from '@tiptap/pm/state';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Highlight from '@tiptap/extension-highlight';
import Typography from '@tiptap/extension-typography';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import { Section } from './extensions/Section';
import { Button } from "@/components/ui/button";
import {
  Bold,
  Italic,
  UnderlineIcon,
  Strikethrough,
  Code,
  Link2,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from 'lucide-react';
import { EditorCommandMenu } from './EditorCommandMenu';
import { cn } from '@/lib/utils';

// Default content structure for new documents
const DEFAULT_CONTENT: JSONContent = {
  type: 'doc',
  content: [
    {
      type: 'paragraph',
    },
  ],
};

interface TiptapEditorProps {
  content?: JSONContent;
  onUpdate?: (content: JSONContent) => void;
}

// Separate the styles for better maintainability
const editorStyles = `
  .ProseMirror {
    min-height: 200px;
    outline: none;
    color: hsl(var(--bc));
    
    &:focus {
      outline: none;
    }

    > * + * {
      margin-top: 0.75rem;
    }

    p.is-empty::before {
      content: attr(data-placeholder);
      float: left;
      color: hsl(var(--bc) / 0.5);
      pointer-events: none;
      height: 0;
    }

    h1, h2, h3 {
      line-height: 1.1;
      margin-bottom: 0.75rem;
      color: hsl(var(--bc));
      font-weight: 600;
    }

    h1 { font-size: 2rem; }
    h2 { font-size: 1.5rem; }
    h3 { font-size: 1.25rem; }

    ul, ol {
      padding-left: 1.25rem;
      margin-bottom: 0.75rem;
    }

    ul[data-type="taskList"] {
      list-style: none;
      padding: 0;

      li {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;

        > label {
          user-select: none;
          margin: 0.25rem 0;
        }

        > div {
          flex: 1;
          margin: 0.25rem 0;
          p { margin: 0; }
        }
      }
    }

    blockquote {
      padding-left: 1rem;
      border-left: 2px solid hsl(var(--bc) / 0.2);
      color: hsl(var(--bc) / 0.8);
      font-style: italic;
    }

    code {
      background: hsl(var(--b2));
      border-radius: 0.25rem;
      padding: 0.2rem 0.4rem;
      box-decoration-break: clone;
    }

    pre {
      background: hsl(var(--b2));
      border-radius: 0.5rem;
      padding: 0.75rem 1rem;
      margin: 0.75rem 0;
      
      code {
        background: none;
        padding: 0;
        font-size: 0.875rem;
        color: inherit;
      }
    }
  }

  .editor-section {
    position: relative;
    padding: 0.5rem 0;
    transition: all 0.2s ease;

    &:hover::before {
      content: "";
      position: absolute;
      left: -1.5rem;
      top: 0.5rem;
      width: 0.25rem;
      height: calc(100% - 1rem);
      background: hsl(var(--bc) / 0.2);
      border-radius: 0.25rem;
      transition: background 0.2s ease;
    }

    &:focus-within::before {
      background: hsl(var(--p));
    }

    & + & {
      border-top: 1px solid hsl(var(--bc) / 0.1);
    }
  }
`;

export function TiptapEditor({ content, onUpdate }: TiptapEditorProps) {
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [commandPosition, setCommandPosition] = useState({ top: 0, left: 0 });

  // Validate incoming content
  const initialContent = content && typeof content === 'object' && content.type === 'doc' && Array.isArray(content.content)
    ? content
    : DEFAULT_CONTENT;

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
          HTMLAttributes: {
            class: 'font-semibold',
          },
        },
        bulletList: {
          keepMarks: true,
          HTMLAttributes: {
            class: 'list-disc',
          },
        },
        orderedList: {
          keepMarks: true,
          HTMLAttributes: {
            class: 'list-decimal',
          },
        },
        blockquote: {
          HTMLAttributes: {
            class: 'not-italic border-l-2 border-base-content/20 pl-4 text-base-content/80',
          },
        },
        codeBlock: {
          HTMLAttributes: {
            class: 'rounded-md bg-base-200 p-4 font-mono text-sm',
          },
        },
        code: {
          HTMLAttributes: {
            class: 'rounded bg-base-200 px-1.5 py-0.5 font-mono text-sm',
          },
        },
      }),
      Section.configure({
        HTMLAttributes: {
          class: 'editor-section',
        },
      }),
      Placeholder.configure({
        placeholder: ({ node }) => {
          if (node.type.name === 'heading') {
            return 'Heading';
          }
          return "Type '/' for commands";
        },
        includeChildren: true,
      }),
      TaskList.configure({
        HTMLAttributes: {
          class: 'not-prose pl-0',
        },
      }),
      TaskItem.configure({
        nested: true,
        HTMLAttributes: {
          class: 'flex items-start gap-2',
        },
      }),
      Highlight.configure({
        HTMLAttributes: {
          class: 'bg-primary/20',
        },
      }),
      Typography,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline underline-offset-4',
          target: '_blank',
          rel: 'noopener noreferrer',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
        alignments: ['left', 'center', 'right'],
      }),
      Underline,
    ],
    content: initialContent,
    onUpdate: ({ editor }) => {
      const newContent = editor.getJSON();
      if (newContent && typeof newContent === 'object' && newContent.type === 'doc' && Array.isArray(newContent.content)) {
        onUpdate?.(newContent);
      } else {
        console.warn('Invalid editor content structure:', newContent);
        onUpdate?.(DEFAULT_CONTENT);
      }
    },
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-base max-w-none',
          'prose-headings:mb-3',
          'prose-p:my-2',
          'prose-ul:my-2',
          'prose-ol:my-2',
          'prose-blockquote:my-2',
          'prose-pre:my-2',
        ),
      },
      handleKeyDown: (view, event) => {
        // Handle slash commands
        if (event.key === '/' && !isCommandOpen) {
          const { state } = view;
          const { from } = state.selection;
          const coords = view.coordsAtPos(from);
          
          setCommandPosition({
            top: coords.bottom + window.scrollY + 10,
            left: coords.left + window.scrollX,
          });
          setIsCommandOpen(true);
          return true;
        }

        // Handle Enter on empty lines to create new sections
        if (event.key === 'Enter' && !event.shiftKey) {
          const { state } = view;
          const selection = state.selection as TextSelection;
          
          if (selection.empty && selection.$cursor) {
            const node = selection.$cursor.parent;
            if (node.type.name === 'paragraph' && node.content.size === 0) {
              editor?.commands.addSection();
              return true;
            }
          }
        }

        return false;
      },
    },
    // Fix SSR hydration issues
    enableCoreExtensions: true,
    autofocus: 'end',
    editable: true,
    injectCSS: true,
    immediatelyRender: false,
  });

  if (!editor) {
    return null;
  }

  const BubbleMenuButton = ({
    onClick,
    isActive,
    icon: Icon,
  }: {
    onClick: () => void;
    isActive: boolean;
    icon: any;
  }) => (
    <Button
      size="sm"
      variant="ghost"
      onClick={onClick}
      data-active={isActive}
      className={cn(
        "h-8 w-8 p-1.5",
        "hover:bg-base-200 text-base-content",
        "data-[active=true]:bg-base-200"
      )}
    >
      <Icon className="h-full w-full" />
    </Button>
  );

  return (
    <div className="relative text-base-content">
      <style>{editorStyles}</style>

      <BubbleMenu 
        editor={editor} 
        tippyOptions={{ duration: 100 }} 
        className="bg-base-100 rounded-lg shadow-lg border border-base-300 p-1 flex gap-1"
      >
        <BubbleMenuButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
          icon={Bold}
        />
        <BubbleMenuButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          icon={Italic}
        />
        <BubbleMenuButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editor.isActive('underline')}
          icon={UnderlineIcon}
        />
        <BubbleMenuButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={editor.isActive('strike')}
          icon={Strikethrough}
        />
        <BubbleMenuButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          isActive={editor.isActive('code')}
          icon={Code}
        />
        <BubbleMenuButton
          onClick={() => {
            const previousUrl = editor.getAttributes('link').href;
            const url = window.prompt('Enter URL', previousUrl);
            if (url === null) return; // Cancelled
            if (url === '') {
              editor.chain().focus().unsetLink().run();
            } else {
              editor.chain().focus().setLink({ href: url }).run();
            }
          }}
          isActive={editor.isActive('link')}
          icon={Link2}
        />
        <BubbleMenuButton
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          isActive={editor.isActive({ textAlign: 'left' })}
          icon={AlignLeft}
        />
        <BubbleMenuButton
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          isActive={editor.isActive({ textAlign: 'center' })}
          icon={AlignCenter}
        />
        <BubbleMenuButton
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          isActive={editor.isActive({ textAlign: 'right' })}
          icon={AlignRight}
        />
      </BubbleMenu>

      <EditorContent editor={editor} />

      <EditorCommandMenu
        editor={editor}
        isOpen={isCommandOpen}
        setIsOpen={setIsCommandOpen}
        position={commandPosition}
      />
    </div>
  );
} 