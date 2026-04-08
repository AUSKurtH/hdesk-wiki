/**
 * StorageManager - Handles split storage architecture
 *
 * Manages:
 * - JSON metadata in localStorage (settings, app state)
 * - Markdown content in file system (via IndexedDB/File API for web)
 * - File structure and organization
 * - Import/Export operations
 */

const STORAGE_CONFIG = {
  dbName: 'hdeskWikiStorage',
  version: 2, // Incremented to force schema upgrade
  booksStore: 'books',
  chapterStore: 'chapters',
  indexStore: 'index',
}

const PATHS = {
  booksRoot: 'data/books',
  configRoot: 'data/config',
}

class StorageManager {
  constructor() {
    this.db = null
    this.initialized = false
  }

  /**
   * Initialize IndexedDB for file storage
   */
  async init() {
    if (this.initialized) return

    try {
      this.db = await this._openDatabase()
      this.initialized = true
    } catch (error) {
      console.error('Failed to initialize storage:', error)
      throw error
    }
  }

  /**
   * Open or create IndexedDB
   */
  _openDatabase() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(STORAGE_CONFIG.dbName, STORAGE_CONFIG.version)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)

      request.onupgradeneeded = (event) => {
        const db = event.target.result

        // Create object stores if they don't exist
        if (!db.objectStoreNames.contains(STORAGE_CONFIG.booksStore)) {
          db.createObjectStore(STORAGE_CONFIG.booksStore, { keyPath: 'path' })
        }
        if (!db.objectStoreNames.contains(STORAGE_CONFIG.chapterStore)) {
          db.createObjectStore(STORAGE_CONFIG.chapterStore, { keyPath: 'path' })
        }
        if (!db.objectStoreNames.contains(STORAGE_CONFIG.indexStore)) {
          db.createObjectStore(STORAGE_CONFIG.indexStore, { keyPath: 'id' })
        }
        if (!db.objectStoreNames.contains('files')) {
          db.createObjectStore('files', { keyPath: 'path' })
        }
      }
    })
  }

  /**
   * Create a new book
   * @param {Object} metadata - {title, description?, tags?}
   * @returns {Promise<Object>} Book object with id
   */
  async createBook(metadata) {
    await this.init()

    const bookId = this._generateId()
    const bookPath = `${PATHS.booksRoot}/${this._slugify(metadata.title)}-${bookId}`

    const book = {
      id: bookId,
      path: bookPath,
      ...metadata,
      chaptersCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // Store book metadata
    await this._writeToStore(STORAGE_CONFIG.booksStore, {
      path: bookPath,
      data: book,
    })

    // Create chapters order file
    const orderPath = `${bookPath}/Chapters/_order.json`
    await this._writeFile(orderPath, JSON.stringify([], null, 2))

    // Update master index
    await this._updateMasterIndex('addBook', book)

    return book
  }

  /**
   * Create a chapter within a book
   * @param {string} bookId - Book ID
   * @param {Object} metadata - {title, description?}
   * @returns {Promise<Object>} Chapter object
   */
  async createChapter(bookId, metadata) {
    await this.init()

    const chapterId = this._generateId()
    const book = await this.getBook(bookId)
    if (!book) throw new Error(`Book not found: ${bookId}`)

    const chapterPath = `${book.path}/Chapters/Chapter${book.chaptersCount + 1}-${chapterId}`

    const chapter = {
      id: chapterId,
      bookId,
      path: chapterPath,
      order: book.chaptersCount,
      ...metadata,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // Store chapter metadata
    await this._writeToStore(STORAGE_CONFIG.chapterStore, {
      path: chapterPath,
      data: chapter,
    })

    // Create empty Notes.md
    const notesPath = `${chapterPath}/Notes.md`
    await this._writeFile(notesPath, `# ${metadata.title}\n\n`)

    // Update book's chapter order
    await this._updateChapterOrder(book.path, chapterId)

    return chapter
  }

  /**
   * Get book by ID
   * @param {string} bookId
   * @returns {Promise<Object|null>}
   */
  async getBook(bookId) {
    await this.init()

    const books = await this.listBooks()
    return books.find(b => b.id === bookId) || null
  }

  /**
   * Get chapter by ID and book ID
   * @param {string} bookId
   * @param {string} chapterId
   * @returns {Promise<Object|null>}
   */
  async getChapter(bookId, chapterId) {
    await this.init()

    const book = await this.getBook(bookId)
    if (!book) return null

    const chapters = await this.listChapters(bookId)
    const chapter = chapters.find(c => c.id === chapterId) || null

    if (chapter) {
      console.log(`[StorageManager] Retrieved chapter: ${chapterId}`, {
        hasContent: !!chapter.content,
        contentLength: chapter.content?.length || 0,
      })
    }

    return chapter
  }

  /**
   * List all books
   * @returns {Promise<Array>}
   */
  async listBooks() {
    await this.init()

    const tx = this.db.transaction([STORAGE_CONFIG.booksStore], 'readonly')
    const store = tx.objectStore(STORAGE_CONFIG.booksStore)

    return new Promise((resolve, reject) => {
      const request = store.getAll()
      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        const books = request.result.map(item => item.data)
        resolve(books.sort((a, b) =>
          new Date(b.createdAt) - new Date(a.createdAt)
        ))
      }
    })
  }

  /**
   * List chapters in a book
   * @param {string} bookId
   * @returns {Promise<Array>}
   */
  async listChapters(bookId) {
    await this.init()

    const book = await this.getBook(bookId)
    if (!book) return []

    const tx = this.db.transaction([STORAGE_CONFIG.chapterStore], 'readonly')
    const store = tx.objectStore(STORAGE_CONFIG.chapterStore)

    return new Promise((resolve, reject) => {
      const request = store.getAll()
      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        const chapters = request.result
          .map(item => item.data)
          .filter(c => c.bookId === bookId)
        resolve(chapters.sort((a, b) => a.order - b.order))
      }
    })
  }

  /**
   * Read chapter content (Notes.md)
   * @param {string} bookId
   * @param {string} chapterId
   * @returns {Promise<string>} Markdown content
   */
  async readChapterContent(bookId, chapterId) {
    const chapter = await this.getChapter(bookId, chapterId)
    if (!chapter) throw new Error(`Chapter not found: ${chapterId}`)

    console.log(`[StorageManager] Reading content for chapter: ${chapterId}`, {
      hasContent: !!chapter.content,
      contentLength: chapter.content?.length || 0,
    })

    // Primary: content stored in chapter object
    if (chapter.content) {
      console.log(`[StorageManager] Found content in chapter object: ${chapterId}`)
      return chapter.content
    }

    // Fallback: try to read from files store
    try {
      const notesPath = `${chapter.path}/Notes.md`
      const content = await this._readFile(notesPath)
      if (content) {
        console.log(`[StorageManager] Found content in files store: ${chapterId}`)
        return content
      }
    } catch (err) {
      console.warn('[StorageManager] Failed to read from files store:', err)
    }

    console.log(`[StorageManager] No content found for chapter: ${chapterId}`)
    return ''
  }

  /**
   * Write chapter content
   * @param {string} bookId
   * @param {string} chapterId
   * @param {string} content - Markdown content
   * @returns {Promise<void>}
   */
  async writeChapterContent(bookId, chapterId, content) {
    const chapter = await this.getChapter(bookId, chapterId)
    if (!chapter) throw new Error(`Chapter not found: ${chapterId}`)

    console.log(`[StorageManager] Saving content for chapter: ${chapterId}`, {
      length: content.length,
      path: chapter.path,
    })

    // Store content directly in chapter object
    chapter.content = content
    chapter.updatedAt = new Date().toISOString()

    try {
      await this._writeToStore(STORAGE_CONFIG.chapterStore, {
        path: chapter.path,
        data: chapter,
      })
      console.log(`[StorageManager] Chapter saved successfully: ${chapterId}`)
    } catch (err) {
      console.error(`[StorageManager] Failed to save chapter: ${chapterId}`, err)
      throw err
    }

    // Try to also save to files store (optional)
    try {
      const notesPath = `${chapter.path}/Notes.md`
      await this._writeFile(notesPath, content)
    } catch (err) {
      console.warn(`[StorageManager] Failed to save to files store (non-critical):`, err)
    }
  }

  /**
   * Update chapter metadata
   * @param {string} bookId
   * @param {string} chapterId
   * @param {Object} updates
   * @returns {Promise<Object>} Updated chapter
   */
  async updateChapter(bookId, chapterId, updates) {
    const chapter = await this.getChapter(bookId, chapterId)
    if (!chapter) throw new Error(`Chapter not found: ${chapterId}`)

    const updated = {
      ...chapter,
      ...updates,
      updatedAt: new Date().toISOString(),
    }

    await this._writeToStore(STORAGE_CONFIG.chapterStore, {
      path: chapter.path,
      data: updated,
    })

    return updated
  }

  /**
   * Delete chapter
   * @param {string} bookId
   * @param {string} chapterId
   * @returns {Promise<void>}
   */
  async deleteChapter(bookId, chapterId) {
    const chapter = await this.getChapter(bookId, chapterId)
    if (!chapter) throw new Error(`Chapter not found: ${chapterId}`)

    await this._deleteStore(STORAGE_CONFIG.chapterStore, chapter.path)
    await this._updateChapterOrder(
      (await this.getBook(bookId)).path,
      chapterId,
      true // delete flag
    )
  }

  /**
   * Delete book and all chapters
   * @param {string} bookId
   * @returns {Promise<void>}
   */
  async deleteBook(bookId) {
    const book = await this.getBook(bookId)
    if (!book) throw new Error(`Book not found: ${bookId}`)

    // Delete all chapters
    const chapters = await this.listChapters(bookId)
    for (const chapter of chapters) {
      await this._deleteStore(STORAGE_CONFIG.chapterStore, chapter.path)
    }

    // Delete book
    await this._deleteStore(STORAGE_CONFIG.booksStore, book.path)

    // Update master index
    await this._updateMasterIndex('deleteBook', { id: bookId })
  }

  /**
   * Export book as JSON (for backup/transfer)
   * @param {string} bookId
   * @returns {Promise<string>} JSON string with book and chapters
   */
  async exportBook(bookId) {
    const book = await this.getBook(bookId)
    if (!book) throw new Error(`Book not found: ${bookId}`)

    const chapters = await this.listChapters(bookId)
    const chaptersWithContent = await Promise.all(
      chapters.map(async (chapter) => ({
        ...chapter,
        content: await this.readChapterContent(bookId, chapter.id),
      }))
    )

    return JSON.stringify({
      book,
      chapters: chaptersWithContent,
      exportedAt: new Date().toISOString(),
    }, null, 2)
  }

  /**
   * Import book from JSON export
   * @param {string} jsonString
   * @returns {Promise<Object>} Imported book
   */
  async importBook(jsonString) {
    const data = JSON.parse(jsonString)

    // Create book
    const book = await this.createBook({
      title: data.book.title,
      description: data.book.description,
      tags: data.book.tags || [],
    })

    // Create chapters with content
    for (const chapterData of data.chapters) {
      const chapter = await this.createChapter(book.id, {
        title: chapterData.title,
        description: chapterData.description,
      })

      await this.writeChapterContent(book.id, chapter.id, chapterData.content)
    }

    return book
  }

  /**
   * Export entire library as ZIP (client-side preparation)
   * @returns {Promise<Object>} Exportable structure
   */
  async exportLibrary() {
    const books = await this.listBooks()
    const exportData = {
      version: 1,
      exportedAt: new Date().toISOString(),
      books: [],
    }

    for (const book of books) {
      const chapters = await this.listChapters(book.id)
      const chaptersWithContent = await Promise.all(
        chapters.map(async (chapter) => ({
          ...chapter,
          content: await this.readChapterContent(book.id, chapter.id),
        }))
      )

      exportData.books.push({
        ...book,
        chapters: chaptersWithContent,
      })
    }

    return exportData
  }

  /**
   * Get library statistics
   * @returns {Promise<Object>}
   */
  async getStats() {
    const books = await this.listBooks()
    const totalChapters = (
      await Promise.all(
        books.map(b => this.listChapters(b.id).then(ch => ch.length))
      )
    ).reduce((a, b) => a + b, 0)

    return {
      booksCount: books.length,
      chaptersCount: totalChapters,
      lastUpdated: new Date().toISOString(),
    }
  }

  // ============ Private Helpers ============

  /**
   * Write to IndexedDB store
   */
  _writeToStore(storeName, { path, data }) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction([storeName], 'readwrite')
      const store = tx.objectStore(storeName)
      const request = store.put({ path, data })

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  /**
   * Delete from IndexedDB store
   */
  _deleteStore(storeName, path) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction([storeName], 'readwrite')
      const store = tx.objectStore(storeName)
      const request = store.delete(path)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  /**
   * Write file (stored via IndexedDB)
   */
  async _writeFile(path, content) {
    if (!this.db) await this.init()

    const fileData = {
      path,
      content,
      updatedAt: new Date().toISOString(),
    }

    // Store in IndexedDB files store (with error handling)
    return new Promise((resolve, reject) => {
      try {
        const tx = this.db.transaction(['files'], 'readwrite')
        const store = tx.objectStore('files')
        const request = store.put(fileData)

        request.onerror = () => {
          console.warn('Failed to write file to IndexedDB:', request.error)
          reject(request.error)
        }
        request.onsuccess = () => resolve(fileData)
      } catch (err) {
        console.warn('Transaction error writing file:', err)
        reject(err)
      }
    })
  }

  /**
   * Read file from IndexedDB
   */
  async _readFile(path) {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      try {
        const tx = this.db.transaction(['files'], 'readonly')
        const store = tx.objectStore('files')
        const request = store.get(path)

        request.onerror = () => {
          console.warn('Failed to read file from IndexedDB:', request.error)
          reject(request.error)
        }
        request.onsuccess = () => {
          const result = request.result
          resolve(result ? result.content : '')
        }
      } catch (err) {
        console.warn('Transaction error reading file:', err)
        reject(err)
      }
    })
  }

  /**
   * Update chapter ordering
   */
  async _updateChapterOrder(bookPath, chapterId, isDelete = false) {
    const orderPath = `${bookPath}/Chapters/_order.json`
    // Implementation would fetch, update, and write back
  }

  /**
   * Update master index
   */
  async _updateMasterIndex(action, data) {
    // Keeps track of all books for faster lookups
    const tx = this.db.transaction([STORAGE_CONFIG.indexStore], 'readwrite')
    const store = tx.objectStore(STORAGE_CONFIG.indexStore)

    return new Promise((resolve) => {
      const request = store.get('master')
      request.onsuccess = () => {
        let index = request.result || { id: 'master', books: [] }

        if (action === 'addBook') {
          index.books.push({ id: data.id, title: data.title })
        } else if (action === 'deleteBook') {
          index.books = index.books.filter(b => b.id !== data.id)
        }

        store.put(index)
        resolve()
      }
    })
  }

  /**
   * Generate unique ID
   */
  _generateId() {
    return Math.random().toString(36).substr(2, 9)
  }

  /**
   * Convert string to URL-safe slug
   */
  _slugify(text) {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }
}

export default new StorageManager()
