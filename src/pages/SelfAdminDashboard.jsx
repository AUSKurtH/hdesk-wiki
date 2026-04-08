import React, { useState } from 'react'
import { Search, X, Plus, Trash2 } from 'lucide-react'
import ToolGrid from '../components/ToolGrid.jsx'
import QRGPanel from '../components/QRGPanel.jsx'
import useAppStore from '../store/useAppStore.js'
import * as LucideIcons from 'lucide-react'

const ICON_OPTIONS = [
  'Globe', 'Ticket', 'LayoutDashboard', 'MessageSquare', 'Video', 'Mail',
  'Monitor', 'MonitorDot', 'Shield', 'GraduationCap', 'Users', 'KeyRound',
  'Activity', 'BarChart2', 'Zap', 'Database', 'Cloud', 'Lock', 'Bell',
  'Code', 'Terminal', 'Cpu', 'Server', 'Wifi', 'Phone', 'Headphones',
]

const COLOR_PALETTE = [
  { label: 'Default',   value: null },
  { label: 'Blue',      value: '#2B6CB0' },
  { label: 'Teal',      value: '#00A4A6' },
  { label: 'Green',     value: '#2F855A' },
  { label: 'Lime',      value: '#6B8E23' },
  { label: 'Purple',    value: '#6B46C1' },
  { label: 'Pink',      value: '#B83280' },
  { label: 'Red',       value: '#C53030' },
  { label: 'Orange',    value: '#C05621' },
  { label: 'Yellow',    value: '#B7791F' },
  { label: 'Slate',     value: '#4A5568' },
  { label: 'Indigo',    value: '#3C366B' },
  { label: 'Cyan',      value: '#086F83' },
]

