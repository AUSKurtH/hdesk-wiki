/**
 * Migration - Convert from old JSON storage to split storage architecture
 *
 * Old format: All data (including large markdown content) stored in single JSON in localStorage
 * New format: Settings in JSON (localStorage), content in markdown files (IndexedDB/File API)
 */

import StorageManager from './StorageManager'

class MigrationManager {
  /**
   * Detect if migration is needed
   * @returns {boolean}
   */
  static needsMigration() {
    try {
      const stored = localStorage.getItem('hdesk_wiki_store')
      if (!stored) return false

      const state = JSON.parse(stored)

      // Migration needed if docs contain content (old format)
      // In new format, docs only reference books/chapters
      const hasLargeDocs = state.docs && Object.values(state.docs).some(
        doc => doc.content && doc.content.length > 100
      )

      return hasLargeDocs
    } catch (error) {
      console.warn('Error checking migration status:', error)
      return false
    }
  }

  /**
   * Perform migration from old format to new split storage
   * @returns {Promise<Object>} Migration result summary
   */
  static async migrate() {
    console.log('Starting migration from old format to split storage...')

    try {
      // Step 1: Read old data
      const oldState = this._readOldState()
      console.log('✓ Read old state from localStorage')

      // Step 2: Initialize new storage
      await StorageManager.init()
      console.log('✓ Initialized new StorageManager')

      // Step 3: Migrate docs to books structure
      const migrationResult = await this._migrateDocsToBooks(oldState.docs)
      console.log(`✓ Migrated ${migrationResult.booksCreated} books and ${migrationResult.chaptersCreated} chapters`)

      // Step 4: Update localStorage with new structure (remove large content)
      this._updateLocalStorageForNewFormat(oldState)
      console.log('✓ Updated localStorage for new format')

      // Step 5: Create backup of old state
      this._createBackup(oldState)
      console.log('✓ Created backup of old state')

      return {
        success: true,
        booksCreated: migrationResult.booksCreated,
        chaptersCreated: migrationResult.chaptersCreated,
        timestamp: new Date().toISOString(),
      }
    } catch (error) {
      console.error('Migration failed:', error)
      throw error
    }
  }

  /**
   * Read old application state from localStorage
   * @private
   */
  static _readOldState() {
    const stored = localStorage.getItem('hdesk_wiki_store')
    if (!stored) throw new Error('No existing state found in localStorage')

    return JSON.parse(stored)
  }

  /**
   * Migrate docs to books/chapters structure
   * @private
   */
  static async _migrateDocsToBooks(oldDocs) {
    const result = {
      booksCreated: 0,
      chaptersCreated: 0,
      bookMap: {}, // Maps old doc IDs to new book/chapter IDs
    }

    if (!oldDocs) return result

    // Convert old folder structure to books
    for (const [docId, doc] of Object.entries(oldDocs)) {
      // Skip folders and system docs
      if (doc.type === 'folder' || docId === 'getting-started') {
        continue
      }

      // Check if this is a top-level document that should become a book
      if (!doc.parentId && doc.type === 'file' && doc.content) {
        const book = await StorageManager.createBook({
          title: doc.title,
          description: `Migrated from: ${docId}`,
          tags: ['migrated'],
        })

        // Create a single chapter for this document
        const chapter = await StorageManager.createChapter(book.id, {
          title: doc.title,
          description: doc.content.substring(0, 200), // Use first 200 chars as description
        })

        // Write content to chapter
        await StorageManager.writeChapterContent(book.id, chapter.id, doc.content)

        result.bookMap[docId] = { bookId: book.id, chapterId: chapter.id }
        result.booksCreated++
        result.chaptersCreated++
      }

      // Handle nested documents as chapters within a book
      if (doc.parentId && doc.type === 'file' && doc.content) {
        const parentDoc = oldDocs[doc.parentId]

        if (parentDoc) {
          // Get or create book for parent
          let bookId
          if (result.bookMap[doc.parentId]) {
            bookId = result.bookMap[doc.parentId].bookId
          } else {
            const book = await StorageManager.createBook({
              title: parentDoc.title,
              description: `Parent folder from migration`,
              tags: ['migrated', 'folder-based'],
            })
            bookId = book.id
            result.booksCreated++
          }

          // Create chapter for this document
          const book = await StorageManager.getBook(bookId)
          const chapter = await StorageManager.createChapter(bookId, {
            title: doc.title,
            description: doc.content.substring(0, 200),
          })

          await StorageManager.writeChapterContent(bookId, chapter.id, doc.content)

          result.bookMap[docId] = { bookId, chapterId: chapter.id }
          result.chaptersCreated++
        }
      }
    }

    return result
  }

