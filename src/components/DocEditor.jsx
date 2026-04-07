import React, { useState, useEffect } from 'react'
import MDEditor from '@uiw/react-md-editor'
import { Edit3, Eye, Save, X, Trash2 } from 'lucide-react'
import useAppStore from '../store/useAppStore.js'
import { useNavigate } from 'react-router-dom'

export default function DocEditor({ docId }) {
  const docs = useAppStore((s) => s.docs)
  const updateDoc = useAppStore((s) => s.updateDoc)
  const deleteDoc = useAppStore((s) => s.deleteDoc)
  const theme = useAppStore((s) => s.theme)
  const navigate = useNavigate()

  const doc = docs[docId]
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const [titleDraft, setTitleDraft] = useState('')
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    if (doc) {
      setDraft(doc.content || '')
      setTitleDraft(doc.title || '')
      setEditing(false)
      setHasChanges(false)
    }
  }, [docId, doc])

  if (!doc) {
    return (
      <div className="doc-editor-empty">
        <p>Select a document from the sidebar to view it.</p>
      </div>
    )
  }

  if (doc.type === 'folder') {
    return (
      <div className="doc-editor-empty">
        <p>This is a folder. Select a document inside it.</p>
      </div>
    )
  }

  const handleSave = () => {
    updateDoc(docId, { content: draft, title: titleDraft })
    setEditing(false)
    setHasChanges(false)
  }

  const handleDiscard = () => {
    setDraft(doc.content || '')
    setTitleDraft(doc.title || '')
    setEditing(false)
    setHasChanges(false)
  }

  const handleDelete = () => {
    if (window.confirm(`Delete "${doc.title}"? This cannot be undone.`)) {
      deleteDoc(docId)
      navigate('/docs')
    }
  }

  const handleContentChange = (val) => {
    setDraft(val || '')
    setHasChanges(true)
  }

  const handleTitleChange = (e) => {
    setTitleDraft(e.target.value)
    setHasChanges(true)
  }

  return (
    <div className="doc-editor" data-color-mode={theme}>
      <div className="doc-editor-header">
        {editing ? (
          <input
            className="doc-editor-title-input input"
            value={titleDraft}
            onChange={handleTitleChange}
            placeholder="Document title"
          />
        ) : (
          <h1 className="doc-editor-title">{doc.title}</h1>
        )}

        <div className="doc-editor-actions">
          {editing ? (
            <>
              <button
                className="btn btn-primary btn-sm"
                onClick={handleSave}
                disabled={!hasChanges}
              >
                <Save size={14} />
                Save
              </button>
              <button className="btn btn-secondary btn-sm" onClick={handleDiscard}>
                <X size={14} />
                Discard
              </button>
            </>
          ) : (
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setEditing(true)}
            >
              <Edit3 size={14} />
              Edit
            </button>
          )}
          <button
            className="btn btn-ghost btn-sm"
            onClick={handleDelete}
            title="Delete document"
            style={{ color: 'var(--color-danger)' }}
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <div className="doc-editor-body">
        {editing ? (
          <MDEditor
            value={draft}
            onChange={handleContentChange}
            preview="edit"
            height={600}
            data-color-mode={theme}
          />
        ) : (
          <div className="doc-viewer">
            <MDEditor.Markdown
              source={doc.content || '*This document is empty. Click Edit to add content.*'}
              style={{ background: 'transparent', color: 'var(--color-text)' }}
            />
          </div>
        )}
      </div>
    </div>
  )
}
