# Integration Guide - Split Storage System

## Quick Start

### 1. Initialize Storage on App Load

In your main `App.jsx` or `main.jsx`:

```javascript
import MigrationManager from '@/lib/migrate'

// Call during app initialization (useEffect in App.jsx)
useEffect(() => {
  MigrationManager.setupCheck()
    .then(() => {
      console.log('Storage system ready')
      setAppReady(true)
    })
    .catch(error => {
      console.error('Storage initialization failed:', error)
      // Show error UI to user
    })
}, [])
```

### 2. Use StorageManager in Components

```javascript
import StorageManager from '@/lib/StorageManager'

export function BooksPanel() {
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    StorageManager.listBooks()
      .then(setBooks)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      {books.map(book => (
        <BookCard key={book.id} book={book} />
      ))}
    </div>
  )
}
```

### 3. Reading Chapter Content

```javascript
import StorageManager from '@/lib/StorageManager'

async function loadChapter(bookId, chapterId) {
  try {
    const content = await StorageManager.readChapterContent(bookId, chapterId)
    return content
  } catch (error) {
    console.error('Failed to load chapter:', error)
  }
}
```

### 4. Writing Chapter Content

```javascript
import StorageManager from '@/lib/StorageManager'

async function saveChapter(bookId, chapterId, content) {
  try {
    await StorageManager.writeChapterContent(bookId, chapterId, content)
    console.log('Chapter saved successfully')
  } catch (error) {
    console.error('Failed to save chapter:', error)
  }
}
```

### 5. Creating Books and Chapters

```javascript
import StorageManager from '@/lib/StorageManager'

async function createNewBook(title) {
  try {
    const book = await StorageManager.createBook({
      title,
      description: 'New book',
      tags: [],
    })

    // Create first chapter
    const chapter = await StorageManager.createChapter(book.id, {
      title: 'Introduction',
    })

    return { book, chapter }
  } catch (error) {
    console.error('Failed to create book:', error)
  }
}
```

## API Reference

### StorageManager Methods

#### Books

```javascript
// Create a new book
const book = await StorageManager.createBook({
  title: 'My Book',
  description: 'Optional description',
  tags: ['tag1', 'tag2']
})

// Get a specific book
const book = await StorageManager.getBook(bookId)

// List all books
const books = await StorageManager.listBooks()

// Delete a book
await StorageManager.deleteBook(bookId)
```

#### Chapters

```javascript
// Create chapter
const chapter = await StorageManager.createChapter(bookId, {
  title: 'Chapter Title',
  description: 'Optional description'
})

// Get chapter
const chapter = await StorageManager.getChapter(bookId, chapterId)

// List chapters
const chapters = await StorageManager.listChapters(bookId)

// Update chapter metadata
const updated = await StorageManager.updateChapter(bookId, chapterId, {
  title: 'New Title',
  description: 'New description'
})

// Delete chapter
await StorageManager.deleteChapter(bookId, chapterId)
```

#### Content

```javascript
// Read markdown content
const content = await StorageManager.readChapterContent(bookId, chapterId)

// Write markdown content
await StorageManager.writeChapterContent(bookId, chapterId, '# New Content\n...')
```

#### Import/Export

```javascript
// Export single book as JSON
const json = await StorageManager.exportBook(bookId)
console.log(json) // JSON string

// Import book from JSON
const importedBook = await StorageManager.importBook(jsonString)

// Export entire library
const libraryData = await StorageManager.exportLibrary()

// Get statistics
const stats = await StorageManager.getStats()
console.log(stats) // { booksCount, chaptersCount, lastUpdated }
```

## Hook Example - useBooks