  /**
   * Update localStorage to remove large content and use new format
   * @private
   */
  static _updateLocalStorageForNewFormat(oldState) {
    // Create new structure with minimal docs (metadata only)
    const newState = {
      ...oldState,
      docs: {}, // Empty - content now in IndexedDB
      docOrder: oldState.docOrder || {},
      // Keep all other state as-is
    }

    // Store updated state
    localStorage.setItem('hdesk_wiki_store', JSON.stringify(newState))
  }

  /**
   * Create backup of old state before migration
   * @private
   */
  static _createBackup(oldState) {
    const backupKey = `hdesk_wiki_backup_${Date.now()}`
    const backupData = {
      version: 'pre-migration-backup',
      migratedAt: new Date().toISOString(),
      data: oldState,
    }

    localStorage.setItem(backupKey, JSON.stringify(backupData))
    console.log(`Backup stored at: ${backupKey}`)
  }

  /**
   * Rollback migration (restore from backup)
   * @param {string} backupKey - Key of backup to restore
   * @private
   */
  static _rollbackMigration(backupKey) {
    const backup = localStorage.getItem(backupKey)
    if (!backup) throw new Error(`Backup not found: ${backupKey}`)

    const backupData = JSON.parse(backup)
    localStorage.setItem('hdesk_wiki_store', JSON.stringify(backupData.data))

    console.log('Migration rolled back from backup')
  }

  /**
   * Get list of available backups
   * @private
   */
  static _getBackups() {
    const backups = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key.startsWith('hdesk_wiki_backup_')) {
        const backup = JSON.parse(localStorage.getItem(key))
        backups.push({
          key,
          migratedAt: backup.migratedAt,
          timestamp: parseInt(key.replace('hdesk_wiki_backup_', '')),
        })
      }
    }
    return backups.sort((a, b) => b.timestamp - a.timestamp)
  }

  /**
   * Verify migration completed successfully
   * @returns {Promise<boolean>}
   */
  static async verifyMigration() {
    try {
      const books = await StorageManager.listBooks()
      const stats = await StorageManager.getStats()

      console.log('Migration Verification:')
      console.log(`  Books: ${stats.booksCount}`)
      console.log(`  Chapters: ${stats.chaptersCount}`)
      console.log(`  Last Updated: ${stats.lastUpdated}`)

      return books.length > 0
    } catch (error) {
      console.error('Migration verification failed:', error)
      return false
    }
  }

  /**
   * One-time setup check - runs on first app load
   * @returns {Promise<boolean>} Whether app should continue loading
   */
  static async setupCheck() {
    // Check if this is first load
    const hasRunSetup = localStorage.getItem('hdesk_wiki_setup_complete')
    if (hasRunSetup) return true

    // Check if migration needed
    if (this.needsMigration()) {
      console.log('Migration needed - starting process')
      try {
        const result = await this.migrate()
        console.log('Migration completed:', result)

        // Verify
        const verified = await this.verifyMigration()
        if (verified) {
          localStorage.setItem('hdesk_wiki_setup_complete', 'true')
          localStorage.setItem('hdesk_wiki_migrated_at', new Date().toISOString())
          return true
        } else {
          throw new Error('Migration verification failed')
        }
      } catch (error) {
        console.error('Setup check failed:', error)
        throw error
      }
    }

    localStorage.setItem('hdesk_wiki_setup_complete', 'true')
    return true
  }
}

export default MigrationManager
