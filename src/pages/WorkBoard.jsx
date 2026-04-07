import React, { useState } from 'react'
import { Plus, X, Pencil } from 'lucide-react'
import useAppStore from '../store/useAppStore.js'
import * as LucideIcons from 'lucide-react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  useSortable,
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

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

function ToolModal({ tool, columnId, onClose }) {
  const addTool = useAppStore((s) => s.addWorkBoardTool)
  const updateTool = useAppStore((s) => s.updateWorkBoardTool)
  const deleteTool = useAppStore((s) => s.deleteWorkBoardTool)

  const isEdit = !!tool?.id

  const [form, setForm] = useState({
    name: tool?.name || '',
    url: tool?.url || '',
    icon: tool?.icon || 'Globe',
    color: tool?.color || null,
    description: tool?.description || '',
  })

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.url.trim()) return
    const toolData = { ...form, columnId: columnId || tool?.columnId }
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

function SortableWorkBoardTool({ tool, onEdit }) {
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

  const handleClick = (e) => {
    if (e.target.closest('.workboard-tool-edit')) return
    if (!e.target.closest('[data-no-click]')) {
      window.open(tool.url, '_blank')
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`workboard-tool card${tool.color ? ' workboard-tool--colored' : ''}`}
      onClick={handleClick}
    >
      <div className="workboard-tool-handle" {...attributes} {...listeners}>
        <LucideIcons.GripVertical size={14} />
      </div>
      <div className="workboard-tool-icon" style={iconStyle}>
        <IconComponent size={24} strokeWidth={1.5} />
      </div>
      <div className="workboard-tool-body">
        <span className="workboard-tool-name">{tool.name}</span>
        {tool.description && (
          <span className="workboard-tool-desc">{tool.description}</span>
        )}
      </div>
      {onEdit && (
        <button
          className="workboard-tool-edit btn btn-ghost btn-sm"
          data-no-click="true"
          onClick={(e) => {
            e.stopPropagation()
            onEdit(tool)
          }}
          title="Edit tool"
        >
          <Pencil size={12} />
        </button>
      )}
    </div>
  )
}

function WorkBoardColumn({ column, tools, onAddTool, onEditTool }) {
  const columnTools = tools.filter((t) => t.columnId === column.id).sort((a, b) => (a.position || 0) - (b.position || 0))

  return (
    <div className="workboard-column">
      <div className="workboard-column-header">
        <h3 className="workboard-column-title">{column.name}</h3>
        <span className="workboard-column-count">{columnTools.length}</span>
      </div>
      <SortableContext items={columnTools.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <div className="workboard-column-tools">
          {columnTools.map((tool) => (
            <SortableWorkBoardTool key={tool.id} tool={tool} onEdit={onEditTool} />
          ))}
          <button
            className="workboard-add-tool"
            onClick={() => onAddTool(column.id)}
            title={`Add tool to ${column.name}`}
          >
            <Plus size={18} />
            <span>Add</span>
          </button>
        </div>
      </SortableContext>
    </div>
  )
}

export default function WorkBoard() {
  const columns = useAppStore((s) => s.workBoardColumns)
  const tools = useAppStore((s) => s.workBoardTools)
  const moveWorkBoardTool = useAppStore((s) => s.moveWorkBoardTool)
  const reorderWorkBoardTools = useAppStore((s) => s.reorderWorkBoardTools)
  const addWorkBoardColumn = useAppStore((s) => s.addWorkBoardColumn)

  const [modalTool, setModalTool] = useState(null)
  const [modalColumnId, setModalColumnId] = useState(null)
  const [showModal, setShowModal] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  )

  const handleAddTool = (columnId) => {
    setModalColumnId(columnId)
    setModalTool(null)
    setShowModal(true)
  }

  const handleEditTool = (tool) => {
    setModalTool(tool)
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setModalTool(null)
    setModalColumnId(null)
  }

  const handleDragEnd = (event) => {
    const { active, over } = event

    if (!over) return

    if (active.id === over.id) return

    // Extract column ID from the over item id (format: "tool-xxx" for tools, "col-xxx" for columns)
    const activeTool = tools.find((t) => t.id === active.id)
    if (!activeTool) return

    // Find the target column - could be dragging over a tool in that column
    const overTool = tools.find((t) => t.id === over.id)
    const targetColumnId = overTool?.columnId || modalColumnId

    if (!targetColumnId) return

    const targetColumnTools = tools
      .filter((t) => t.columnId === targetColumnId && t.id !== activeTool.id)
      .sort((a, b) => (a.position || 0) - (b.position || 0))

    const overIndex = targetColumnTools.findIndex((t) => t.id === over.id)
    const position = overIndex >= 0 ? overIndex : targetColumnTools.length

    moveWorkBoardTool(activeTool.id, targetColumnId, position)
  }

  if (columns.length === 0) {
    return (
      <div className="workboard-empty">
        <p>No columns yet. Create one to get started.</p>
        <button
          className="btn btn-primary"
          onClick={() => addWorkBoardColumn('New Column')}
        >
          <Plus size={18} />
          Create Column
        </button>
      </div>
    )
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="workboard">
        <div className="workboard-header">
          <button
            className="btn btn-primary btn-sm"
            onClick={() => addWorkBoardColumn('New Column')}
          >
            <Plus size={15} />
            Add Column
          </button>
        </div>

        <div className="workboard-columns">
          {columns.map((col) => (
            <WorkBoardColumn
              key={col.id}
              column={col}
              tools={tools}
              onAddTool={handleAddTool}
              onEditTool={handleEditTool}
            />
          ))}
        </div>
      </div>

      {showModal && (
        <ToolModal
          tool={modalTool}
          columnId={modalColumnId}
          onClose={handleCloseModal}
        />
      )}
    </DndContext>
  )
}
