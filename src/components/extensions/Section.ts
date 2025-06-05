import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    section: {
      /**
       * Add a section
       */
      addSection: () => ReturnType;
    };
  }
}

export const Section = Node.create({
  name: 'section',

  group: 'block',

  content: 'block+',

  parseHTML() {
    return [
      {
        tag: 'div[class=editor-section]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { class: 'editor-section' }), 0];
  },

  addCommands() {
    return {
      addSection:
        () =>
        ({ commands, state }) => {
          const { $from } = state.selection;
          const pos = $from.end();

          return commands.insertContentAt(pos, {
            type: this.name,
            content: [
              {
                type: 'paragraph',
              },
            ],
          });
        },
    };
  },

  addKeyboardShortcuts() {
    return {
      'Mod-Alt-s': () => this.editor.commands.addSection(),
    };
  },
}); 