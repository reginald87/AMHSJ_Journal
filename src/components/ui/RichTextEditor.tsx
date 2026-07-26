'use client';

import { useEditor, EditorContent, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import LinkExt from '@tiptap/extension-link';
import ImageExt from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import Strike from '@tiptap/extension-strike';
import { useCallback, useEffect } from 'react';
import { cn } from '@/lib/utils';
import DOMPurify from 'dompurify';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  Image,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Heading1,
  Heading2,
  Heading3,
  Undo,
  Redo,
  Minus,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  readOnly?: boolean;
}

interface ToolbarItem {
  type?: 'separator';
  action?: string;
  icon?: React.ComponentType<{ className?: string }>;
  tooltip?: string;
  isActive?: (editor: Editor) => boolean;
}

function getToolbarItems(): ToolbarItem[] {
  return [
    { action: 'toggleBold', icon: Bold, tooltip: 'Bold (Ctrl+B)', isActive: (e) => e.isActive('bold') },
    { action: 'toggleItalic', icon: Italic, tooltip: 'Italic (Ctrl+I)', isActive: (e) => e.isActive('italic') },
    { action: 'toggleUnderline', icon: UnderlineIcon, tooltip: 'Underline (Ctrl+U)', isActive: (e) => e.isActive('underline') },
    { action: 'toggleStrike', icon: Strikethrough, tooltip: 'Strikethrough', isActive: (e) => e.isActive('strike') },
    { type: 'separator' },
    { action: 'toggleHeading1', icon: Heading1, tooltip: 'Heading 1', isActive: (e) => e.isActive('heading', { level: 1 }) },
    { action: 'toggleHeading2', icon: Heading2, tooltip: 'Heading 2', isActive: (e) => e.isActive('heading', { level: 2 }) },
    { action: 'toggleHeading3', icon: Heading3, tooltip: 'Heading 3', isActive: (e) => e.isActive('heading', { level: 3 }) },
    { action: 'setParagraph', icon: Quote, tooltip: 'Paragraph', isActive: (e) => e.isActive('paragraph') && !e.isActive('heading') },
    { type: 'separator' },
    { action: 'toggleBulletList', icon: List, tooltip: 'Bullet List', isActive: (e) => e.isActive('bulletList') },
    { action: 'toggleOrderedList', icon: ListOrdered, tooltip: 'Numbered List', isActive: (e) => e.isActive('orderedList') },
    { type: 'separator' },
    { action: 'setTextAlignLeft', icon: AlignLeft, tooltip: 'Align Left', isActive: (e) => e.isActive({ textAlign: 'left' }) },
    { action: 'setTextAlignCenter', icon: AlignCenter, tooltip: 'Align Center', isActive: (e) => e.isActive({ textAlign: 'center' }) },
    { action: 'setTextAlignRight', icon: AlignRight, tooltip: 'Align Right', isActive: (e) => e.isActive({ textAlign: 'right' }) },
    { type: 'separator' },
    { action: 'setLink', icon: LinkIcon, tooltip: 'Insert Link', isActive: (e) => e.isActive('link') },
    { action: 'setImage', icon: Image, tooltip: 'Insert Image' },
    { type: 'separator' },
    { action: 'undo', icon: Undo, tooltip: 'Undo (Ctrl+Z)' },
    { action: 'redo', icon: Redo, tooltip: 'Redo (Ctrl+Y)' },
    { type: 'separator' },
    { action: 'setHorizontalRule', icon: Minus, tooltip: 'Horizontal Rule' },
    { action: 'toggleBlockquote', icon: Quote, tooltip: 'Quote', isActive: (e) => e.isActive('blockquote') },
    { action: 'toggleCodeBlock', icon: Code, tooltip: 'Code Block', isActive: (e) => e.isActive('codeBlock') },
  ];
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Start writing...',
  className,
  readOnly = false,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Strike,
      Placeholder.configure({ placeholder }),
      LinkExt.configure({ openOnClick: false, HTMLAttributes: { class: 'text-gold-600 underline cursor-pointer' } }),
      ImageExt.configure({ HTMLAttributes: { class: 'max-w-full rounded-lg my-2' } }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
    content: value || '',
    editable: !readOnly,
    onUpdate: ({ editor: e }) => {
      onChange(e.getHTML());
    },
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-lg dark:prose-invert max-w-none min-h-[300px] p-4 outline-none',
          'focus:ring-0',
          'text-slate-900 dark:text-white',
          '[&_.is-editor-empty]:before:text-slate-400 dark:[&_.is-editor-empty]:before:text-slate-500 [&_.is-editor-empty]:before:content-[attr(data-placeholder)] [&_.is-editor-empty]:before:float-left [&_.is-editor-empty]:before:pointer-events-none [&_.is-editor-empty]:before:h-0',
        ),
      },
    },
  });

  useEffect(() => {
    if (editor && value !== undefined && editor.getHTML() !== value) {
      editor.commands.setContent(value);
    }
  }, [editor, value]);

  const handleAction = useCallback(
    (action: string) => {
      if (!editor) return;
      switch (action) {
        case 'toggleBold': editor.chain().focus().toggleBold().run(); break;
        case 'toggleItalic': editor.chain().focus().toggleItalic().run(); break;
        case 'toggleUnderline': editor.chain().focus().toggleUnderline().run(); break;
        case 'toggleStrike': editor.chain().focus().toggleStrike().run(); break;
        case 'toggleHeading1': editor.chain().focus().toggleHeading({ level: 1 }).run(); break;
        case 'toggleHeading2': editor.chain().focus().toggleHeading({ level: 2 }).run(); break;
        case 'toggleHeading3': editor.chain().focus().toggleHeading({ level: 3 }).run(); break;
        case 'setParagraph': editor.chain().focus().setParagraph().run(); break;
        case 'toggleBulletList': editor.chain().focus().toggleBulletList().run(); break;
        case 'toggleOrderedList': editor.chain().focus().toggleOrderedList().run(); break;
        case 'setTextAlignLeft': editor.chain().focus().setTextAlign('left').run(); break;
        case 'setTextAlignCenter': editor.chain().focus().setTextAlign('center').run(); break;
        case 'setTextAlignRight': editor.chain().focus().setTextAlign('right').run(); break;
        case 'setHorizontalRule': editor.chain().focus().setHorizontalRule().run(); break;
        case 'toggleBlockquote': editor.chain().focus().toggleBlockquote().run(); break;
        case 'toggleCodeBlock': editor.chain().focus().toggleCodeBlock().run(); break;
        case 'undo': editor.chain().focus().undo().run(); break;
        case 'redo': editor.chain().focus().redo().run(); break;
        case 'setLink': {
          const prev = editor.getAttributes('link').href;
          const url = window.prompt('Enter URL:', prev || 'https://');
          if (url === null) return;
          if (url === '') { editor.chain().focus().unsetLink().run(); return; }
          editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
          break;
        }
        case 'setImage': {
          const src = window.prompt('Enter image URL:');
          if (src) editor.chain().focus().setImage({ src }).run();
          break;
        }
      }
    },
    [editor],
  );

  const items = getToolbarItems();

  if (readOnly || !editor) {
    if (readOnly) {
      return (
        <div
          className={cn('prose prose-lg dark:prose-invert max-w-none', className)}
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(value || '') }}
        />
      );
    }
    return (
      <div className={cn('border border-slate-200 dark:border-navy-700 rounded-xl overflow-hidden bg-white dark:bg-navy-900', className)}>
        <div className="min-h-[300px] p-4 flex items-center justify-center text-slate-400">
          Loading editor...
        </div>
      </div>
    );
  }

  return (
    <div className={cn('border border-slate-200 dark:border-navy-700 rounded-xl overflow-hidden bg-white dark:bg-navy-900', className)}>
      <div className="border-b border-slate-200 dark:border-navy-700 p-2 bg-slate-50 dark:bg-navy-800/50 flex flex-wrap gap-1">
        {items.map((item, index) => {
          if ('type' in item && item.type === 'separator') {
            return <div key={index} className="w-px h-6 bg-slate-300 dark:bg-navy-600 mx-1" />;
          }
          if ('action' in item) {
            const Icon = item.icon!;
            return (
              <Button
                key={index}
                variant="ghost"
                size="icon"
                onClick={() => handleAction(item.action!)}
                title={item.tooltip}
                className={cn('h-8 w-8', item.isActive?.(editor) && 'bg-slate-200 dark:bg-navy-600 text-gold-600')}
              >
                <Icon className="w-4 h-4" />
              </Button>
            );
          }
          return null;
        })}
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