```javascript
// hooks/useBooks.js
import { useState, useEffect } from 'react'
import StorageManager from '@/lib/StorageManager'

export function useBooks() {
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    StorageManager.listBooks()
      .then(setBooks)
      .catch(setError)
      .finally(() => setLoading(false))
  }, [])

  const createBook = async (metadata) => {
    try {
      const book = await StorageManager.createBook(metadata)
      setBooks(prev => [book, ...prev])
      return book
    } catch (error) {
      setError(error)
      throw error
    }
  }

  const deleteBook = async (bookId) => {
    try {
      await StorageManager.deleteBook(bookId)
      setBooks(prev => prev.filter(b => b.id !== bookId))
    } catch (error) {
      setError(error)
      throw error
    }
  }

  const refreshBooks = async () => {
    try {
      const updated = await StorageManager.listBooks()
      setBooks(updated)
    } catch (error) {
      setError(error)
    }
  }

  return {
    books,
    loading,
    error,
    createBook,
    deleteBook,
    refreshBooks,
  }
}
```

```javascript
// hooks/useChapters.js
import { useState, useCallback } from 'react'
import StorageManager from '@/lib/StorageManager'

export function useChapters(bookId) {
  const [chapters, setChapters] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadChapters = useCallback(async () => {
    if (!bookId) return
    try {
      const data = await StorageManager.listChapters(bookId)
      setChapters(data)
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [bookId])

  useEffect(() => {
    loadChapters()
  }, [loadChapters])

  const createChapter = async (metadata) => {
    const chapter = await StorageManager.createChapter(bookId, metadata)
    setChapters(prev => [...prev, chapter])
    return chapter
  }

  const deleteChapter = async (chapterId) => {
    await StorageManager.deleteChapter(bookId, chapterId)
    setChapters(prev => prev.filter(c => c.id !== chapterId))
  }

  return {
    chapters,
    loading,
    error,
    createChapter,
    deleteChapter,
    refresh: loadChapters,
  }
}
```

## Data Flow

```
User Action (Create Book)
    ↓
StorageManager.createBook()
    ↓
IndexedDB (Store metadata)
    ↓
Create directory structure
    ↓
Return book object
    ↓
Update component state
    ↓
UI renders
```

## Error Handling

```javascript
import StorageManager from '@/lib/StorageManager'

try {
  const content = await StorageManager.readChapterContent(bookId, chapterId)
  setContent(content)
} catch (error) {
  if (error.message.includes('Chapter not found')) {
    // Handle missing chapter
  } else if (error.message.includes('storage')) {
    // Handle storage error
  } else {
    // Handle generic error
  }
}
```

## Migration

### For Users with Old Data

```javascript
import MigrationManager from '@/lib/migrate'

// Automatic on first app load
// Or manual trigger:
async function runMigration() {
  const result = await MigrationManager.migrate()
  console.log(`Migrated ${result.booksCreated} books`)
}
```

### Backup/Restore

```javascript
import MigrationManager from '@/lib/migrate'

// Get available backups
const backups = MigrationManager._getBackups()

// Rollback to specific backup
MigrationManager._rollbackMigration(backups[0].key)
```

## Performance Tips

1. **Batch operations**: Use `Promise.all()` for multiple reads
   ```javascript
   const contents = await Promise.all(
     chapters.map(ch => StorageManager.readChapterContent(bookId, ch.id))
   )
   ```

2. **Cache results**: Store chapter content in component state
   ```javascript
   const [cachedContent, setCachedContent] = useState({})
   ```

3. **Lazy load**: Only fetch content when needed
   ```javascript
   // Don't load all chapter content at once
   // Load on-demand when user opens chapter
   ```

4. **Pagination**: For large book lists
   ```javascript
   const books = await StorageManager.listBooks()
   const paginated = books.slice(0, 20) // First 20
   ```

## Testing

```javascript
// Reset storage for testing
async function resetStorage() {
  await StorageManager.init()
  const books = await StorageManager.listBooks()
  for (const book of books) {
    await StorageManager.deleteBook(book.id)
  }
}
```

## Troubleshooting

**Q: IndexedDB errors in Safari**
- A: Use fallback to localStorage for small data

**Q: Large files slow to save**
- A: Split into multiple chapters or use compression

**Q: Storage quota exceeded**
- A: Implement cleanup of old backups and archived content

**Q: Content not syncing**
- A: Check that StorageManager.init() was called
- A: Verify book/chapter IDs are correct
