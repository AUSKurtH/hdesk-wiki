import React from 'react'
import { useParams } from 'react-router-dom'
import DocEditor from '../components/DocEditor.jsx'
import { BookOpen } from 'lucide-react'

export default function DocPage() {
  const { docId } = useParams()

  if (!docId) {
    return (
      <div className="doc-page-empty">
        <div className="doc-page-empty-inner">
          <BookOpen size={48} strokeWidth={1} style={{ color: 'var(--color-text-subtle)', marginBottom: 16 }} />
          <h2 style={{ color: 'var(--color-text-muted)', fontWeight: 500 }}>Select a document</h2>
          <p style={{ color: 'var(--color-text-subtle)', marginTop: 8, fontSize: 14 }}>
            Choose a document from the sidebar, or create a new one.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="doc-page">
      <DocEditor docId={docId} />
    </div>
  )
}
