# Books Management - Settings Guide

## Overview

The **Documentation Books** section in Settings manages your markdown-based documentation library.

## Visual Structure

```
📚 Book (Container)
 └─ 📄 Chapter/Note (Content)
     └─ markdown file
```

## Features

### Stats Display
- **Books**: Total number of documentation books
- **Chapters**: Total chapters across all books
- **Last Update**: When library was last modified

### Create Book
1. Click **"New Book"** button
2. Enter book title
3. Press Enter or click Create
4. New book appears in list with empty chapters

### Organize Chapters
Each book shows:
- 📚 Book name (clickable to edit)
- 📄 Chapter list below
- **Export** button (downloads as JSON)
- **Delete** button (removes book + chapters)

### Export Book
- Download book as JSON file
- Contains: title, chapters, content
- Use for: backup, sharing, archiving

### Import Book
- Click **"Import"** button
- Select `.json` file from export
- Auto-creates book with all chapters
- Merges into existing library

### Delete Book
- Removes book and all chapters
- Cannot be undone
- Confirm before deletion

## Storage Structure

Each book creates:
```
data/books/book-name/
├── metadata.json
└── Chapters/
    ├── chapter1/
    │   ├── metadata.json
    │   └── Notes.md
    └── _order.json
```

## Usage Tips

**Backup regularly**
- Use Export to save books
- Keep JSON files as backup

**Organize hierarchically**
- 1 Book = 1 Topic
- Chapters = Subtopics
- Notes = Content

**Naming conventions**
- Clear, descriptive titles
- Use consistent capitalization
- Avoid special characters

**Performance**
- Books with 100+ chapters load fine
- Large content auto-stored in IndexedDB
- No localStorage bloat

## Common Tasks

### Backup entire library
1. Navigate to Settings > Documentation Books
2. For each book: click Export
3. Save JSON files locally

### Move chapters between books
1. Export source book
2. Delete source book
3. Edit JSON to reorganize chapters
4. Import edited JSON

### Share a single book
1. Click Export on book
2. Send JSON file to colleague
3. Colleague clicks Import

### Restore from backup
1. Click Import
2. Select previously exported JSON file
3. Original book recreated with content

## Troubleshooting

**Import fails**
- Check file is valid JSON
- Verify downloaded from export
- Try with different file

**Book won't delete**
- Close any editor windows
- Confirm deletion prompt
- Try again

**Chapters not showing**
- Refresh page (F5)
- Check book was created successfully
- Verify no error message

**Export not downloading**
- Check browser download settings
- Try different book
- Clear browser cache

## Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Create book | Type title + Enter |
| Cancel | Escape |
| Delete book | Click trash icon + confirm |
| Export book | Click download icon |
| Import | Click upload button |

## Best Practices

✓ **Regular exports** - Keep backups updated  
✓ **Clear titles** - Easy to find books  
✓ **Organized chapters** - Logical structure  
✓ **Version control** - Track changes  
✓ **Backup exports** - External storage  

---

**Integrated with**: Markdown editor, full-text search  
**Storage**: IndexedDB + JSON metadata
