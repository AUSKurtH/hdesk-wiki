import React, { useState } from 'react'
import {
  Plus,
  Trash2,
  Pencil,
  Check,
  X,
  Download,
  Upload,
  RotateCcw,
} from 'lucide-react'
import useAppStore from '../store/useAppStore.js'

// ── Tool Form ────────────────────────────────────────────────────────────────

function ToolForm({ tool, categories, onSave, onCancel }) {
  const [form, setForm] = useState({
    name: tool?.name || '',
    url: tool?.url || '',
    icon: tool?.icon || 'Globe',
    category: tool?.category || categories[0] || '',
    description: tool?.description || '',
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.url.trim()) return
    onSave(form)
  }

  return (
    <form className="tool-form card" onSubmit={handleSubmit}>
      <h3 className="tool-form-title">{tool ? 'Edit Tool' : 'Add Tool'}</h3>
      <div className="form-grid">
        <div className="form-field">
          <label className="form-label">Name *</label>
          <input
            className="input"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="e.g. Jira"
            required
          />
        </div>
        <div className="form-field">
          <label className="form-label">URL *</label>
          <input
            className="input"
            name="url"
            type="url"
            value={form.url}
            onChange={handleChange}
            placeholder="https://..."
            required
          />
        </div>
        <div className="form-field">
          <label className="form-label">Icon (Lucide name)</label>
          <input
            className="input"
            name="icon"
            value={form.icon}
            onChange={handleChange}
            placeholder="e.g. Globe"
          />
        </div>
        <div className="form-field">
          <label className="form-label">Category</label>
          <select
            className="input"
            name="category"
            value={form.category}
            onChange={handleChange}
          >
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="form-field form-field-full">
          <label className="form-label">Description</label>
          <input
            className="input"
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Short description"
          />
        </div>
      </div>
      <div className="form-actions">
        <button type="submit" className="btn btn-primary btn-sm">
          <Check size={14} /> Save
        </button>
        <button type="button" className="btn btn-secondary btn-sm" onClick={onCancel}>
          <X size={14} /> Cancel
        </button>
      </div>
    </form>
  )
}

// ── Main Settings Page ───────────────────────────────────────────────────────

