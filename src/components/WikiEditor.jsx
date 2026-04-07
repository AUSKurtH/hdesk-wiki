import React, { useEffect, useRef, useState } from 'react'
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

function TableGridPicker({ onInsert, onClose }) {
  const [hover, setHover] = useState({ r: 0, c: 0 })
  const ref = useRef()

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) onClose()
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [onClose])

  return (
    <div className="table-picker" ref={ref}>
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
                if (hover.r > 0 && hover.c > 0) {
                  onInsert(hover.r, hover.c)
                }
              }}
            />
          ))
        )}
      </div>
    </div>
  )
}

export default function WikiEditor({ value = '', onChange, placeholder = 'Start writing…', readOnly = false, showToolbar = true }) {
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange
  const [showTablePicker, setShowTablePicker] = useState(false)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Placeholder.configure({ placeholder, emptyEditorClass: 'wiki-editor-empty' }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
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
          <div className="wiki-toolbar-group" style={{ position: 'relative' }}>
            {!inTable ? (
              <>
                <ToolbarButton
                  onClick={() => setShowTablePicker((v) => !v)}
                  active={showTablePicker}
                  title="Insert Table"
                >
                  <TableIcon size={15} />
                </ToolbarButton>
                {showTablePicker && (
                  <TableGridPicker
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
        </div>
      )}

      <EditorContent editor={editor} className="wiki-editor-content" />
    </div>
  )
}