function ToolModal({ tool, defaultCategory, onClose }) {
  const categories = useAppStore((s) => s.selfAdminCategories)
  const addTool = useAppStore((s) => s.addSelfAdminTool)
  const updateTool = useAppStore((s) => s.updateSelfAdminTool)
  const deleteTool = useAppStore((s) => s.deleteSelfAdminTool)

  const isEdit = !!tool?.id

  const [form, setForm] = useState({
    name: tool?.name || '',
    url: tool?.url || '',
    icon: tool?.icon || 'Globe',
    color: tool?.color || null,
    category: tool?.category || defaultCategory || categories[0] || '',
    description: tool?.description || '',
  })

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.url.trim()) return
    const toolData = { ...form }
    if (!toolData.url.startsWith('http')) toolData.url = 'https://' + toolData.url
    if (isEdit) {
      updateTool(tool.id, toolData)
    } else {
      addTool(toolData)
    }
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
                    style={{ background: value || 'var(--color-primary-light)', border: value ? `2px solid ${value}` : '2px solid var(--color-border)' }}
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
              <button
                type="button"
                className="btn btn-danger btn-sm"
                onClick={handleDelete}
              >
                Delete
              </button>
            )}
            <div style={{ flex: 1 }} />
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {isEdit ? 'Save Changes' : 'Add Tool'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function SelfAdminToolGrid({ searchQuery = '', onEditTool, onSelectTool, selectedToolId }) {
  const categories = useAppStore((s) => s.selfAdminCategories)
  const tools = useAppStore((s) => s.selfAdminTools)
  const reorderCategories = useAppStore((s) => s.reorderSelfAdminCategories)
  const [collapsed, setCollapsed] = useState({})

  const toggleCategory = (cat) => {
    setCollapsed((prev) => ({ ...prev, [cat]: !prev[cat] }))
  }

  const filteredTools = (cat) => {
    const catTools = tools.filter((t) => t.category === cat)
    if (!searchQuery.trim()) return catTools
    const q = searchQuery.toLowerCase()
    return catTools.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        (t.description || '').toLowerCase().includes(q)
    )
  }

  const visibleCategories = categories.filter((cat) => {
    if (!searchQuery.trim()) return true
    return filteredTools(cat).length > 0
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
        const catTools = filteredTools(cat)
        return (
          <section key={cat} className="tool-category-section">
            <div className="tool-category-header">
              <button
                className="tool-category-title-wrap"
                onClick={() => toggleCategory(cat)}
                type="button"
              >
                <span className="tool-category-chevron">
                  {collapsed[cat] ? <LucideIcons.ChevronRight size={15} /> : <LucideIcons.ChevronDown size={15} />}
                </span>
                <h2 className="tool-category-name">{cat}</h2>
                <span className="tool-category-count">{catTools.length}</span>
              </button>
            </div>

            {!collapsed[cat] && (
              <div className="tool-cards-grid">
                {catTools.map((tool) => {
                  const IconComponent = LucideIcons[tool.icon] || LucideIcons.Globe
                  const cardStyle = tool.color ? {
                    '--card-color': tool.color,
                    background: `${tool.color}18`,
                    borderColor: `${tool.color}55`,
                  } : {}
                  const iconStyle = tool.color ? {
                    background: `${tool.color}30`,
                    color: tool.color,
                  } : {}

                  return (
                    <div
                      key={tool.id}
                      className={`tool-card card${selectedToolId === tool.id ? ' tool-card--selected' : ''}${tool.color ? ' tool-card--colored' : ''}`}
                      style={cardStyle}
                      onClick={() => onSelectTool && onSelectTool(tool)}
                      role="button"
                      tabIndex={0}
                      title={tool.name}
                    >
                      <div className="tool-card-icon" style={iconStyle}>
                        <IconComponent size={28} strokeWidth={1.5} />
                      </div>
                      <div className="tool-card-body">
                        <span className="tool-card-name">{tool.name}</span>
                        {tool.description && (
                          <span className="tool-card-desc">{tool.description}</span>
                        )}
                      </div>
                      {onEditTool && (
                        <button
                          className="tool-card-edit btn btn-ghost btn-sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            onEditTool(tool)
                          }}
                          title="Edit tool"
                        >
                          <LucideIcons.Pencil size={13} />
                        </button>
                      )}
                    </div>
                  )
                })}
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

export default function SelfAdminDashboard() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTool, setSelectedTool] = useState(null)
  const [modalTool, setModalTool] = useState(null)
  const [modalCategory, setModalCategory] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [useRowLayout, setUseRowLayout] = useState(false)
  const [selectedRowForAddingTool, setSelectedRowForAddingTool] = useState(null)

  const tools = useAppStore((s) => s.selfAdminTools)
  const rows = useAppStore((s) => s.selfAdminRows)
  const addSelfAdminRow = useAppStore((s) => s.addSelfAdminRow)
  const deleteSelfAdminRow = useAppStore((s) => s.deleteSelfAdminRow)

  const liveSelectedTool = selectedTool
    ? tools.find((t) => t.id === selectedTool.id) || null
    : null

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

  const handleDeleteRow = (rowId) => {
    if (window.confirm('Delete this row and all tools in it?')) {
      deleteSelfAdminRow(rowId)
    }
  }

  const handleAddRow = () => {
    addSelfAdminRow(`Row ${rows.length + 1}`)
    setUseRowLayout(true)
  }

  const handleAddToolToRow = (rowId) => {
    setSelectedRowForAddingTool(rowId)
    setModalTool(null)
    setModalCategory(rowId) // Use row ID as category
    setShowModal(true)
  }

  // Check if we should use row layout (if rows exist)
  const hasRows = rows.length > 0
  const displayMode = useRowLayout || hasRows ? 'rows' : 'categories'

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
          <button
            className="btn btn-primary btn-sm"
            onClick={handleAddRow}
          >
            <Plus size={15} />
            Add Row
          </button>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => handleEditTool(null, null)}
          >
            <Plus size={15} />
            Add Tool
          </button>
        </div>
      </div>

      {/* Split layout */}
      <div className="dashboard-split">
        <div className="dashboard-left">
          {displayMode === 'rows' && hasRows ? (
            <div className="selfadmin-rows">
              {rows.map((row) => {
                const rowTools = tools.filter((t) => t.category === row.id)
                return (
                  <div key={row.id} className="selfadmin-row-container">
                    <div className="selfadmin-row-header">
                      <h3 className="selfadmin-row-title">{row.name}</h3>
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
                          {rowTools.map((tool) => {
                            const ToolIcon = LucideIcons[tool.icon] || LucideIcons.Globe
                            const cardStyle = tool.color ? {
                              background: `${tool.color}18`,
                              borderColor: `${tool.color}55`,
                            } : {}
                            const iconStyle = tool.color ? {
                              background: `${tool.color}30`,
                              color: tool.color,
                            } : {}
                            return (
                              <div
                                key={tool.id}
                                className="tool-card card"
                                style={cardStyle}
                                onClick={() => setSelectedTool(tool)}
                              >
                                <div className="tool-card-icon" style={iconStyle}>
                                  <ToolIcon size={24} strokeWidth={1.5} />
                                </div>
                                <div className="tool-card-body">
                                  <span className="tool-card-name">{tool.name}</span>
                                  {tool.description && (
                                    <span className="tool-card-desc">{tool.description}</span>
                                  )}
                                </div>
                                <button
                                  className="tool-card-edit btn btn-ghost btn-sm"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleEditTool(tool)
                                  }}
                                  title="Edit tool"
                                >
                                  <LucideIcons.Pencil size={13} />
                                </button>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
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
        />
      )}
    </div>
  )
}
