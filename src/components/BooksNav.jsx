/**
 * BooksNav - Navigation sidebar for books and chapters
 * Features: create, delete, drag-and-drop reordering
 */

import React, { useState, useEffect } from 'react'
import {
  ChevronRight,
  ChevronDown,
  BookOpen,
  FileText,
  Plus,
  Trash2,
  GripVertical,
} from 'lucide-react'
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import useBooksStore from '../hooks/useBooksStore'

// Sortable book item
function SortableBookItem({
  book,
  isExpanded,
  bookChapters,
  currentBookId,
  currentChapterId,
  onToggle,
  onSelectChapter,
  onDelete,
  onCreateChapter,
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: book.id })

  const [showChapterForm, setShowChapterForm] = useState(false)
  const [newChapterTitle, setNewChapterTitle] = useState('')

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const handleCreateChapter = async () => {
    if (!newChapterTitle.trim()) return
    await onCreateChapter(book.id, newChapterTitle)
    setNewChapterTitle('')
    setShowChapterForm(false)
  }

  return (
    <div ref={setNodeRef} style={style} className="books-nav-book">
      <div className="books-nav-book-header">
        <button
          className="books-nav-drag-handle"
          {...attributes}
          {...listeners}
          title="Drag to reorder"
        >
          <GripVertical size={14} />
        </button>

        <button
          className="books-nav-toggle"
          onClick={() => onToggle(book.id)}
        >
          {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>

        <button
          className={`books-nav-book-title${currentBookId === book.id ? ' active' : ''}`}
          onClick={() => onToggle(book.id)}
        >
          <BookOpen size={14} />
          <span>{book.title}</span>
        </button>

        <button
          className="books-nav-delete"
          onClick={(e) => {
            e.stopPropagation()
            onDelete(book.id, book.title)
          }}
          title="Delete book"
        >
          <Trash2 size={13} />
        </button>
      </div>

      {/* Chapters List */}
      {isExpanded && (
        <div className="books-nav-chapters">
          {/* Chapter Creation Form */}
          {showChapterForm && (
            <div className="books-nav-chapter-form">
              <input
                type="text"
                className="input input-xs"
                placeholder="Chapter title"
                value={newChapterTitle}
                onChange={(e) => setNewChapterTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreateChapter()
                  if (e.key === 'Escape') {
                    setShowChapterForm(false)
                    setNewChapterTitle('')
                  }
                }}
                autoFocus
              />
              <button
                className="btn btn-xs btn-primary"
                onClick={handleCreateChapter}
              >
                Create
              </button>
              <button
                className="btn btn-xs btn-ghost"
                onClick={() => {
                  setShowChapterForm(false)
                  setNewChapterTitle('')
                }}
              >
                ✕
              </button>
            </div>
          )}

          {/* Chapters */}
          {bookChapters.length === 0 && !showChapterForm && (
            <div className="books-nav-no-chapters">
              <p>No chapters</p>
            </div>
          )}

          <SortableContext
            items={bookChapters.map(c => c.id)}
            strategy={verticalListSortingStrategy}
          >
            {bookChapters.map(chapter => (
              <SortableChapterItem
                key={chapter.id}
                chapter={chapter}
                bookId={book.id}
                isActive={currentBookId === book.id && currentChapterId === chapter.id}
                onSelect={() => onSelectChapter(book.id, chapter.id)}
              />
            ))}
          </SortableContext>

          {/* Add Chapter Button */}
          <button
            className="books-nav-add-chapter-btn"
            onClick={() => setShowChapterForm(true)}
            disabled={showChapterForm}
          >
            <Plus size={12} /> Add Note
          </button>
        </div>
      )}
    </div>
  )
}

// Sortable chapter item
function SortableChapterItem({ chapter, bookId, isActive, onSelect }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: chapter.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} className="books-nav-chapter-wrapper">
      <div className="books-nav-chapter-drag-handle" {...attributes} {...listeners}>
        <GripVertical size={12} />
      </div>
      <button
        className={`books-nav-chapter${isActive ? ' active' : ''}`}
        onClick={onSelect}
      >
        <FileText size={13} />
        <span>{chapter.title}</span>
      </button>
    </div>
  )
}

export default function BooksNav({ currentBookId, currentChapterId, onSelectChapter }) {
  const {
    books,
    chapters,
    loadBooks,
    createBook,
    createChapter,
    deleteBook,
    loadChapters,
    reorderChapters,
  } = useBooksStore()

  const [expandedBooks, setExpandedBooks] = useState({})
  const [newBookTitle, setNewBookTitle] = useState('')
  const [showNewForm, setShowNewForm] = useState(false)
  const [activeId, setActiveId] = useState(null)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

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

  const handleCreateChapter = async (bookId, title) => {
    await createChapter(bookId, { title })
    await loadChapters(bookId)
  }

  const handleDragStart = (event) => {
    setActiveId(event.active.id)
  }

  const handleDragEnd = (event) => {
    setActiveId(null)
    const { active, over } = event

    if (!over || active.id === over.id) return

    // Handle chapter reordering within a book
    for (const bookId in chapters) {
      const bookChapters = chapters[bookId] || []
      const chapterIndex = bookChapters.findIndex(c => c.id === active.id)
      const overIndex = bookChapters.findIndex(c => c.id === over.id)

      if (chapterIndex >= 0 && overIndex >= 0) {
        // Reorder chapters
        const orderedIds = bookChapters.map(c => c.id)
        const newOrder = arrayMove(orderedIds, chapterIndex, overIndex)

        // Persist the new order
        reorderChapters(bookId, newOrder).catch(err => {
          console.error('Failed to reorder chapters:', err)
        })
        return
      }
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
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
            <SortableContext
              items={books.map(b => b.id)}
              strategy={verticalListSortingStrategy}
            >
              {books.map(book => {
                const isExpanded = expandedBooks[book.id]
                const bookChapters = chapters[book.id] || []

                return (
                  <SortableBookItem
                    key={book.id}
                    book={book}
                    isExpanded={isExpanded}
                    bookChapters={bookChapters}
                    currentBookId={currentBookId}
                    currentChapterId={currentChapterId}
                    onToggle={toggleBook}
                    onSelectChapter={onSelectChapter}
                    onDelete={handleDeleteBook}
                    onCreateChapter={handleCreateChapter}
                  />
                )
              })}
            </SortableContext>
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

      <DragOverlay>
        {activeId ? <div className="books-nav-drag-overlay">Moving...</div> : null}
      </DragOverlay>
    </DndContext>
  )
}

