/**
 * WikiPage - MDWiki-style documentation interface
 * Displays wiki navigation, table of contents, and markdown content
 */

import React, { useState, useMemo, useRef } from 'react'
import { ChevronDown, ChevronRight, FileText, FolderOpen, Search, Edit2, Plus, Trash2, Image as ImageIcon } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import useAppStore from '../store/useAppStore.js'
import '../styles/wiki-page.css'

export default function WikiPage() {
  const docs = useAppStore((s) => s.docs)
  const [selectedDocId, setSelectedDocId] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedFolders, setExpandedFolders] = useState(new Set())
  const [isEditing, setIsEditing] = useState(false)
  const imageInputRef = useRef(null)
  const editorRef = useRef(null)

  // Get root-level docs (no parent)
  const rootDocs = useMemo(() => {
    return Object.values(docs).filter((d) => !d.parentId)
  }, [docs])

  // Get children of a parent
  const getChildren = (parentId) => {
    return Object.values(docs).filter((d) => d.parentId === parentId)
  }

  // Toggle folder expansion
  const toggleFolder = (folderId) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev)
      if (next.has(folderId)) {
        next.delete(folderId)
      } else {
        next.add(folderId)
      }
      return next
    })
  }

  // Filter docs based on search
  const filteredDocs = useMemo(() => {
    if (!searchTerm) return docs
    const term = searchTerm.toLowerCase()
    const filtered = {}
    Object.entries(docs).forEach(([id, doc]) => {
      if (doc.title.toLowerCase().includes(term) ||
          (doc.content && doc.content.toLowerCase().includes(term))) {
        filtered[id] = doc
      }
    })
    return filtered
  }, [docs, searchTerm])

  const selectedDoc = docs[selectedDocId]

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file || !selectedDocId) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const base64 = event.target?.result
      if (typeof base64 === 'string') {
        const markdown = selectedDoc.content || ''
        const altText = file.name.replace(/\.[^/.]+$/, '')
        const imageMarkdown = `\n![${altText}](${base64})\n`
        useAppStore.getState().updateDoc(selectedDocId, { content: markdown + imageMarkdown })
      }
    }
    reader.readAsDataURL(file)
    // Reset input so same file can be selected again
    if (imageInputRef.current) imageInputRef.current.value = ''
  }

  const renderDocTree = (parentId = null, depth = 0) => {
    const children = Object.values(docs).filter((d) => d.parentId === parentId)

    return children.map((doc) => {
      const isFolder = doc.type === 'folder'
      const isExpanded = expandedFolders.has(doc.id)
      const hasChildren = Object.values(docs).some((d) => d.parentId === doc.id)
      const isSelected = selectedDocId === doc.id

      return (
        <div key={doc.id}>
          <div
            className={`wiki-tree-item ${isSelected ? 'active' : ''}`}
            style={{ paddingLeft: `${depth * 16}px` }}
            onClick={() => {
              if (!isFolder) {
                setSelectedDocId(doc.id)
              } else {
                toggleFolder(doc.id)
              }
            }}
          >
            {isFolder ? (
              <>
                <button
                  className="wiki-tree-toggle"
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleFolder(doc.id)
                  }}
                >
                  {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>
                <FolderOpen size={16} />
              </>
            ) : (
              <>
                <div className="wiki-tree-toggle" />
                <FileText size={16} />
              </>
            )}
            <span className="wiki-tree-label">{doc.title}</span>
          </div>

          {isFolder && isExpanded && renderDocTree(doc.id, depth + 1)}
        </div>
      )
    })
  }

  return (
    <div className="wiki-page-container">
      {/* Sidebar Navigation */}
      <aside className="wiki-sidebar">
        <div className="wiki-sidebar-header">
          <h2>Wiki</h2>
        </div>

        {/* Search */}
        <div className="wiki-search-container">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search docs..."
            className="wiki-search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Wiki Tree */}
        <nav className="wiki-tree">
          {rootDocs.length === 0 ? (
            <div className="wiki-empty-state">
              <p>No documentation yet</p>
            </div>
          ) : (
            renderDocTree()
          )}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="wiki-main">
        {!selectedDocId || !selectedDoc ? (
          <div className="wiki-empty-state">
            <FileText size={48} strokeWidth={1} style={{ color: 'var(--color-text-subtle)', marginBottom: 16 }} />
            <h2 style={{ color: 'var(--color-text-muted)', fontWeight: 500 }}>
              Select a page to view
            </h2>
            <p style={{ color: 'var(--color-text-subtle)', marginTop: 8, fontSize: 14 }}>
              Browse the wiki pages from the sidebar
            </p>
          </div>
        ) : selectedDoc.type === 'folder' ? (
          <div className="wiki-empty-state">
            <FolderOpen size={48} strokeWidth={1} style={{ color: 'var(--color-text-subtle)', marginBottom: 16 }} />
            <h2 style={{ color: 'var(--color-text-muted)', fontWeight: 500 }}>
              {selectedDoc.title}
            </h2>
            <p style={{ color: 'var(--color-text-subtle)', marginTop: 8, fontSize: 14 }}>
              {getChildren(selectedDocId).length} pages
            </p>
          </div>
        ) : (
          <div className="wiki-content">
            <div className="wiki-header">
              <h1>{selectedDoc.title}</h1>
              <div className="wiki-actions">
                {isEditing && (
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => imageInputRef.current?.click()}
                    title="Insert image"
                  >
                    <ImageIcon size={14} /> Image
                  </button>
                )}
                <button className="btn btn-secondary btn-sm" onClick={() => setIsEditing(!isEditing)}>
                  <Edit2 size={14} /> {isEditing ? 'Preview' : 'Edit'}
                </button>
              </div>
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
              />
            </div>

            <div className="wiki-body">
              {isEditing ? (
                <div className="wiki-editor-container">
                  <div className="wiki-editor-pane">
                    <div className="wiki-editor-label">Markdown Source</div>
                    <textarea
                      className="wiki-editor"
                      ref={editorRef}
                      value={selectedDoc.content || ''}
                      onChange={(e) => {
                        useAppStore.getState().updateDoc(selectedDocId, { content: e.target.value })
                      }}
                      placeholder="Write your documentation here...

Markdown syntax examples:
# Heading 1
## Heading 2

**bold text**
*italic text*
`code`

- bullet points
1. numbered list

| Column 1 | Column 2 |
|----------|----------|
| Data     | Data     |

[Link text](url)
![Image alt](image-url)"
                    />
                  </div>
                  <div className="wiki-preview-pane">
                    <div className="wiki-editor-label">Live Preview</div>
                    <div className="wiki-editor-preview">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {selectedDoc.content || ''}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="wiki-markdown">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {selectedDoc.content || '# No content yet'}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
