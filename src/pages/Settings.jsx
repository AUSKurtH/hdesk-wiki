import React, { useState, useRef } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  Plus,
  Trash2,
  Pencil,
  Check,
  X,
  Download,
  Upload,
  RotateCcw,
  GripVertical,
  ChevronDown,
  ChevronRight,
} from 'lucide-react'
import * as LucideIcons from 'lucide-react'
import useAppStore from '../store/useAppStore.js'

// ── Theme picker ──────────────────────────────────────────────────────────────

const ALL_THEMES = [
  { id: 'light',    label: 'Light',    dark: false, preview: ['#F8FAFC','#FFFFFF','#2B6CB0','#1A202C'] },
  { id: 'dark',     label: 'Dark',     dark: true,  preview: ['#1A202C','#2D3748','#4299E1','#F7FAFC'] },
  { id: 'midnight', label: 'Midnight', dark: true,  preview: ['#0D1117','#161B22','#7C9EFF','#E6EDF3'] },
  { id: 'forest',   label: 'Forest',   dark: true,  preview: ['#0C1A0E','#162A1A','#4ADE80','#DCFCE7'] },
  { id: 'ocean',    label: 'Ocean',    dark: true,  preview: ['#03111C','#082032','#38BDF8','#E0F2FE'] },
  { id: 'warm',     label: 'Warm',     dark: false, preview: ['#FFFBF0','#FFFFFF','#B45309','#1C1917'] },
]

function ThemeSection() {
  const theme = useAppStore((s) => s.theme)
  const setTheme = useAppStore((s) => s.setTheme)

  return (
    <section className="settings-section card">
      <h2 className="settings-section-title">Theme</h2>
      <p className="settings-section-desc">Choose a colour theme for the whole app. The light/dark toggle in the header will switch between Light and Dark.</p>
      <div className="theme-picker-grid">
        {ALL_THEMES.map((t) => {
          const [bg, surface, primary, text] = t.preview
          const active = theme === t.id
          return (
            <button
              key={t.id}
              className={`theme-swatch${active ? ' theme-swatch--active' : ''}`}
              onClick={() => setTheme(t.id)}
              title={t.label}
            >
              <div className="theme-swatch-preview" style={{ background: bg }}>
                <div className="theme-swatch-sidebar" style={{ background: surface }} />
                <div className="theme-swatch-content">
                  <div className="theme-swatch-bar" style={{ background: primary }} />
                  <div className="theme-swatch-bar theme-swatch-bar--thin" style={{ background: text, opacity: 0.4 }} />
                  <div className="theme-swatch-bar theme-swatch-bar--thin" style={{ background: text, opacity: 0.25 }} />
                </div>
              </div>
              <span className="theme-swatch-label" style={{ color: active ? 'var(--color-primary)' : undefined }}>
                {active && <Check size={11} style={{ marginRight: 3 }} />}
                {t.label}
              </span>
            </button>
          )
        })}
      </div>
    </section>
  )
}

const ICON_OPTIONS = [
  'Globe', 'Ticket', 'LayoutDashboard', 'MessageSquare', 'Video', 'Mail',
  'Monitor', 'MonitorDot', 'Shield', 'GraduationCap', 'Users', 'KeyRound',
  'Activity', 'BarChart2', 'Zap', 'Database', 'Cloud', 'Lock', 'Bell',
  'Code', 'Terminal', 'Cpu', 'Server', 'Wifi', 'Phone', 'Headphones',
]

// ── Sortable Tool Row ─────────────────────────────────────────────────────────

function SortableToolRow({ tool, onEdit, onDelete }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: tool.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const Icon = LucideIcons[tool.icon] || LucideIcons.Globe

  return (
    <div ref={setNodeRef} style={style} className="settings-tool-row">
      <button className="drag-handle" {...attributes} {...listeners} aria-label="Drag to reorder">
        <GripVertical size={16} />
      </button>
      <div className="settings-tool-icon-wrap">
        <Icon size={16} />
      </div>
      <div className="settings-tool-info">
        <span className="settings-tool-name">{tool.name}</span>
        <span className="settings-tool-url">{tool.url}</span>
      </div>
      <div className="settings-tool-actions">
        <button className="btn btn-ghost btn-sm" onClick={() => onEdit(tool)} title="Edit">
          <Pencil size={13} />
        </button>
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => onDelete(tool.id, tool.name)}
          title="Delete"
          style={{ color: 'var(--color-danger)' }}
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  )
}

