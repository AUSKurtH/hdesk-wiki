import React, { useState } from 'react'
import { Search, X, Plus, Trash2, ChevronDown, ChevronRight } from 'lucide-react'
import * as LucideIcons from 'lucide-react'
import ToolCard from '../components/ToolCard.jsx'
import QRGPanel from '../components/QRGPanel.jsx'
import useAppStore from '../store/useAppStore.js'
import { ICON_OPTIONS, COLOR_PALETTE } from '../constants/ui.js'

// ── Tool Modal ────────────────────────────────────────────────────────────────
// Add or edit a tool in the self-admin section.
// `hideCategory` is set when using the row layout, since rows act as categories.

function ToolModal({ tool, defaultCategory, onClose, hideCategory = false }) {
  const categories  = useAppStore((s) => s.selfAdminCategories)
  const addTool     = useAppStore((s) => s.addSelfAdminTool)
  const updateTool  = useAppStore((s) => s.updateSelfAdminTool)
  const deleteTool  = useAppStore((s) => s.deleteSelfAdminTool)

  const isEdit = !!tool?.id

  const [form, setForm] = useState({
    name:        tool?.name        || '',
    url:         tool?.url         || '',
    icon:        tool?.icon        || 'Globe',
    color:       tool?.color       || null,
    category:    tool?.category    || defaultCategory || categories[0] || '',
    description: tool?.description || '',
  })

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.url.trim()) return
    const data = { ...form }
    if (!data.url.startsWith('http')) data.url = 'https://' + data.url
    if (isEdit) updateTool(tool.id, data)
    else        addTool(data)
    onClose()
  }

  const handleDelete = () => {
    if (window.confirm(`Delete "${tool.name}"?`)) {
      deleteTool(tool.id)
      onClose()
    }
  }

  const PreviewIcon = LucideIcons[form.icon] || LucideIcons.Globe

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">{isEdit ? 'Edit Tool' : 'Add Tool'}</h2>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-group">
            <label className="label">Name</label>
            <input
              className="input"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="Tool name"
              required
            />
          </div>

          <div className="form-group">
            <label className="label">URL</label>
            <input
              className="input"
              value={form.url}
              onChange={(e) => set('url', e.target.value)}
              placeholder="https://example.com"
              required
            />
          </div>

          <div className="form-group">
            <label className="label">Description (optional)</label>
            <input
              className="input"
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              placeholder="Short description"
            />
          </div>

          {!hideCategory && (
            <div className="form-group">
              <label className="label">Category</label>
              <select
                className="input"
                value={form.category}
                onChange={(e) => set('category', e.target.value)}
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          )}

          <div className="form-group">
            <label className="label">Icon</label>
            <div className="icon-picker">
              <div className="icon-preview">
                <PreviewIcon size={24} />
                <span>{form.icon}</span>
              </div>
              <div className="icon-grid">
                {ICON_OPTIONS.map((iconName) => {
                  const Icon = LucideIcons[iconName] || LucideIcons.Globe
                  return (
                    <button
                      key={iconName}
                      type="button"
                      className={`icon-btn ${form.icon === iconName ? 'selected' : ''}`}
                      onClick={() => set('icon', iconName)}
                      title={iconName}
                    >
                      <Icon size={18} />
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="label">Button Colour</label>
            <div className="color-picker">
              {COLOR_PALETTE.map(({ label, value }) => {
                const isSelected = form.color === value
                return (
                  <button
                    key={label}
                    type="button"
                    className={`color-swatch${isSelected ? ' color-swatch--selected' : ''}`}
                    style={{
                      background: value || 'var(--color-primary-light)',
                      border: value ? `2px solid ${value}` : '2px solid var(--color-border)',
                    }}
                    onClick={() => set('color', value)}
                    title={label}
                  >
                    {isSelected && <span className="color-swatch-check">✓</span>}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="modal-footer">
            {isEdit && (
              <button type="button" className="btn btn-danger btn-sm" onClick={handleDelete}>
                Delete
              </button>
            )}
            <div style={{ flex: 1 }} />
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">
              {isEdit ? 'Save Changes' : 'Add Tool'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Category-based Tool Grid ──────────────────────────────────────────────────
// Used when no rows exist. Groups tools by category with collapsible sections.

function SelfAdminToolGrid({ searchQuery = '', onEditTool, onSelectTool, selectedToolId }) {
  const categories = useAppStore((s) => s.selfAdminCategories)
  const tools      = useAppStore((s) => s.selfAdminTools)
  const [collapsed, setCollapsed] = useState({})

  const toggleCategory = (cat) => {
    setCollapsed((prev) => ({ ...prev, [cat]: !prev[cat] }))
  }

  const filterTools = (cat) => {
    const catTools = tools.filter((t) => t.category === cat)
    if (!searchQuery.trim()) return catTools
    const q = searchQuery.toLowerCase()
    return catTools.filter(
      (t) => t.name.toLowerCase().includes(q) || (t.description || '').toLowerCase().includes(q)
    )
  }

  const visibleCategories = categories.filter((cat) => {
    if (!searchQuery.trim()) return true
    return filterTools(cat).length > 0
  })

  if (visibleCategories.length === 0) {
    return (
      <div className="tool-grid-empty">
        <p>No categories yet. Add one in Settings to get started.</p>
      </div>
    )
  }

  return (
    <div className="tool-grid-container">
      {visibleCategories.map((cat) => {
        const catTools = filterTools(cat)
        return (
          <section key={cat} className="tool-category-section">
            <div className="tool-category-header">
              <button
                className="tool-category-title-wrap"
                onClick={() => toggleCategory(cat)}
                type="button"
              >
                <span className="tool-category-chevron">
                  {collapsed[cat] ? <ChevronRight size={15} /> : <ChevronDown size={15} />}
                </span>
                <h2 className="tool-category-name">{cat}</h2>
                <span className="tool-category-count">{catTools.length}</span>
              </button>
            </div>

            {!collapsed[cat] && (
              <div className="tool-cards-grid">
                {catTools.map((tool) => (
                  <ToolCard
                    key={tool.id}
                    tool={tool}
                    onSelect={onSelectTool}
                    onEdit={onEditTool}
                    selected={tool.id === selectedToolId}
                  />
                ))}
                <button
                  className="tool-add-card"
                  onClick={() => onEditTool && onEditTool(null, cat)}
                  title={`Add tool to ${cat}`}
                >
                  <Plus size={20} />
                  <span>Add Tool</span>
                </button>
              </div>
            )}
          </section>
        )
      })}
    </div>
  )
}

// ── SelfAdminDashboard Page ───────────────────────────────────────────────────

export default function SelfAdminDashboard() {
  const tools            = useAppStore((s) => s.selfAdminTools)
  const rows             = useAppStore((s) => s.selfAdminRows)
  const addSelfAdminRow  = useAppStore((s) => s.addSelfAdminRow)
  const renameSelfAdminRow = useAppStore((s) => s.renameSelfAdminRow)
  const deleteSelfAdminRow = useAppStore((s) => s.deleteSelfAdminRow)

  const [searchQuery, setSearchQuery]   = useState('')
  const [selectedTool, setSelectedTool] = useState(null)

  // Modal state
  const [modalTool, setModalTool]         = useState(null)
  const [modalCategory, setModalCategory] = useState(null)
  const [showModal, setShowModal]         = useState(false)

  // Inline row rename state
  const [editingRowId, setEditingRowId]     = useState(null)
  const [editingRowName, setEditingRowName] = useState('')

  // Keep selected tool in sync with the store
  const liveSelectedTool = selectedTool
    ? tools.find((t) => t.id === selectedTool.id) || null
    : null

  // Rows exist → use row layout; otherwise fall back to category grid
  const hasRows    = rows.length > 0
  const displayMode = hasRows ? 'rows' : 'categories'

  // ── Handlers ────────────────────────────────────────────────────────────

  const handleEditTool = (tool, category = null) => {
    setModalTool(tool)
    setModalCategory(category)
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setModalTool(null)
    setModalCategory(null)
  }

  const handleAddRow = () => {
    addSelfAdminRow(`Row ${rows.length + 1}`)
  }

  const handleAddToolToRow = (rowId) => {
    setModalTool(null)
    setModalCategory(rowId)   // row ID acts as the tool's category
    setShowModal(true)
  }

  const handleDeleteRow = (rowId) => {
    if (window.confirm('Delete this row and all tools in it?')) {
      deleteSelfAdminRow(rowId)
    }
  }

  const handleRenameRow = (rowId, currentName) => {
    setEditingRowId(rowId)
    setEditingRowName(currentName)
  }

  const handleSaveRowName = (rowId) => {
    if (editingRowName.trim()) renameSelfAdminRow(rowId, editingRowName)
    setEditingRowId(null)
    setEditingRowName('')
  }

  return (
    <div className="dashboard">
      {/* Toolbar */}
      <div className="dashboard-toolbar">
        <div className="search-wrap">
          <Search size={16} className="search-icon" />
          <input
            className="search-input"
            type="text"
            placeholder="Search tools..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              className="search-clear"
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-primary btn-sm" onClick={handleAddRow}>
            <Plus size={15} /> Add Row
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => handleEditTool(null, null)}>
            <Plus size={15} /> Add Tool
          </button>
        </div>
      </div>

      {/* Split layout: tool grid left, details panel right */}
      <div className="dashboard-split">
        <div className="dashboard-left">

          {/* Row layout */}
          {displayMode === 'rows' && (
            <div className="selfadmin-rows">
              {rows.map((row) => {
                const rowTools = tools.filter((t) => t.category === row.id)
                return (
                  <div key={row.id} className="selfadmin-row-container">
                    <div className="selfadmin-row-header">
                      {editingRowId === row.id ? (
                        <input
                          type="text"
                          className="selfadmin-row-title-input"
                          value={editingRowName}
                          onChange={(e) => setEditingRowName(e.target.value)}
                          onBlur={() => handleSaveRowName(row.id)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter')  handleSaveRowName(row.id)
                            if (e.key === 'Escape') { setEditingRowId(null); setEditingRowName('') }
                          }}
                          autoFocus
                        />
                      ) : (
                        <h3
                          className="selfadmin-row-title"
                          onClick={() => handleRenameRow(row.id, row.name)}
                          title="Click to rename"
                        >
                          {row.name}
                        </h3>
                      )}
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                          {rowTools.length} tools
                        </span>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => handleAddToolToRow(row.id)}
                          title="Add tool to this row"
                        >
                          <Plus size={14} />
                        </button>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => handleDeleteRow(row.id)}
                          title="Delete row"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="selfadmin-row-content">
                      {rowTools.length === 0 ? (
                        <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '40px 20px' }}>
                          No tools in this row. Click the + button to add one.
                        </p>
                      ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '12px', padding: '12px' }}>
                          {rowTools.map((tool) => (
                            <ToolCard
                              key={tool.id}
                              tool={tool}
                              onSelect={setSelectedTool}
                              onEdit={handleEditTool}
                              selected={liveSelectedTool?.id === tool.id}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Category grid (shown when no rows exist) */}
          {displayMode === 'categories' && (
            <SelfAdminToolGrid
              searchQuery={searchQuery}
              onEditTool={handleEditTool}
              onSelectTool={setSelectedTool}
              selectedToolId={liveSelectedTool?.id}
            />
          )}

        </div>

        <div className="dashboard-right">
          <QRGPanel tool={liveSelectedTool} />
        </div>
      </div>

      {showModal && (
        <ToolModal
          tool={modalTool}
          defaultCategory={modalCategory}
          onClose={handleCloseModal}
          hideCategory={hasRows}
        />
      )}
    </div>
  )
}
