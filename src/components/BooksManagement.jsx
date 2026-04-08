/**
 * BooksManagement - Documentation books storage settings
 * Visual controls for create, export, import, delete
 */

import React, { useState } from 'react'
import { Plus, Download, Upload, Trash2, BookOpen, Folder, FileText, AlertCircle } from 'lucide-react'
import useBooksStore from '../hooks/useBooksStore'
import StorageManager from '../lib/StorageManager'

export default function BooksManagement() {
  const { books, chapters, loadBooks, createBook, deleteBook, exportBook, importBook } = useBooksStore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [stats, setStats] = useState(null)
  const [showNewForm, setShowNewForm] = useState(false)
  const [newBookTitle, setNewBookTitle] = useState('')
  const fileInputRef = React.useRef()

  React.useEffect(() => {
    loadBooks().then(() => {
      StorageManager.getStats().then(setStats).catch(e => setError(e.message))
    })
  }, [])

  const handleCreateBook = async () => {
    if (!newBookTitle.trim()) return
    setLoading(true)
    try {
      const book = await createBook({
        title: newBookTitle,
        description: '',
        tags: [],
      })
      setNewBookTitle('')
      setShowNewForm(false)
      await loadBooks()
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteBook = async (bookId, title) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return
    setLoading(true)
    try {
      await deleteBook(bookId)
      await loadBooks()
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const handleExportBook = async (bookId, title) => {
    setLoading(true)
    try {
      const json = await exportBook(bookId)
      const blob = new Blob([json], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${title.replace(/\s+/g, '-').toLowerCase()}-export.json`
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const handleImportFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setLoading(true)
    const reader = new FileReader()
    reader.onload = async (ev) => {
      try {
        await importBook(ev.target.result)
        await loadBooks()
        setError(null)
      } catch (err) {
        setError('Invalid book file. Check the format.')
      } finally {
        setLoading(false)
        e.target.value = ''
      }
    }
    reader.readAsText(file)
  }

  const chapterCount = Object.values(chapters).reduce((sum, ch) => sum + (ch?.length || 0), 0)

  return (
    <section className="settings-section books-management-section">
      <div className="settings-section-header">
        <h2 className="settings-section-title">
          <BookOpen size={18} style={{ marginRight: 8 }} />
          Documentation Books
        </h2>
        <p className="settings-section-desc">Create and organize markdown documentation</p>
      </div>

      {/* Stats Bar */}
      <div className="books-stats-bar">
        <div className="books-stat">
          <div className="books-stat-label">Books</div>
          <div className="books-stat-value">{books.length}</div>
        </div>
        <div className="books-stat">
          <div className="books-stat-label">Chapters</div>
          <div className="books-stat-value">{chapterCount}</div>
        </div>
        {stats && (
          <div className="books-stat">
            <div className="books-stat-label">Last Update</div>
            <div className="books-stat-value" style={{ fontSize: 11 }}>
              {new Date(stats.lastUpdated).toLocaleDateString()}
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="books-error-box">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* New Book Form */}
      {showNewForm && (
        <div className="books-new-form">
          <input
            type="text"
            className="input"
            placeholder="Book title"
            value={newBookTitle}
            onChange={(e) => setNewBookTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreateBook()
              if (e.key === 'Escape') setShowNewForm(false)
            }}
            autoFocus
          />
          <button className="btn btn-primary btn-sm" onClick={handleCreateBook} disabled={loading}>
            Create
          </button>
          <button className="btn btn-ghost btn-sm" onClick={() => setShowNewForm(false)}>
            Cancel
          </button>
        </div>
      )}

      {/* Books List */}
      <div className="books-list">
        {books.length === 0 ? (
          <div className="books-empty-state">
            <Folder size={40} style={{ opacity: 0.3 }} />
            <p>No books yet</p>
          </div>
        ) : (
          books.map(book => (
            <div key={book.id} className="books-item">
              <div className="books-item-header">
                <div className="books-item-title">
                  <BookOpen size={16} />
                  <span>{book.title}</span>
                </div>
                <div className="books-item-actions">
                  <button
                    className="btn btn-ghost btn-xs"
                    onClick={() => handleExportBook(book.id, book.title)}
                    disabled={loading}
                    title="Export"
                  >
                    <Download size={13} />
                  </button>
                  <button
                    className="btn btn-ghost btn-xs"
                    onClick={() => handleDeleteBook(book.id, book.title)}
                    disabled={loading}
                    title="Delete"
                    style={{ color: 'var(--color-danger)' }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              {/* Chapters */}
              {chapters[book.id] && chapters[book.id].length > 0 && (
                <div className="books-chapters-list">
                  {chapters[book.id].map((ch, idx) => (
                    <div key={ch.id} className="books-chapter-item">
                      <FileText size={12} />
                      <span>{ch.title}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Action Buttons */}
      <div className="books-actions">
        <button
          className="btn btn-primary btn-sm"
          onClick={() => setShowNewForm(true)}
          disabled={loading || showNewForm}
        >
          <Plus size={14} /> New Book
        </button>
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={loading}
        >
          <Upload size={14} /> Import
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImportFile}
          style={{ display: 'none' }}
        />
      </div>

      {/* Structure Legend */}
      <div className="books-legend">
        <div className="books-legend-item">
          <BookOpen size={14} />
          <span>Book</span>
        </div>
        <div className="books-legend-item">
          <FileText size={14} />
          <span>Chapter / Note</span>
        </div>
        <div className="books-legend-item">
          <Download size={14} />
          <span>Export to JSON</span>
        </div>
      </div>
    </section>
  )
}
