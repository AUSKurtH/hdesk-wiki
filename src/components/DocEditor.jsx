import React, { useState, useEffect } from 'react'
import { Save, X, Trash2 } from 'lucide-react'
import WikiEditor from './WikiEditor.jsx'
import useAppStore from '../store/useAppStore.js'
import { useNavigate } from 'react-router-dom'

export default function DocEditor({ docId }) {
  const docs = useAppStore((s) => s.docs)
  const updateDoc = useAppStore((s) => s.updateDoc)
  const deleteDoc = useAppStore((s) => s.deleteDoc)
  const navigate = useNavigate()

  const doc = docs[docId]
  const [draft, setDraft] = useState('')
  const [titleDraft, setTitleDraft] = useState('')
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    if (doc) {
      setDraft(doc.content || '')
      setTitleDraft(doc.title || '')
      setHasChanges(false)
    }
  }, [docId])

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
    setHasChanges(false)
  }

  const handleDiscard = () => {
    setDraft(doc.content || '')
    setTitleDraft(doc.title || '')
    setHasChanges(false)
  }

  const handleDelete = () => {
    if (window.confirm(`Delete "${doc.title}"? This cannot be undone.`)) {
      deleteDoc(docId)
      navigate('/docs')
    }
  }

  return (
    <div className="doc-editor">
      <div className="doc-editor-header">
        <input
          className="doc-editor-title-input"
          value={titleDraft}
          onChange={(e) => { setTitleDraft(e.target.value); setHasChanges(true) }}
          placeholder="Document title"
        />
        <div className="doc-editor-actions">
          {hasChanges && (
            <>
              <button className="btn btn-primary btn-sm" onClick={handleSave}>
                <Save size={14} />
                Save
              </button>
              <button className="btn btn-secondary btn-sm" onClick={handleDiscard}>
                <X size={14} />
                Discard
              </button>
            </>
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
        <WikiEditor
          key={docId}
          value={draft}
          onChange={(md) => { setDraft(md); setHasChanges(true) }}
          placeholder="Start writing your document…"
        />
      </div>
    </div>
  )
}