// ── Tool Form ────────────────────────────────────────────────────────────────

function ToolForm({ tool, categories, onSave, onCancel }) {
  const [form, setForm] = useState({
    name: tool?.name || '',
    url: tool?.url || '',
    icon: tool?.icon || 'Globe',
    category: tool?.category || categories[0] || '',
    description: tool?.description || '',
  })

  const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.url.trim()) return
    const data = { ...form }
    if (data.url && !data.url.startsWith('http')) data.url = 'https://' + data.url
    onSave(data)
  }

  const PreviewIcon = LucideIcons[form.icon] || LucideIcons.Globe

  return (
    <form className="tool-form card" onSubmit={handleSubmit}>
      <h3 className="tool-form-title">{tool?.id ? 'Edit Tool' : 'Add Tool'}</h3>
      <div className="form-grid">
        <div className="form-field">
          <label className="label">Name *</label>
          <input className="input" value={form.name} onChange={(e) => setField('name', e.target.value)} placeholder="e.g. Jira" required />
        </div>
        <div className="form-field">
          <label className="label">URL *</label>
          <input className="input" value={form.url} onChange={(e) => setField('url', e.target.value)} placeholder="https://..." required />
        </div>
        <div className="form-field">
          <label className="label">Description</label>
          <input className="input" value={form.description} onChange={(e) => setField('description', e.target.value)} placeholder="Short description" />
        </div>
        <div className="form-field">
          <label className="label">Category</label>
          <select className="input" value={form.category} onChange={(e) => setField('category', e.target.value)}>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>
      <div className="form-field" style={{ marginTop: 4 }}>
        <label className="label">Icon — <span style={{ fontWeight: 400, display: 'inline-flex', alignItems: 'center', gap: 4 }}><PreviewIcon size={14} /> {form.icon}</span></label>
        <div className="icon-grid-sm">
          {ICON_OPTIONS.map((iconName) => {
            const Icon = LucideIcons[iconName] || LucideIcons.Globe
            return (
              <button
                key={iconName}
                type="button"
                className={`icon-btn ${form.icon === iconName ? 'selected' : ''}`}
                onClick={() => setField('icon', iconName)}
                title={iconName}
              >
                <Icon size={15} />
              </button>
            )
          })}
        </div>
      </div>
      <div className="form-actions">
        <button type="submit" className="btn btn-primary btn-sm"><Check size={14} /> Save</button>
        <button type="button" className="btn btn-secondary btn-sm" onClick={onCancel}><X size={14} /> Cancel</button>
      </div>
    </form>
  )
}

// ── Category Accordion ────────────────────────────────────────────────────────

function CategorySection({ category, tools, onEditTool, onDeleteTool, onAddTool, onReorderTools }) {
  const [collapsed, setCollapsed] = useState(false)
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return
    const oldIdx = tools.findIndex((t) => t.id === active.id)
    const newIdx = tools.findIndex((t) => t.id === over.id)
    onReorderTools(category, arrayMove(tools, oldIdx, newIdx).map((t) => t.id))
  }

  return (
    <div className="settings-category card">
      <div className="settings-category-header" onClick={() => setCollapsed((v) => !v)}>
        <span className="settings-category-chevron">
          {collapsed ? <ChevronRight size={15} /> : <ChevronDown size={15} />}
        </span>
        <h3 className="settings-category-name">{category}</h3>
        <span className="badge" style={{ marginLeft: 'auto' }}>{tools.length}</span>
      </div>
      {!collapsed && (
        <div className="settings-category-body">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={tools.map((t) => t.id)} strategy={verticalListSortingStrategy}>
              {tools.map((tool) => (
                <SortableToolRow key={tool.id} tool={tool} onEdit={onEditTool} onDelete={onDeleteTool} />
              ))}
            </SortableContext>
          </DndContext>
          {tools.length === 0 && <p className="settings-empty-hint">No tools in this category.</p>}
          <button className="btn btn-ghost btn-sm" style={{ marginTop: 8, color: 'var(--color-primary)' }} onClick={() => onAddTool(category)}>
            <Plus size={14} /> Add Tool to {category}
          </button>
        </div>
      )}
    </div>
  )
}

