/**
 * ChapterEditor - Edit markdown chapter content
 * Replaces DocEditor for the new books system
 */

import React, { useState, useEffect } from 'react'
import { Save, X, Trash2, Pencil, Plus } from 'lucide-react'
import WikiEditor from './WikiEditor.jsx'
import useBooksStore from '../hooks/useBooksStore'

export default function ChapterEditor({ bookId, chapterId, onBookDeleted }) {
  const {
    books,
    chapters,
    loadContent,
    saveContent,
    deleteChapter,
    createChapter,
    updateChapter,
    clearContentCache,
  } = useBooksStore()

  const [isEditing, setIsEditing] = useState(false)
  const [content, setContent] = useState('')
  const [titleDraft, setTitleDraft] = useState('')
  const [hasChanges, setHasChanges] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showNewChapterForm, setShowNewChapterForm] = useState(false)
  const [newChapterTitle, setNewChapterTitle] = useState('')

  const book = books.find(b => b.id === bookId)
  const chapter = chapters[bookId]?.find(c => c.id === chapterId)
  const bookChapters = chapters[bookId] || []

  // Load chapter content when switching
  useEffect(() => {
    if (bookId && chapterId) {
      setLoading(true)
      loadContent(bookId, chapterId)
        .then(content => {
          console.log('Loaded content:', {
            length: content.length,
            hasImages: content.includes('<img') || content.includes('!['),
            preview: content.substring(0, 200),
          })
          setContent(content)
          setTitleDraft(chapter?.title || '')
          setIsEditing(false)
          setHasChanges(false)
        })
        .catch(err => console.error('Failed to load content:', err))
        .finally(() => setLoading(false))
    }
  }, [bookId, chapterId])

  if (!book) {
    return (
      <div className="chapter-editor-empty">
        <p>Select a book from the sidebar</p>
      </div>
    )
  }

  if (!chapter) {
    return (
      <div className="chapter-editor-empty">
        <p>Select a chapter from the sidebar</p>
      </div>
    )
  }

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      // Debug: log what's being saved
      console.log('Saving content:', {
        length: content.length,
        hasImages: content.includes('<img') || content.includes('!['),
        preview: content.substring(0, 200),
      })

      // Save content
      await saveContent(bookId, chapterId, content)

      // Update title if changed
      if (titleDraft !== chapter.title) {
        await updateChapter(bookId, chapterId, { title: titleDraft })
      }

      setIsEditing(false)
      setHasChanges(false)
    } catch (err) {
      console.error('Failed to save:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDiscard = () => {
    setContent(chapter.content || '')
    setTitleDraft(chapter.title)
    setIsEditing(false)
    setHasChanges(false)
  }

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${chapter.title}"? This cannot be undone.`)) return

    setLoading(true)
    try {
      await deleteChapter(bookId, chapterId)
      clearContentCache(bookId, chapterId)
      // Parent will handle navigation
    } catch (err) {
      console.error('Failed to delete:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateChapter = async () => {
    if (!newChapterTitle.trim()) return

    setLoading(true)
    try {
      await createChapter(bookId, { title: newChapterTitle })
      setNewChapterTitle('')
      setShowNewChapterForm(false)
    } catch (err) {
      console.error('Failed to create chapter:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="chapter-editor">
      {/* Header */}
      <div className="chapter-editor-header">
        <div className="chapter-editor-breadcrumb">
          <span className="chapter-editor-book-name">{book.title}</span>
          <span className="chapter-editor-separator">/</span>
          {isEditing ? (
            <input
              className="chapter-editor-title-input"
              value={titleDraft}
              onChange={(e) => {
                setTitleDraft(e.target.value)
                setHasChanges(true)
              }}
              placeholder="Chapter title"
              autoFocus
            />
          ) : (
            <h1 className="chapter-editor-title">{chapter.title}</h1>
          )}
        </div>

        <div className="chapter-editor-actions">
          {isEditing ? (
            <>
              <button
                className="btn btn-primary btn-sm"
                onClick={handleSave}
                disabled={!hasChanges || loading}
              >
                <Save size={14} /> Save
              </button>
              <button className="btn btn-secondary btn-sm" onClick={handleDiscard}>
                <X size={14} /> Discard
              </button>
            </>
          ) : (
            <>
              <button className="btn btn-secondary btn-sm" onClick={handleEdit} disabled={loading}>
                <Pencil size={14} /> Edit
              </button>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setShowNewChapterForm(true)}
                disabled={loading || showNewChapterForm}
              >
                <Plus size={14} /> Chapter
              </button>
              <button
                className="btn btn-danger btn-sm"
                onClick={handleDelete}
                disabled={loading}
              >
                <Trash2 size={14} /> Delete
              </button>
            </>
          )}
        </div>
      </div>

      {/* New Chapter Form */}
      {showNewChapterForm && (
        <div className="chapter-editor-new-form">
          <input
            type="text"
            className="input"
            placeholder="New chapter title"
            value={newChapterTitle}
            onChange={(e) => setNewChapterTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreateChapter()
              if (e.key === 'Escape') setShowNewChapterForm(false)
            }}
            autoFocus
          />
          <button className="btn btn-primary btn-sm" onClick={handleCreateChapter} disabled={loading}>
            Create
          </button>
          <button className="btn btn-ghost btn-sm" onClick={() => setShowNewChapterForm(false)}>
            Cancel
          </button>
        </div>
      )}

      {/* Editor */}
      {loading ? (
        <div className="chapter-editor-loading">
          <p>Loading...</p>
        </div>
      ) : isEditing ? (
        <WikiEditor
          value={content}
          onChange={(newContent) => {
            setContent(newContent)
            setHasChanges(true)
          }}
        />
      ) : (
        <div className="chapter-editor-preview">
          <WikiEditor value={content} readOnly={true} />
        </div>
      )}
    </div>
  )
}
