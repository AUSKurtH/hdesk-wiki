/**
 * useBooksStore - Zustand hook for managing books with new split storage
 *
 * This hook bridges between the React component layer and StorageManager
 * Handles caching, UI state, and async operations
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import StorageManager from '@/lib/StorageManager'

const useBooksStore = create(
  persist(
    (set, get) => ({
      // ============ State ============
      books: [],
      chapters: {},
      currentBook: null,
      currentChapter: null,
      contentCache: {}, // { `${bookId}:${chapterId}`: content }
      loading: false,
      error: null,

      // ============ Books Actions ============

      /**
       * Load all books
       */
      loadBooks: async () => {
        set({ loading: true, error: null })
        try {
          const books = await StorageManager.listBooks()
          set({ books })
          return books
        } catch (error) {
          set({ error: error.message })
          throw error
        } finally {
          set({ loading: false })
        }
      },

      /**
       * Create new book
       */
      createBook: async (metadata) => {
        set({ loading: true, error: null })
        try {
          const book = await StorageManager.createBook(metadata)
          set((state) => ({
            books: [book, ...state.books],
          }))
          return book
        } catch (error) {
          set({ error: error.message })
          throw error
        } finally {
          set({ loading: false })
        }
      },

      /**
       * Select a book to view
       */
      selectBook: async (bookId) => {
        try {
          const book = await StorageManager.getBook(bookId)
          const chapters = await StorageManager.listChapters(bookId)
          set({
            currentBook: book,
            chapters: {
              ...get().chapters,
              [bookId]: chapters,
            },
          })
          return book
        } catch (error) {
          set({ error: error.message })
          throw error
        }
      },

      /**
       * Update book metadata
       */
      updateBook: async (bookId, updates) => {
        set({ loading: true, error: null })
        try {
          // Note: StorageManager would need updateBook method
          // For now, this updates local state
          set((state) => ({
            books: state.books.map(b =>
              b.id === bookId ? { ...b, ...updates } : b
            ),
            currentBook: state.currentBook?.id === bookId
              ? { ...state.currentBook, ...updates }
              : state.currentBook,
          }))
        } catch (error) {
          set({ error: error.message })
          throw error
        } finally {
          set({ loading: false })
        }
      },

      /**
       * Delete book
       */
      deleteBook: async (bookId) => {
        set({ loading: true, error: null })
        try {
          await StorageManager.deleteBook(bookId)
          set((state) => {
            const newChapters = { ...state.chapters }
            delete newChapters[bookId]
            return {
              books: state.books.filter(b => b.id !== bookId),
              chapters: newChapters,
              currentBook: state.currentBook?.id === bookId ? null : state.currentBook,
            }
          })
        } catch (error) {
          set({ error: error.message })
          throw error
        } finally {
          set({ loading: false })
        }
      },

      // ============ Chapters Actions ============

      /**
       * Load chapters for a book
       */
      loadChapters: async (bookId) => {
        try {
          const chapters = await StorageManager.listChapters(bookId)
          set((state) => ({
            chapters: {
              ...state.chapters,
              [bookId]: chapters,
            },
          }))
          return chapters
        } catch (error) {
          set({ error: error.message })
          throw error
        }
      },

      /**
       * Create chapter
       */
      createChapter: async (bookId, metadata) => {
        set({ loading: true, error: null })
        try {
          const chapter = await StorageManager.createChapter(bookId, metadata)
          set((state) => ({
            chapters: {
              ...state.chapters,
              [bookId]: [...(state.chapters[bookId] || []), chapter],
            },
          }))
          return chapter
        } catch (error) {
          set({ error: error.message })
          throw error
        } finally {
          set({ loading: false })
        }
      },

      /**
       * Select a chapter to edit
       */
      selectChapter: (chapterId) => {
        set({ currentChapter: chapterId })
      },

      /**
       * Update chapter metadata
       */
      updateChapter: async (bookId, chapterId, updates) => {
        set({ loading: true, error: null })
        try {
          const updated = await StorageManager.updateChapter(bookId, chapterId, updates)
          set((state) => ({
            chapters: {
              ...state.chapters,
              [bookId]: (state.chapters[bookId] || []).map(c =>
                c.id === chapterId ? updated : c
              ),
            },
            currentChapter: state.currentChapter === chapterId ? updated : state.currentChapter,
          }))
          return updated
        } catch (error) {
          set({ error: error.message })
          throw error
        } finally {
          set({ loading: false })
        }
      },

      /**
       * Delete chapter
       */
      deleteChapter: async (bookId, chapterId) => {
        set({ loading: true, error: null })
        try {
          await StorageManager.deleteChapter(bookId, chapterId)
          set((state) => ({
            chapters: {
              ...state.chapters,
              [bookId]: (state.chapters[bookId] || []).filter(c => c.id !== chapterId),
            },
            currentChapter: state.currentChapter === chapterId ? null : state.currentChapter,
          }))
        } catch (error) {
          set({ error: error.message })
          throw error
        } finally {
          set({ loading: false })
        }
      },

      // ============ Content Actions ============

      /**
       * Load chapter content with caching
       */
      loadContent: async (bookId, chapterId) => {
        const cacheKey = `${bookId}:${chapterId}`
        const cached = get().contentCache[cacheKey]
        if (cached) return cached

        set({ loading: true, error: null })
        try {
          const content = await StorageManager.readChapterContent(bookId, chapterId)
          set((state) => ({
            contentCache: {
              ...state.contentCache,
              [cacheKey]: content,
            },
          }))
          return content
        } catch (error) {
          set({ error: error.message })
          throw error
        } finally {
          set({ loading: false })
        }
      },

      /**
       * Save chapter content
       */
      saveContent: async (bookId, chapterId, content) => {
        set({ loading: true, error: null })
        try {
          await StorageManager.writeChapterContent(bookId, chapterId, content)
          const cacheKey = `${bookId}:${chapterId}`
          set((state) => ({
            contentCache: {
              ...state.contentCache,
              [cacheKey]: content,
            },
          }))
        } catch (error) {
          set({ error: error.message })
          throw error
        } finally {
          set({ loading: false })
        }
      },

      /**
       * Clear content cache
       */
      clearContentCache: (bookId, chapterId) => {
        const cacheKey = `${bookId}:${chapterId}`
        set((state) => {
          const newCache = { ...state.contentCache }
          delete newCache[cacheKey]
          return { contentCache: newCache }
        })
      },

      /**
       * Clear all caches
       */
      clearAllCaches: () => {
        set({ contentCache: {} })
      },

      // ============ Reordering ============

      /**
       * Reorder chapters within a book
       */
      reorderChapters: async (bookId, orderedChapterIds) => {
        try {
          const chapters = await StorageManager.listChapters(bookId)

          // Update order for each chapter
          for (let i = 0; i < orderedChapterIds.length; i++) {
            const chapterId = orderedChapterIds[i]
            const chapter = chapters.find(c => c.id === chapterId)
            if (chapter) {
              await StorageManager.updateChapter(bookId, chapterId, { order: i })
            }
          }

          // Refresh chapters
          await StorageManager.init()
          const updated = await StorageManager.listChapters(bookId)
          set((state) => ({
            chapters: {
              ...state.chapters,
              [bookId]: updated,
            },
          }))
        } catch (error) {
          set({ error: error.message })
          throw error
        }
      },

      // ============ Import/Export ============

      /**
       * Export single book
       */
      exportBook: async (bookId) => {
        try {
          return await StorageManager.exportBook(bookId)
        } catch (error) {
          set({ error: error.message })
          throw error
        }
      },

      /**
       * Import book from JSON
       */
      importBook: async (jsonString) => {
        set({ loading: true, error: null })
        try {
          const book = await StorageManager.importBook(jsonString)
          // Refresh book list
          const books = await StorageManager.listBooks()
          set({ books })
          return book
        } catch (error) {
          set({ error: error.message })
          throw error
        } finally {
          set({ loading: false })
        }
      },

      /**
       * Export entire library
       */
      exportLibrary: async () => {
        try {
          return await StorageManager.exportLibrary()
        } catch (error) {
          set({ error: error.message })
          throw error
        }
      },

      /**
       * Get library stats
       */
      getStats: async () => {
        try {
          return await StorageManager.getStats()
        } catch (error) {
          set({ error: error.message })
          throw error
        }
      },

      // ============ UI State ============

      /**
       * Clear error message
       */
      clearError: () => set({ error: null }),

      /**
       * Reset store
       */
      reset: () => set({
        books: [],
        chapters: {},
        currentBook: null,
        currentChapter: null,
        contentCache: {},
        loading: false,
        error: null,
      }),
    }),
    {
      name: 'hdesk_books_store',
      partialize: (state) => ({
        // Only persist metadata, not full content
        books: state.books,
        chapters: state.chapters,
        currentBook: state.currentBook,
        currentChapter: state.currentChapter,
      }),
    }
  )
)

export default useBooksStore
