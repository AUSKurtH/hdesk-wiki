/**
 * BooksNav - Navigation sidebar for books and chapters
 * Replaces DocTree with flat books structure
 */

import React, { useState, useEffect } from 'react'
import { ChevronRight, ChevronDown, BookOpen, FileText, Plus, Trash2 } from 'lucide-react'
import useBooksStore from '../hooks/useBooksStore'

export default function BooksNav({ currentBookId, currentChapterId, onSelectChapter }) {
  const { books, chapters, loadBooks, createBook, deleteBook, loadChapters } = useBooksStore()
  const [expandedBooks, setExpandedBooks] = useState({})
  const [newBookTitle, setNewBookTitle] = useState('')
  const [showNewForm, setShowNewForm] = useState(false)

  useEffect(() => {
    loadBooks()
  }, [])

  useEffect(() => {
    if (currentBookId && !chapters[currentBookId]) {
      loadChapters(currentBookId)
    }
  }, [currentBookId])

  const toggleBook = (bookId) => {
    setExpandedBooks(prev => ({
      ...prev,
      [bookId]: !prev[bookId]
    }))
    if (!chapters[bookId]) {
      loadChapters(bookId)
    }
  }

  const handleCreateBook = async () => {
    if (!newBookTitle.trim()) return
    await createBook({ title: newBookTitle, description: '', tags: [] })
    setNewBookTitle('')
    setShowNewForm(false)
    await loadBooks()
  }

  const handleDeleteBook = async (bookId, title) => {
    if (!window.confirm(`Delete "${title}"?`)) return
    await deleteBook(bookId)
    await loadBooks()
  }

  const bookChapters = chapters[currentBookId] || []

  return (
    <nav className="books-nav">
      <div className="books-nav-header">
        <h3 className="books-nav-title">📚 Documentation</h3>
      </div>

      {/* New Book Form */}
      {showNewForm && (
        <div className="books-nav-new-form">
          <input
            type="text"
            className="input input-sm"
            placeholder="Book title"
            value={newBookTitle}
            onChange={(e) => setNewBookTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreateBook()
              if (e.key === 'Escape') setShowNewForm(false)
            }}
            autoFocus
          />
          <button className="btn btn-xs btn-primary" onClick={handleCreateBook}>
            Create
          </button>
          <button className="btn btn-xs btn-ghost" onClick={() => setShowNewForm(false)}>
            ✕
          </button>
        </div>
      )}

      {/* Books List */}
      <div className="books-nav-list">
        {books.length === 0 ? (
          <div className="books-nav-empty">
            <p>No books yet</p>
          </div>
        ) : (
          books.map(book => {
            const isExpanded = expandedBooks[book.id]
            const bookChapters = chapters[book.id] || []

            return (
              <div key={book.id} className="books-nav-book">
                <div className="books-nav-book-header">
                  <button
                    className="books-nav-toggle"
                    onClick={() => toggleBook(book.id)}
                  >
                    {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </button>

                  <button
                    className={`books-nav-book-title${currentBookId === book.id ? ' active' : ''}`}
                    onClick={() => toggleBook(book.id)}
                  >
                    <BookOpen size={14} />
                    <span>{book.title}</span>
                  </button>

                  <button
                    className="books-nav-delete"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteBook(book.id, book.title)
                    }}
                    title="Delete book"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>

                {/* Chapters List */}
                {isExpanded && (
                  <div className="books-nav-chapters">
                    {bookChapters.length === 0 ? (
                      <div className="books-nav-no-chapters">
                        <p>No chapters</p>
                      </div>
                    ) : (
                      bookChapters.map(chapter => (
                        <button
                          key={chapter.id}
                          className={`books-nav-chapter${
                            currentBookId === book.id && currentChapterId === chapter.id ? ' active' : ''
                          }`}
                          onClick={() => onSelectChapter(book.id, chapter.id)}
                        >
                          <FileText size={13} />
                          <span>{chapter.title}</span>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* Add Button */}
      <button
        className="books-nav-add-btn"
        onClick={() => setShowNewForm(true)}
        disabled={showNewForm}
      >
        <Plus size={14} /> New Book
      </button>
    </nav>
  )
}