export default function Settings() {
  const {
    categories,
    tools,
    addCategory,
    renameCategory,
    deleteCategory,
    addTool,
    updateTool,
    deleteTool,
    exportConfig,
    importConfig,
    resetToDefaults,
  } = useAppStore()

  const [editingTool, setEditingTool] = useState(null) // null | 'new' | tool object
  const [newCatName, setNewCatName] = useState('')
  const [renamingCat, setRenamingCat] = useState(null)
  const [renameDraft, setRenameDraft] = useState('')
  const [importText, setImportText] = useState('')
  const [importError, setImportError] = useState('')
  const [importSuccess, setImportSuccess] = useState(false)

  // Category handlers
  const handleAddCategory = () => {
    if (!newCatName.trim()) return
    addCategory(newCatName.trim())
    setNewCatName('')
  }

  const handleStartRename = (cat) => {
    setRenamingCat(cat)
    setRenameDraft(cat)
  }

  const handleConfirmRename = () => {
    if (renameDraft.trim() && renameDraft !== renamingCat) {
      renameCategory(renamingCat, renameDraft.trim())
    }
    setRenamingCat(null)
    setRenameDraft('')
  }

  const handleDeleteCategory = (cat) => {
    const toolCount = tools.filter((t) => t.category === cat).length
    const msg = toolCount > 0
      ? `Delete category "${cat}"? This will also delete ${toolCount} tool(s) in it.`
      : `Delete category "${cat}"?`
    if (window.confirm(msg)) deleteCategory(cat)
  }

  // Tool handlers
  const handleSaveTool = (form) => {
    if (editingTool === 'new' || !editingTool?.id) {
      addTool(form)
    } else {
      updateTool(editingTool.id, form)
    }
    setEditingTool(null)
  }

  const handleDeleteTool = (id, name) => {
    if (window.confirm(`Delete tool "${name}"?`)) deleteTool(id)
  }

  // Export/Import
  const handleExport = () => {
    const json = exportConfig()
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'hdesk-wiki-config.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = () => {
    setImportError('')
    setImportSuccess(false)
    if (!importText.trim()) return
    const ok = importConfig(importText)
    if (ok) {
      setImportSuccess(true)
      setImportText('')
    } else {
      setImportError('Invalid JSON. Please check the format and try again.')
    }
  }

  const handleReset = () => {
    if (window.confirm('Reset all settings to defaults? This cannot be undone.')) {
      resetToDefaults()
    }
  }

  return (
    <div className="page page-settings">

      {/* ── Categories ─────────────────────────────────────── */}
      <section className="settings-section card">
        <h2 className="settings-section-title">Categories</h2>
        <ul className="settings-list">
          {categories.map((cat) => (
            <li key={cat} className="settings-list-item">
              {renamingCat === cat ? (
                <div className="settings-list-item-rename">
                  <input
                    className="input input-sm"
                    value={renameDraft}
                    onChange={(e) => setRenameDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleConfirmRename()
                      if (e.key === 'Escape') setRenamingCat(null)
                    }}
                    autoFocus
                  />
                  <button className="btn btn-primary btn-xs" onClick={handleConfirmRename}>
                    <Check size={12} />
                  </button>
                  <button className="btn btn-ghost btn-xs" onClick={() => setRenamingCat(null)}>
                    <X size={12} />
                  </button>
                </div>
              ) : (
                <>
                  <span className="settings-list-item-name">{cat}</span>
                  <div className="settings-list-item-actions">
                    <button
                      className="btn btn-ghost btn-xs"
                      onClick={() => handleStartRename(cat)}
                      title="Rename"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      className="btn btn-ghost btn-xs danger"
                      onClick={() => handleDeleteCategory(cat)}
                      title="Delete"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
        <div className="settings-add-row">
          <input
            className="input input-sm"
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
            placeholder="New category name"
          />
          <button className="btn btn-primary btn-sm" onClick={handleAddCategory} disabled={!newCatName.trim()}>
            <Plus size={14} /> Add
          </button>
        </div>
      </section>

      {/* ── Tools ──────────────────────────────────────────── */}
      <section className="settings-section card">
        <div className="settings-section-header">
          <h2 className="settings-section-title">Tools</h2>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => setEditingTool('new')}
          >
            <Plus size={14} /> Add Tool
          </button>
        </div>

        {(editingTool === 'new' || (editingTool && editingTool !== 'new')) && (
          <ToolForm
            tool={editingTool !== 'new' ? editingTool : null}
            categories={categories}
            onSave={handleSaveTool}
            onCancel={() => setEditingTool(null)}
          />
        )}

        <ul className="settings-list">
          {tools.map((tool) => (
            <li key={tool.id} className="settings-list-item">
              <span className="settings-list-item-name">{tool.name}</span>
              <span className="settings-list-item-meta">{tool.category}</span>
              <div className="settings-list-item-actions">
                <button
                  className="btn btn-ghost btn-xs"
                  onClick={() => setEditingTool(tool)}
                  title="Edit"
                >
                  <Pencil size={13} />
                </button>
                <button
                  className="btn btn-ghost btn-xs danger"
                  onClick={() => handleDeleteTool(tool.id, tool.name)}
                  title="Delete"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* ── Export / Import ────────────────────────────────── */}
      <section className="settings-section card">
        <h2 className="settings-section-title">Export / Import</h2>
        <div className="settings-export-row">
          <button className="btn btn-secondary btn-sm" onClick={handleExport}>
            <Download size={14} /> Export Config
          </button>
        </div>
        <div className="settings-import-area">
          <label className="form-label">Import JSON</label>
          <textarea
            className="input settings-import-textarea"
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            placeholder="Paste exported JSON here..."
            rows={5}
          />
          {importError && <p className="settings-import-error">{importError}</p>}
          {importSuccess && <p className="settings-import-success">Config imported successfully!</p>}
          <button
            className="btn btn-primary btn-sm"
            onClick={handleImport}
            disabled={!importText.trim()}
          >
            <Upload size={14} /> Import
          </button>
        </div>
      </section>

      {/* ── Danger Zone ────────────────────────────────────── */}
      <section className="settings-section card settings-danger-zone">
        <h2 className="settings-section-title">Danger Zone</h2>
        <p className="settings-danger-desc">
          Reset all tools, categories, and documents to factory defaults. This cannot be undone.
        </p>
        <button className="btn btn-danger btn-sm" onClick={handleReset}>
          <RotateCcw size={14} /> Reset to Defaults
        </button>
      </section>
    </div>
  )
}
