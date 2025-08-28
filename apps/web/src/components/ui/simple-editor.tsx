'use client';

import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
// Icons temporarily replaced with text - TODO: fix icon imports
const BoldIcon = (props: any) => <span {...props}>B</span>;
const ItalicIcon = (props: any) => <span {...props}>I</span>;
const UnderlineIcon = (props: any) => <span {...props}>U</span>;
const StrikethroughIcon = (props: any) => <span {...props}>S</span>;
const UndoIcon = (props: any) => <span {...props}>↶</span>;
const RedoIcon = (props: any) => <span {...props}>↷</span>;
const ListIcon = (props: any) => <span {...props}>•</span>;
const OrderedListIcon = (props: any) => <span {...props}>1.</span>;
const QuoteIcon = (props: any) => <span {...props}>❝</span>;

interface SimpleEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
}

export const SimpleEditor: React.FC<SimpleEditorProps> = ({
  content,
  onChange,
  placeholder = 'Bắt đầu viết nội dung...',
  className = ''
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none min-h-[300px] p-4',
      },
    },
  });

  if (!editor) {
    return (
      <div className="border border-gray-300 rounded-lg p-4 min-h-[300px] flex items-center justify-center">
        <div className="text-gray-500">Loading editor...</div>
      </div>
    );
  }

  return (
    <div className={`border border-gray-300 rounded-lg overflow-hidden ${className}`}>
      {/* Simplified Toolbar */}
      <div className="border-b border-gray-300 p-3 bg-gray-50 flex gap-1">
        {/* Text Formatting */}
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded hover:bg-gray-200 ${
            editor.isActive('bold') ? 'bg-gray-200' : ''
          }`}
          title="Bold (Ctrl+B)"
        >
          <BoldIcon className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded hover:bg-gray-200 ${
            editor.isActive('italic') ? 'bg-gray-200' : ''
          }`}
          title="Italic (Ctrl+I)"
        >
          <ItalicIcon className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`p-2 rounded hover:bg-gray-200 ${
            editor.isActive('strike') ? 'bg-gray-200' : ''
          }`}
          title="Strikethrough"
        >
          <StrikethroughIcon className="w-4 h-4" />
        </button>

        {/* Divider */}
        <div className="w-px bg-gray-300 mx-2"></div>

        {/* Headings */}
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`px-3 py-2 rounded text-sm font-medium hover:bg-gray-200 ${
            editor.isActive('heading', { level: 1 }) ? 'bg-gray-200' : ''
          }`}
          title="Heading 1"
        >
          H1
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`px-3 py-2 rounded text-sm font-medium hover:bg-gray-200 ${
            editor.isActive('heading', { level: 2 }) ? 'bg-gray-200' : ''
          }`}
          title="Heading 2"
        >
          H2
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`px-3 py-2 rounded text-sm font-medium hover:bg-gray-200 ${
            editor.isActive('heading', { level: 3 }) ? 'bg-gray-200' : ''
          }`}
          title="Heading 3"
        >
          H3
        </button>

        {/* Divider */}
        <div className="w-px bg-gray-300 mx-2"></div>

        {/* Lists */}
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded hover:bg-gray-200 ${
            editor.isActive('bulletList') ? 'bg-gray-200' : ''
          }`}
          title="Bullet List"
        >
          <ListIcon className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded hover:bg-gray-200 ${
            editor.isActive('orderedList') ? 'bg-gray-200' : ''
          }`}
          title="Numbered List"
        >
          <OrderedListIcon className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-2 rounded hover:bg-gray-200 ${
            editor.isActive('blockquote') ? 'bg-gray-200' : ''
          }`}
          title="Quote"
        >
          <QuoteIcon className="w-4 h-4" />
        </button>

        {/* Divider */}
        <div className="w-px bg-gray-300 mx-2"></div>

        {/* Undo/Redo */}
        <button
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="p-2 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Undo (Ctrl+Z)"
        >
          <UndoIcon className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="p-2 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Redo (Ctrl+Y)"
        >
          <RedoIcon className="w-4 h-4" />
        </button>
      </div>

      {/* Editor Content */}
      <EditorContent editor={editor} className="bg-white" />
    </div>
  );
};
