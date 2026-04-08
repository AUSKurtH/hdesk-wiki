# Split Storage Architecture

## Overview
The application uses a hybrid storage approach:
- **JSON Storage**: Application settings and metadata (kept in localStorage)
- **Markdown Files**: Notes, books, and chapter content (file system)

## Directory Structure

```
data/
├── books/
│   ├── BookName/
│   │   ├── metadata.json          # Book metadata (title, description, tags)
│   │   ├── Chapters/
│   │   │   ├── Chapter1/
│   │   │   │   ├── metadata.json  # Chapter metadata
│   │   │   │   ├── Notes.md       # Chapter content (markdown)
│   │   │   │   └── attachments/   # Images, files, etc.
│   │   │   ├── Chapter2/
│   │   │   │   ├── metadata.json
│   │   │   │   └── Notes.md
│   │   │   └── _order.json        # Chapter ordering
│   │   └── attachments/           # Shared book attachments
│   └── AnotherBook/
│       └── ...
├── config/
│   ├── app-settings.json          # UI scale, theme, etc.
│   ├── tools.json                 # Dashboard tools
│   ├── categories.json            # Tool categories
│   ├── workboard.json             # Work board columns & tools
│   ├── self-admin.json            # Self-admin tools & categories
│   └── themes.json                # Custom themes
└── .index.json                    # Master index of all books
```

## JSON Storage (localStorage)
**Key**: `hdesk_wiki_store`

Stores:
- UI state (theme, scale, active doc)
- Metadata references
- Ordering information
- User preferences

Removed from JSON:
- Doc content (moved to markdown files)
- Large text fields

## Data Models

### Book
```typescript
{
  id: string                    // UUID
  title: string
  description?: string
  tags: string[]
  createdAt: ISO8601
  updatedAt: ISO8601
  chaptersCount: number
}
```

### Chapter
```typescript
{
  id: string                    // UUID
  bookId: string
  title: string
  description?: string
  order: number
  createdAt: ISO8601
  updatedAt: ISO8601
  contentPath: string           // Relative path to Notes.md
}
```

### App Settings
```typescript
{
  uiScale: number              // 0.5 - 1.5
  theme: string
  lastLightTheme: string
  lastDarkTheme: string
  customThemes: CustomTheme[]
  themeOverrides: Record<string, any>
}
```

## File Operations

### Creating a Book
1. Create `data/books/BookName/` directory
2. Write `metadata.json` with book metadata
3. Create `data/books/BookName/Chapters/` directory
4. Create `_order.json` for chapter ordering
5. Update `.index.json` to include book reference

### Adding a Chapter
1. Create `data/books/BookName/Chapters/ChapterX/` directory
2. Write `metadata.json`
3. Create `Notes.md` with content
4. Update parent chapter `_order.json`

### Updating Content
- Directly edit `.md` file (no sync needed)
- Metadata changes update `.json` files
- UI remains in sync via change detection

## Migration Path

See `src/lib/migrate.js` for automatic migration from old JSON format.

## Storage Interface

See `src/lib/StorageManager.js` for:
- Reading/writing operations
- File system abstraction
- Change detection
- Backup utilities

## Benefits

✅ **Separation of concerns**: Settings vs content  
✅ **Scalability**: Large content doesn't bloat localStorage  
✅ **Version control**: Markdown files are diffable  
✅ **Portability**: Easy to export/import books  
✅ **Offline support**: Content cached locally  
✅ **Human readable**: Markdown is text-based  
