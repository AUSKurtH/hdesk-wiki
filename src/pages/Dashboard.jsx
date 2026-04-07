import React, { useState } from 'react'
import { Search, X, Plus } from 'lucide-react'
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

function ToolModal({ tool, defaultCategory, onClose }) {
  const categories = useAppStore((s) => s.categories)
  const addTool = useAppStore((s) => s.addTool)
  const updateTool = useAppStore((s) => s.updateTool)
  const deleteTool = useAppStore((s) => s.deleteTool)

  const isEdit = !!tool?.id

  const [form, setForm] = useState({
    name: tool?.name || '',
    url: tool?.url || '',
    icon: tool?.icon || 'Globe',
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

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTool, setSelectedTool] = useState(null)
  const [modalTool, setModalTool] = useState(null)
  const [modalCategory, setModalCategory] = useState(null)
  const [showModal, setShowModal] = useState(false)

  // Keep selectedTool in sync if it gets edited via the store
  const tools = useAppStore((s) => s.tools)
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
        <button
          className="btn btn-primary btn-sm"
          onClick={() => handleEditTool(null, null)}
        >
          <Plus size={15} />
          Add Tool
        </button>
      </div>

      {/* Split layout */}
      <div className="dashboard-split">
        <div className="dashboard-left">
          <ToolGrid
            searchQuery={searchQuery}
            onEditTool={handleEditTool}
            onSelectTool={setSelectedTool}
            selectedToolId={liveSelectedTool?.id}
          />
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