// ── Main Settings Page ───────────────────────────────────────────────────────

export default function Settings() {
  const categories = useAppStore((s) => s.categories)
  const tools = useAppStore((s) => s.tools)
  const addCategory = useAppStore((s) => s.addCategory)
  const renameCategory = useAppStore((s) => s.renameCategory)
  const deleteCategory = useAppStore((s) => s.deleteCategory)
  const addTool = useAppStore((s) => s.addTool)
  const updateTool = useAppStore((s) => s.updateTool)
  const deleteTool = useAppStore((s) => s.deleteTool)
  const reorderTools = useAppStore((s) => s.reorderTools)
  const exportConfig = useAppStore((s) => s.exportConfig)
  const importConfig = useAppStore((s) => s.importConfig)
  const resetToDefaults = useAppStore((s) => s.resetToDefaults)

  const [editingTool, setEditingTool] = useState(null)
  const [addingToCategory, setAddingToCategory] = useState(null)
  const [newCatName, setNewCatName] = useState('')
  const [renamingCat, setRenamingCat] = useState(null)
  const [renameDraft, setRenameDraft] = useState('')
  const [importText, setImportText] = useState('')
  const [importError, setImportError] = useState('')
  const [importSuccess, setImportSuccess] = useState(false)
  const fileInputRef = useRef()

  const getToolsForCat = (cat) => tools.filter((t) => t.category === cat)

  // Categories
  const handleAddCategory = () => {
    if (!newCatName.trim()) return
    addCategory(newCatName.trim())
    setNewCatName('')
  }

  const handleConfirmRename = () => {
    if (renameDraft.trim() && renameDraft !== renamingCat) renameCategory(renamingCat, renameDraft.trim())
    setRenamingCat(null)
  }

  const handleDeleteCategory = (cat) => {
    const count = getToolsForCat(cat).length
    if (window.confirm(`Delete "${cat}"?${count > 0 ? ` This will also delete ${count} tool(s).` : ''}`))
      deleteCategory(cat)
  }

  // Tools
  const handleSaveNewTool = (data) => {
    addTool(data)
    setAddingToCategory(null)
  }

  const handleSaveToolEdit = (data) => {
    updateTool(editingTool.id, data)
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

  const handleImportFile = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const ok = importConfig(ev.target.result)
      if (ok) { setImportSuccess(true); setImportError('') }
      else setImportError('Invalid JSON. Please check the format.')
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const handleImportText = () => {
    setImportError('')
    setImportSuccess(false)
    if (!importText.trim()) return
    const ok = importConfig(importText)
    if (ok) { setImportSuccess(true); setImportText('') }
    else setImportError('Invalid JSON. Please check the format.')
  }

  const handleReset = () => {
    if (window.confirm('Reset all tools, categories, and docs to defaults? This cannot be undone.'))
      resetToDefaults()
  }

  return (
    <div className="page page-settings">

      {/* ── Tools by Category ─────────────────────────────── */}
      <section className="settings-section">
        <div className="settings-section-header">
          <h2 className="settings-section-title">Tools</h2>
          <p className="settings-section-desc">Drag handles to reorder tools within a category.</p>
        </div>

        <div className="settings-categories-list">
          {categories.map((cat) => (
            <div key={cat}>
              {addingToCategory === cat && (
                <div style={{ marginBottom: 10 }}>
                  <ToolForm
                    tool={{ category: cat }}
                    categories={categories}
                    onSave={handleSaveNewTool}
                    onCancel={() => setAddingToCategory(null)}
                  />
                </div>
              )}
              {editingTool && editingTool.category === cat && (
                <div style={{ marginBottom: 10 }}>
                  <ToolForm
                    tool={editingTool}
                    categories={categories}
                    onSave={handleSaveToolEdit}
                    onCancel={() => setEditingTool(null)}
                  />
                </div>
              )}
              <CategorySection
                category={cat}
                tools={getToolsForCat(cat)}
                onEditTool={setEditingTool}
                onDeleteTool={handleDeleteTool}
                onAddTool={(c) => { setAddingToCategory(c); setEditingTool(null) }}
                onReorderTools={reorderTools}
              />
            </div>
          ))}
        </div>

        <button className="btn btn-primary btn-sm" style={{ marginTop: 12 }} onClick={() => { setAddingToCategory(categories[0]); setEditingTool(null) }}>
          <Plus size={14} /> Add New Tool
        </button>
      </section>

      <div className="divider" />

      {/* ── Categories ────────────────────────────────────── */}
      <section className="settings-section card">
        <h2 className="settings-section-title">Manage Categories</h2>
        <ul className="settings-list">
          {categories.map((cat) => (
            <li key={cat} className="settings-list-item">
              {renamingCat === cat ? (
                <div className="settings-list-item-rename">
                  <input
                    className="input"
                    value={renameDraft}
                    onChange={(e) => setRenameDraft(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleConfirmRename(); if (e.key === 'Escape') setRenamingCat(null) }}
                    autoFocus
                  />
                  <button className="btn btn-primary btn-sm" onClick={handleConfirmRename}><Check size={13} /></button>
                  <button className="btn btn-ghost btn-sm" onClick={() => setRenamingCat(null)}><X size={13} /></button>
                </div>
              ) : (
                <>
                  <span className="settings-list-item-name">{cat}</span>
                  <span className="settings-list-item-meta">{getToolsForCat(cat).length} tools</span>
                  <div className="settings-list-item-actions">
                    <button className="btn btn-ghost btn-sm" onClick={() => { setRenamingCat(cat); setRenameDraft(cat) }} title="Rename"><Pencil size={13} /></button>
                    <button className="btn btn-ghost btn-sm" onClick={() => handleDeleteCategory(cat)} title="Delete" style={{ color: 'var(--color-danger)' }}><Trash2 size={13} /></button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
        <div className="settings-add-row">
          <input
            className="input"
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

      <div className="divider" />

      {/* ── Themes ───────────────────────────────────────── */}
      <ThemeSection />

      <div className="divider" />

      {/* ── Export / Import ───────────────────────────────── */}
      <section className="settings-section card">
        <h2 className="settings-section-title">Export / Import</h2>
        <p className="settings-section-desc">Backup your config or share it with teammates.</p>
        <div className="settings-io-row">
          <button className="btn btn-secondary" onClick={handleExport}><Download size={15} /> Export Config</button>
          <button className="btn btn-secondary" onClick={() => fileInputRef.current?.click()}><Upload size={15} /> Import from File</button>
          <input ref={fileInputRef} type="file" accept=".json" style={{ display: 'none' }} onChange={handleImportFile} />
        </div>
        <div className="settings-import-area">
          <label className="label">Or paste JSON here</label>
          <textarea
            className="input settings-import-textarea"
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            placeholder='{ "categories": [...], "tools": [...], "docs": {...} }'
            rows={5}
          />
          {importError && <p className="settings-import-error">{importError}</p>}
          {importSuccess && <p className="settings-import-success">Config imported successfully!</p>}
          <button className="btn btn-primary btn-sm" onClick={handleImportText} disabled={!importText.trim()}>
            <Upload size={14} /> Import
          </button>
        </div>
      </section>

      <div className="divider" />

      {/* ── Danger Zone ───────────────────────────────────── */}
      <section className="settings-section card settings-danger-zone">
        <h2 className="settings-section-title" style={{ color: 'var(--color-danger)' }}>Danger Zone</h2>
        <p className="settings-section-desc">Reset all tools, categories, and documentation to factory defaults. This cannot be undone.</p>
        <button className="btn btn-danger btn-sm" onClick={handleReset}><RotateCcw size={14} /> Reset to Defaults</button>
      </section>
    </div>
  )
}
