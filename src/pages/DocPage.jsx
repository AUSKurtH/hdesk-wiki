/**
 * DocPage - Documentation books interface
 * Displays books in sidebar, chapters in list, content in editor
 */

import React, { useState } from 'react'
import { BookOpen } from 'lucide-react'
import BooksNav from '../components/BooksNav.jsx'
import ChapterEditor from '../components/ChapterEditor.jsx'
import '../styles/doc-page.css'

export default function DocPage() {
  const [currentBookId, setCurrentBookId] = useState(null)
  const [currentChapterId, setCurrentChapterId] = useState(null)

  const handleSelectChapter = (bookId, chapterId) => {
    setCurrentBookId(bookId)
    setCurrentChapterId(chapterId)
  }

  const handleBookDeleted = () => {
    setCurrentBookId(null)
    setCurrentChapterId(null)
  }

  return (
    <div className="doc-page-container">
      {/* Sidebar Navigation */}
      <aside className="doc-page-sidebar">
        <BooksNav
          currentBookId={currentBookId}
          currentChapterId={currentChapterId}
          onSelectChapter={handleSelectChapter}
        />
      </aside>

      {/* Main Content */}
      <main className="doc-page-main">
        {!currentBookId || !currentChapterId ? (
          <div className="doc-page-empty">
            <div className="doc-page-empty-inner">
              <BookOpen size={48} strokeWidth={1} style={{ color: 'var(--color-text-subtle)', marginBottom: 16 }} />
              <h2 style={{ color: 'var(--color-text-muted)', fontWeight: 500 }}>
                Select a chapter to get started
              </h2>
              <p style={{ color: 'var(--color-text-subtle)', marginTop: 8, fontSize: 14 }}>
                Create a new book from the sidebar or select an existing chapter.
              </p>
            </div>
          </div>
        ) : (
          <ChapterEditor
            bookId={currentBookId}
            chapterId={currentChapterId}
            onBookDeleted={handleBookDeleted}
          />
        )}
      </main>
    </div>
  )
}
