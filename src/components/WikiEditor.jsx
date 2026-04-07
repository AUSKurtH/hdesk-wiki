import React, { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { Table, TableRow, TableHeader, TableCell } from '@tiptap/extension-table'
import Link from '@tiptap/extension-link'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import { MarkdownDecorations } from './MarkdownDecorations.js'
import { marked } from 'marked'
import TurndownService from 'turndown'
import { gfm } from 'turndown-plugin-gfm'
import {
  Bold, Italic, Code, Strikethrough,
  Heading1, Heading2, Heading3,
  List, ListOrdered, Quote, Minus, Table as TableIcon,
  Link2, Palette, X as XIcon,
} from 'lucide-react'

marked.setOptions({ breaks: true, gfm: true })

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

function ToolbarButton({ onClick, active, title, children, danger }) {
  return (
    <button
      type="button"
      onMouseDown={(e) => { e.preventDefault(); onClick() }}
      className={`wiki-toolbar-btn${active ? ' wiki-toolbar-btn--active' : ''}${danger ? ' wiki-toolbar-btn--danger' : ''}`}
      title={title}
    >
      {children}
    </button>
  )
}

const GRID_ROWS = 6
const GRID_COLS = 8

function TableGridPicker({ anchorRef, onInsert, onClose }) {
  const [hover, setHover] = useState({ r: 0, c: 0 })
  const pickerRef = useRef()

  // Position relative to the anchor button using fixed coords
  const [pos, setPos] = useState({ top: 0, left: 0 })
  useEffect(() => {
    if (anchorRef.current) {
      const rect = anchorRef.current.getBoundingClientRect()
      setPos({ top: rect.bottom + 6, left: rect.left })
    }
  }, [anchorRef])

  useEffect(() => {
    function handleMouseDown(e) {
      if (
        pickerRef.current && !pickerRef.current.contains(e.target) &&
        anchorRef.current && !anchorRef.current.contains(e.target)
      ) onClose()
    }
    document.addEventListener('mousedown', handleMouseDown)
    return () => document.removeEventListener('mousedown', handleMouseDown)
  }, [onClose, anchorRef])

  return createPortal(
    <div
      className="table-picker"
      ref={pickerRef}
      style={{ position: 'fixed', top: pos.top, left: pos.left, zIndex: 9999 }}
    >
      <div className="table-picker-label">
        {hover.r > 0 && hover.c > 0 ? `${hover.c} × ${hover.r}` : 'Insert table'}
      </div>
      <div className="table-picker-grid">
        {Array.from({ length: GRID_ROWS }, (_, r) =>
          Array.from({ length: GRID_COLS }, (_, c) => (
            <div
              key={`${r}-${c}`}
              className={`table-picker-cell${r < hover.r && c < hover.c ? ' table-picker-cell--active' : ''}`}
              onMouseEnter={() => setHover({ r: r + 1, c: c + 1 })}
              onMouseDown={(e) => {
                e.preventDefault()
                if (hover.r > 0 && hover.c > 0) onInsert(hover.r, hover.c)
              }}
            />
          ))
        )}
      </div>
    </div>,
    document.body
  )
}

export default function WikiEditor({ value = '', onChange, placeholder = 'Start writing…', readOnly = false, showToolbar = true }) {
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange
  const [showTablePicker, setShowTablePicker] = useState(false)
  const tableButtonRef = useRef()
  const colorInputRef = useRef()

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Placeholder.configure({ placeholder, emptyEditorClass: 'wiki-editor-empty' }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      Link.configure({ openOnClick: false, HTMLAttributes: { rel: 'noopener noreferrer' } }),
      TextStyle,
      Color,
      ...(readOnly ? [] : [MarkdownDecorations]),
    ],
    editable: !readOnly,
    content: markdownToHtml(value),
    onUpdate({ editor }) {
      const html = editor.getHTML()
      onChangeRef.current?.(htmlToMarkdown(html))
    },
  })

  const lastValueRef = useRef(value)
  useEffect(() => {
    if (!editor) return
    if (value !== lastValueRef.current) {
      lastValueRef.current = value
      editor.commands.setContent(markdownToHtml(value), false)
    }
  }, [value, editor])

  useEffect(() => {
    if (editor) editor.setEditable(!readOnly)
  }, [readOnly, editor])

  if (!editor) return null

  const inTable = editor.isActive('table')

  const handleInsertTable = (rows, cols) => {
    editor.chain().focus().insertTable({ rows, cols, withHeaderRow: true }).run()
    setShowTablePicker(false)
  }

  return (
    <div className={`wiki-editor${readOnly ? ' wiki-editor--readonly' : ''}`}>
      {showToolbar && !readOnly && (
        <div className="wiki-toolbar">
          {/* Headings */}
          <div className="wiki-toolbar-group">
            <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive('heading', { level: 1 })} title="Heading 1"><Heading1 size={15} /></ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title="Heading 2"><Heading2 size={15} /></ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} title="Heading 3"><Heading3 size={15} /></ToolbarButton>
          </div>
          <div className="wiki-toolbar-divider" />
          {/* Inline formatting */}
          <div className="wiki-toolbar-group">
            <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Bold (Ctrl+B)"><Bold size={15} /></ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italic (Ctrl+I)"><Italic size={15} /></ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="Strikethrough"><Strikethrough size={15} /></ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive('code')} title="Inline Code"><Code size={15} /></ToolbarButton>
          </div>
          <div className="wiki-toolbar-divider" />
          {/* Block elements */}
          <div className="wiki-toolbar-group">
            <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Bullet List"><List size={15} /></ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Numbered List"><ListOrdered size={15} /></ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Blockquote"><Quote size={15} /></ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().setHorizontalRule().run()} active={false} title="Horizontal Rule"><Minus size={15} /></ToolbarButton>
          </div>
          <div className="wiki-toolbar-divider" />
          {/* Table controls */}
          <div className="wiki-toolbar-group">
            {!inTable ? (
              <>
                <button
                  type="button"
                  ref={tableButtonRef}
                  onMouseDown={(e) => { e.preventDefault(); setShowTablePicker((v) => !v) }}
                  className={`wiki-toolbar-btn${showTablePicker ? ' wiki-toolbar-btn--active' : ''}`}
                  title="Insert Table"
                >
                  <TableIcon size={15} />
                </button>
                {showTablePicker && (
                  <TableGridPicker
                    anchorRef={tableButtonRef}
                    onInsert={handleInsertTable}
                    onClose={() => setShowTablePicker(false)}
                  />
                )}
              </>
            ) : (
              <>
                <ToolbarButton onClick={() => editor.chain().focus().addColumnBefore().run()} active={false} title="Add column before"><span className="wiki-toolbar-label">◀+Col</span></ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().addColumnAfter().run()} active={false} title="Add column after"><span className="wiki-toolbar-label">Col+▶</span></ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().deleteColumn().run()} active={false} danger title="Delete column"><span className="wiki-toolbar-label">−Col</span></ToolbarButton>
                <div className="wiki-toolbar-divider" />
                <ToolbarButton onClick={() => editor.chain().focus().addRowBefore().run()} active={false} title="Add row above"><span className="wiki-toolbar-label">▲+Row</span></ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().addRowAfter().run()} active={false} title="Add row below"><span className="wiki-toolbar-label">Row+▼</span></ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().deleteRow().run()} active={false} danger title="Delete row"><span className="wiki-toolbar-label">−Row</span></ToolbarButton>
                <div className="wiki-toolbar-divider" />
                <ToolbarButton onClick={() => editor.chain().focus().deleteTable().run()} active={false} danger title="Delete table"><span className="wiki-toolbar-label">Del Table</span></ToolbarButton>
              </>
            )}
          </div>
          <div className="wiki-toolbar-divider" />
          {/* Link */}
          <div className="wiki-toolbar-group">
            <ToolbarButton
              onClick={() => {
                const url = window.prompt('Enter URL:', editor.getAttributes('link').href || 'https://')
                if (url === null) return
                if (!url) {
                  editor.chain().focus().unsetLink().run()
                  return
                }
                if (editor.state.selection.empty) {
                  const text = window.prompt('Display text:', url)
                  if (!text) return
                  editor.chain().focus().insertContent(`<a href="${url}">${text}</a>`).run()
                } else {
                  editor.chain().focus().setLink({ href: url }).run()
                }
              }}
              active={editor.isActive('link')}
              title="Insert/Edit Link"
            >
              <Link2 size={15} />
            </ToolbarButton>
          </div>
          <div className="wiki-toolbar-divider" />
          {/* Text colour */}
          <div className="wiki-toolbar-group">
            <button
              type="button"
              className="wiki-toolbar-btn"
              title="Text Colour"
              onMouseDown={(e) => { e.preventDefault(); colorInputRef.current?.click() }}
            >
              <Palette size={15} />
            </button>
            <input
              ref={colorInputRef}
              type="color"
              style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', width: 0, height: 0 }}
              onChange={(e) => { editor.chain().focus().setColor(e.target.value).run() }}
            />
            <ToolbarButton
              onClick={() => editor.chain().focus().unsetColor().run()}
              active={false}
              title="Clear text colour"
            >
              <XIcon size={13} />
            </ToolbarButton>
          </div>
        </div>
      )}

      <EditorContent editor={editor} className="wiki-editor-content" />
    </div>
  )
}
