import React, { useEffect, useRef } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { Table, TableRow, TableHeader, TableCell } from '@tiptap/extension-table'
import { marked } from 'marked'
import TurndownService from 'turndown'
import { gfm } from 'turndown-plugin-gfm'
import {
  Bold, Italic, Code, Strikethrough,
  Heading1, Heading2, Heading3,
  List, ListOrdered, Quote, Minus, Table as TableIcon,
} from 'lucide-react'

// Configure marked with GFM tables
marked.setOptions({ breaks: true, gfm: true })

// Configure turndown with GFM plugin for proper table support
const td = new TurndownService({
  headingStyle: 'atx',
  hr: '---',
  bulletListMarker: '-',
  codeBlockStyle: 'fenced',
  fence: '```',
})
td.use(gfm)

function markdownToHtml(md) {
  if (!md) return ''
  return marked.parse(md)
}

function htmlToMarkdown(html) {
  if (!html) return ''
  return td.turndown(html)
}

function ToolbarButton({ onClick, active, title, children }) {
  return (
    <button
      type="button"
      onMouseDown={(e) => { e.preventDefault(); onClick() }}
      className={`wiki-toolbar-btn${active ? ' wiki-toolbar-btn--active' : ''}`}
      title={title}
    >
      {children}
    </button>
  )
}

export default function WikiEditor({ value = '', onChange, placeholder = 'Start writing…', readOnly = false, showToolbar = true }) {
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Placeholder.configure({
        placeholder,
        emptyEditorClass: 'wiki-editor-empty',
      }),
      Table.configure({ resizable: false }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    editable: !readOnly,
    content: markdownToHtml(value),
    onUpdate({ editor }) {
      const html = editor.getHTML()
      const md = htmlToMarkdown(html)
      onChangeRef.current?.(md)
    },
  })

  // Sync external value changes (e.g. switching docs)
  const lastValueRef = useRef(value)
  useEffect(() => {
    if (!editor) return
    if (value !== lastValueRef.current) {
      lastValueRef.current = value
      editor.commands.setContent(markdownToHtml(value), false)
    }
  }, [value, editor])

  // Sync readOnly
  useEffect(() => {
    if (editor) editor.setEditable(!readOnly)
  }, [readOnly, editor])

  if (!editor) return null

  return (
    <div className={`wiki-editor${readOnly ? ' wiki-editor--readonly' : ''}`}>
      {/* Toolbar */}
      {showToolbar && !readOnly && (
        <div className="wiki-toolbar">
          <div className="wiki-toolbar-group">
            <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive('heading', { level: 1 })} title="Heading 1"><Heading1 size={15} /></ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title="Heading 2"><Heading2 size={15} /></ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} title="Heading 3"><Heading3 size={15} /></ToolbarButton>
          </div>
          <div className="wiki-toolbar-divider" />
          <div className="wiki-toolbar-group">
            <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Bold (Ctrl+B)"><Bold size={15} /></ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italic (Ctrl+I)"><Italic size={15} /></ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="Strikethrough"><Strikethrough size={15} /></ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive('code')} title="Inline Code"><Code size={15} /></ToolbarButton>
          </div>
          <div className="wiki-toolbar-divider" />
          <div className="wiki-toolbar-group">
            <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Bullet List"><List size={15} /></ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Numbered List"><ListOrdered size={15} /></ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Blockquote"><Quote size={15} /></ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().setHorizontalRule().run()} active={false} title="Horizontal Rule"><Minus size={15} /></ToolbarButton>
          </div>
          <div className="wiki-toolbar-divider" />
          <div className="wiki-toolbar-group">
            <ToolbarButton
              onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
              active={editor.isActive('table')}
              title="Insert Table"
            ><TableIcon size={15} /></ToolbarButton>
            {editor.isActive('table') && (
              <>
                <ToolbarButton onClick={() => editor.chain().focus().addColumnAfter().run()} active={false} title="Add Column"><span style={{ fontSize: 11, fontWeight: 600 }}>+Col</span></ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().addRowAfter().run()} active={false} title="Add Row"><span style={{ fontSize: 11, fontWeight: 600 }}>+Row</span></ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().deleteTable().run()} active={false} title="Delete Table"><span style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-danger)' }}>Del</span></ToolbarButton>
              </>
            )}
          </div>
        </div>
      )}

      <EditorContent editor={editor} className="wiki-editor-content" />
    </div>
  )
}
