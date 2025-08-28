'use client';

import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Highlight from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Placeholder from '@tiptap/extension-placeholder';
// import { lowlight } from 'lowlight';
// Icons temporarily replaced with text - TODO: fix icon imports
const BoldIcon = (props: any) => <span {...props}>B</span>;
const ItalicIcon = (props: any) => <span {...props}>I</span>;
const UnderlineIcon = (props: any) => <span {...props}>U</span>;
const StrikethroughIcon = (props: any) => <span {...props}>S</span>;
const CodeIcon = (props: any) => <span {...props}>&lt;/&gt;</span>;
const LinkIcon = (props: any) => <span {...props}>🔗</span>;
const ImageIcon = (props: any) => <span {...props}>🖼️</span>;
const ListIcon = (props: any) => <span {...props}>•</span>;
const OrderedListIcon = (props: any) => <span {...props}>1.</span>;
const QuoteIcon = (props: any) => <span {...props}>❝</span>;
const UndoIcon = (props: any) => <span {...props}>↶</span>;
const RedoIcon = (props: any) => <span {...props}>↷</span>;
const AlignLeftIcon = (props: any) => <span {...props}>⇤</span>;
const AlignCenterIcon = (props: any) => <span {...props}>=</span>;
const AlignRightIcon = (props: any) => <span {...props}>⇥</span>;
const HighlighterIcon = (props: any) => <span {...props}>🖍️</span>;
const TaskListIcon = (props: any) => <span {...props}>☐</span>;
const HeadingIcon = (props: any) => <span {...props}>H</span>;

interface AdvancedEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
}

export const AdvancedEditor: React.FC<AdvancedEditorProps> = ({
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
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        defaultProtocol: 'https',
      }),
      Highlight.configure({
        multicolor: true,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
        alignments: ['left', 'center', 'right'],
      }),
      Underline,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
    ].filter(Boolean), // Remove any undefined extensions
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
    return null;
  }

  const addImage = () => {
    const url = window.prompt('Nhập URL hình ảnh:');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const addLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('Nhập URL:', previousUrl);

    // cancelled
    if (url === null) {
      return;
    }

    // empty
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    // update link
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const addTable = () => {
    // Table functionality temporarily disabled due to import issues
    alert('Table functionality will be available in the next update');
    // editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  };

  return (
    <div className={`border border-gray-300 rounded-lg overflow-hidden ${className}`}>
      {/* Toolbar */}
      <div className="border-b border-gray-300 p-3 bg-gray-50 flex flex-wrap gap-1">
        {/* Text Formatting */}
        <div className="flex gap-1 border-r border-gray-300 pr-2 mr-2">
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
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`p-2 rounded hover:bg-gray-200 ${
              editor.isActive('underline') ? 'bg-gray-200' : ''
            }`}
            title="Underline (Ctrl+U)"
          >
            <UnderlineIcon className="w-4 h-4" />
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
          <button
            onClick={() => editor.chain().focus().toggleHighlight().run()}
            className={`p-2 rounded hover:bg-gray-200 ${
              editor.isActive('highlight') ? 'bg-gray-200' : ''
            }`}
            title="Highlight"
          >
            <HighlighterIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Headings */}
        <div className="flex gap-1 border-r border-gray-300 pr-2 mr-2">
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
        </div>

        {/* Lists */}
        <div className="flex gap-1 border-r border-gray-300 pr-2 mr-2">
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
            onClick={() => editor.chain().focus().toggleTaskList().run()}
            className={`p-2 rounded hover:bg-gray-200 ${
              editor.isActive('taskList') ? 'bg-gray-200' : ''
            }`}
            title="Task List"
          >
            <TaskListIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Alignment */}
        <div className="flex gap-1 border-r border-gray-300 pr-2 mr-2">
          <button
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className={`p-2 rounded hover:bg-gray-200 ${
              editor.isActive({ textAlign: 'left' }) ? 'bg-gray-200' : ''
            }`}
            title="Align Left"
          >
            <AlignLeftIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className={`p-2 rounded hover:bg-gray-200 ${
              editor.isActive({ textAlign: 'center' }) ? 'bg-gray-200' : ''
            }`}
            title="Align Center"
          >
            <AlignCenterIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            className={`p-2 rounded hover:bg-gray-200 ${
              editor.isActive({ textAlign: 'right' }) ? 'bg-gray-200' : ''
            }`}
            title="Align Right"
          >
            <AlignRightIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Insert Elements */}
        <div className="flex gap-1 border-r border-gray-300 pr-2 mr-2">
          <button
            onClick={addLink}
            className={`p-2 rounded hover:bg-gray-200 ${
              editor.isActive('link') ? 'bg-gray-200' : ''
            }`}
            title="Add Link"
          >
            <LinkIcon className="w-4 h-4" />
          </button>
          <button
            onClick={addImage}
            className="p-2 rounded hover:bg-gray-200"
            title="Add Image"
          >
            <ImageIcon className="w-4 h-4" />
          </button>
          {/* Table button temporarily disabled due to import issues */}
          {/* <button
            onClick={addTable}
            className="p-2 rounded hover:bg-gray-200"
            title="Insert Table"
          >
            <TableIcon className="w-4 h-4" />
          </button> */}
          <button
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`p-2 rounded hover:bg-gray-200 ${
              editor.isActive('blockquote') ? 'bg-gray-200' : ''
            }`}
            title="Quote"
          >
            <QuoteIcon className="w-4 h-4" />
          </button>
          {/* Code block temporarily disabled */}
          {/* <button
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={`p-2 rounded hover:bg-gray-200 ${
              editor.isActive('codeBlock') ? 'bg-gray-200' : ''
            }`}
            title="Code Block"
          >
            <CodeBlockIcon className="w-4 h-4" />
          </button> */}
          <button
            onClick={() => editor.chain().focus().toggleCode().run()}
            className={`p-2 rounded hover:bg-gray-200 ${
              editor.isActive('code') ? 'bg-gray-200' : ''
            }`}
            title="Inline Code"
          >
            <CodeIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Undo/Redo */}
        <div className="flex gap-1">
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
      </div>

      {/* Editor Content */}
      <EditorContent editor={editor} className="bg-white" />
    </div>
  );
};
