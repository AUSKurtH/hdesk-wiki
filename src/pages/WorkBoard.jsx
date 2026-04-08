import React, { useState, useRef, useEffect } from 'react'
import { Plus, X, Pencil, GripVertical, Trash2, Settings } from 'lucide-react'
import * as LucideIcons from 'lucide-react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  useSortable,
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import useAppStore from '../store/useAppStore.js'
import TaskDetailsPanel from '../components/TaskDetailsPanel.jsx'
import { ICON_OPTIONS, COLOR_PALETTE } from '../constants/ui.js'

// ── Task Modal ────────────────────────────────────────────────────────────────
// Add or edit a task. `columnId` is required when adding a new task.

function TaskModal({ task, columnId, onClose }) {
  const addTask    = useAppStore((s) => s.addWorkBoardTool)
  const updateTask = useAppStore((s) => s.updateWorkBoardTool)
  const deleteTask = useAppStore((s) => s.deleteWorkBoardTool)

  const isEdit = !!task?.id

  const [form, setForm] = useState({
    name:        task?.name        || '',
    icon:        task?.icon        || 'Globe',
    color:       task?.color       || null,
    description: task?.description || '',
    qrg:         task?.qrg         || '',
  })

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.name.trim()) return
    const payload = { ...form, columnId: columnId || task?.columnId }
    if (isEdit) updateTask(task.id, payload)
    else        addTask(payload)
    onClose()
  }

  const handleDelete = () => {
    if (window.confirm(`Delete "${task.name}"?`)) {
      deleteTask(task.id)
      onClose()
    }
  }

  const PreviewIcon = LucideIcons[form.icon] || LucideIcons.Globe

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">{isEdit ? 'Edit Task' : 'Add Task'}</h2>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-group">
            <label className="label">Task Name</label>
            <input
              className="input"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="Task name"
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
            <label className="label">Task Details (optional)</label>
            <textarea
              className="input"
              style={{ minHeight: '120px', fontFamily: 'monospace', fontSize: '12px' }}
              value={form.qrg}
              onChange={(e) => set('qrg', e.target.value)}
              placeholder="Add notes, instructions, or details about this task"
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
            <label className="label">Color</label>
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
              {isEdit ? 'Save Changes' : 'Add Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Column Colour Picker ──────────────────────────────────────────────────────

function ColumnColorPicker({ column, onSelectColor, onClose }) {
  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: '400px' }}>
        <div className="modal-header">
          <h2 className="modal-title">Column Color</h2>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>
            <X size={16} />
          </button>
        </div>
        <div className="modal-body">
          <div className="color-picker" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
            {COLOR_PALETTE.map(({ label, value }) => {
              const isSelected = column.color === value
              return (
                <button
                  key={label}
                  className={`color-swatch${isSelected ? ' color-swatch--selected' : ''}`}
                  style={{
                    background: value || 'var(--color-primary-light)',
                    border: value ? `2px solid ${value}` : '2px solid var(--color-border)',
                    padding: '12px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                  }}
                  onClick={() => { onSelectColor(value); onClose() }}
                  title={label}
                >
                  {isSelected && <span className="color-swatch-check">✓</span>}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Sortable Task Card ────────────────────────────────────────────────────────

function SortableWorkBoardTask({ task, onEdit, onSelect, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const IconComponent = LucideIcons[task.icon] || LucideIcons.Globe
  const cardStyle = task.color ? {
    '--card-color': task.color,
    background:   `${task.color}18`,
    borderColor:  `${task.color}55`,
  } : {}
  const iconStyle = task.color ? {
    background: `${task.color}30`,
    color:      task.color,
  } : {}

  const handleDelete = (e) => {
    e.stopPropagation()
    if (window.confirm(`Delete task "${task.name}"?`)) onDelete(task.id)
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`workboard-tool card${task.color ? ' workboard-tool--colored' : ''}`}
      onClick={() => onSelect && onSelect(task)}
    >
      <div className="workboard-tool-handle" {...attributes} {...listeners}>
        <GripVertical size={14} />
      </div>
      <div className="workboard-tool-icon" style={iconStyle}>
        <IconComponent size={24} strokeWidth={1.5} />
      </div>
      <div className="workboard-tool-body">
        <span className="workboard-tool-name">{task.name}</span>
        {task.description && (
          <span className="workboard-tool-desc">{task.description}</span>
        )}
      </div>
      <div className="workboard-tool-actions">
        {onEdit && (
          <button
            className="workboard-tool-edit btn btn-ghost btn-sm"
            onClick={(e) => { e.stopPropagation(); onEdit(task) }}
            title="Edit task"
          >
            <Pencil size={12} />
          </button>
        )}
        {onDelete && (
          <button
            className="workboard-tool-delete btn btn-ghost btn-sm"
            onClick={handleDelete}
            title="Delete task"
          >
            <Trash2 size={12} />
          </button>
        )}
      </div>
    </div>
  )
}

// ── Board Column ──────────────────────────────────────────────────────────────

function WorkBoardColumn({
  column, tasks,
  onAddTask, onEditTask, onSelectTask,
  onRenameColumn, onDeleteColumn,
  isEditingName, editingName, onNameChange, onNameSave,
  onDeleteTask, onSetColumnColor,
}) {
  const columnTasks = tasks
    .filter((t) => t.columnId === column.id)
    .sort((a, b) => (a.position || 0) - (b.position || 0))

  const [showColorPicker, setShowColorPicker] = useState(false)

  const handleDeleteColumn = () => {
    if (window.confirm(`Delete column "${column.name}"? All tasks in this column will be deleted.`)) {
      onDeleteColumn(column.id)
    }
  }

  const columnHeaderStyle = column.color ? {
    borderLeftColor: column.color,
    borderLeftWidth: '4px',
    paddingLeft: 'calc(12px - 4px)',
  } : {}

  return (
    <div className="workboard-column">
      <div className="workboard-column-header" style={columnHeaderStyle}>
        {isEditingName ? (
          <input
            type="text"
            className="workboard-column-title-input"
            value={editingName}
            onChange={(e) => onNameChange(e.target.value)}
            onBlur={() => onNameSave(column.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onNameSave(column.id)
              if (e.key === 'Escape') onNameChange(column.name)
            }}
            autoFocus
          />
        ) : (
          <h3
            className="workboard-column-title"
            onClick={() => onRenameColumn(column.id, column.name)}
            title="Click to rename"
          >
            {column.name}
          </h3>
        )}
        <div className="workboard-column-header-actions">
          <span className="workboard-column-count">{columnTasks.length}</span>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => setShowColorPicker(true)}
            title="Column color"
          >
            <Settings size={14} />
          </button>
          <button
            className="btn btn-ghost btn-sm"
            onClick={handleDeleteColumn}
            title="Delete column"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <SortableContext items={columnTasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <div className="workboard-column-tools">
          {columnTasks.map((task) => (
            <SortableWorkBoardTask
              key={task.id}
              task={task}
              onEdit={onEditTask}
              onSelect={onSelectTask}
              onDelete={onDeleteTask}
            />
          ))}
          <button
            className="workboard-add-tool"
            onClick={() => onAddTask(column.id)}
            title={`Add task to ${column.name}`}
          >
            <Plus size={18} />
            <span>Add Task</span>
          </button>
        </div>
      </SortableContext>

      {showColorPicker && (
        <ColumnColorPicker
          column={column}
          onSelectColor={(color) => onSetColumnColor(column.id, color)}
          onClose={() => setShowColorPicker(false)}
        />
      )}
    </div>
  )
}

// ── WorkBoard Page ────────────────────────────────────────────────────────────

export default function WorkBoard() {
  const columns              = useAppStore((s) => s.workBoardColumns)
  const tasks                = useAppStore((s) => s.workBoardTools)
  const addWorkBoardColumn   = useAppStore((s) => s.addWorkBoardColumn)
  const deleteWorkBoardColumn = useAppStore((s) => s.deleteWorkBoardColumn)
  const renameWorkBoardColumn = useAppStore((s) => s.renameWorkBoardColumn)
  const deleteWorkBoardTool  = useAppStore((s) => s.deleteWorkBoardTool)
  const setWorkBoardColumnColor = useAppStore((s) => s.setWorkBoardColumnColor)
  const reorderWorkBoardTools = useAppStore((s) => s.reorderWorkBoardTools)

  // Modal state
  const [modalTask, setModalTask]       = useState(null)
  const [modalColumnId, setModalColumnId] = useState(null)
  const [showModal, setShowModal]       = useState(false)

  // Selected task for the details panel
  const [selectedTask, setSelectedTask] = useState(null)

  // Inline column rename state
  const [editingColumnId, setEditingColumnId]     = useState(null)
  const [editingColumnName, setEditingColumnName] = useState('')

  // Resizable right panel
  const containerRef    = useRef(null)
  const [rightPanelWidth, setRightPanelWidth] = useState(0)
  const [isDraggingDivider, setIsDraggingDivider] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  )

  // Seed default columns on first load
  useEffect(() => {
    if (columns.length === 0) {
      addWorkBoardColumn('Personal')
      addWorkBoardColumn('Work')
    }
  }, [])

  // Set initial right-panel width to 50% of container
  useEffect(() => {
    if (containerRef.current && rightPanelWidth === 0) {
      setRightPanelWidth(containerRef.current.getBoundingClientRect().width / 2)
    }
  }, [])

  // Divider drag listeners
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDraggingDivider || !containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const desired = rect.right - e.clientX
      setRightPanelWidth(Math.max(200, Math.min(desired, rect.width - 250)))
    }
    const handleMouseUp = () => setIsDraggingDivider(false)

    if (isDraggingDivider) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDraggingDivider])

  // Keep selected-task details in sync with store
  const liveSelectedTask = selectedTask
    ? tasks.find((t) => t.id === selectedTask.id) || null
    : null

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleAddTask = (columnId) => {
    setModalColumnId(columnId)
    setModalTask(null)
    setShowModal(true)
  }

  const handleEditTask = (task) => {
    setModalTask(task)
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setModalTask(null)
    setModalColumnId(null)
  }

  const handleDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return

    const activeTask = tasks.find((t) => t.id === active.id)
    const overTask   = tasks.find((t) => t.id === over.id)
    if (!activeTask || !overTask) return

    // Only reorder within the same column — cross-column drag is disabled
    if (activeTask.columnId !== overTask.columnId) return

    const columnTasks = tasks
      .filter((t) => t.columnId === activeTask.columnId)
      .sort((a, b) => (a.position || 0) - (b.position || 0))

    const oldIndex = columnTasks.findIndex((t) => t.id === active.id)
    const newIndex = columnTasks.findIndex((t) => t.id === over.id)
    const reordered = arrayMove(columnTasks, oldIndex, newIndex)
    reorderWorkBoardTools(activeTask.columnId, reordered.map((t) => t.id))
  }

  const handleRenameColumn = (colId, currentName) => {
    setEditingColumnId(colId)
    setEditingColumnName(currentName)
  }

  const handleSaveColumnName = (colId) => {
    if (editingColumnName.trim()) renameWorkBoardColumn(colId, editingColumnName)
    setEditingColumnId(null)
    setEditingColumnName('')
  }

  // ── Empty state ────────────────────────────────────────────────────────────

  if (columns.length === 0) {
    return (
      <div className="workboard-empty">
        <p>No columns yet. Create one to get started.</p>
        <button className="btn btn-primary" onClick={() => addWorkBoardColumn('New Column')}>
          <Plus size={18} /> Create Column
        </button>
      </div>
    )
  }

  const panelWidth = rightPanelWidth || 400

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="workboard" ref={containerRef}>

        <div className="workboard-header">
          <button
            className="btn btn-primary btn-sm"
            onClick={() => addWorkBoardColumn('New Column')}
          >
            <Plus size={15} /> Add Column
          </button>
        </div>

        <div className="workboard-split">
          {/* Column area */}
          <div className="workboard-left" style={{ flex: `1 1 calc(100% - ${panelWidth}px)` }}>
            <div className="workboard-columns">
              {columns.map((col) => (
                <WorkBoardColumn
                  key={col.id}
                  column={col}
                  tasks={tasks}
                  onAddTask={handleAddTask}
                  onEditTask={handleEditTask}
                  onSelectTask={setSelectedTask}
                  onRenameColumn={handleRenameColumn}
                  onDeleteColumn={deleteWorkBoardColumn}
                  isEditingName={editingColumnId === col.id}
                  editingName={editingColumnId === col.id ? editingColumnName : ''}
                  onNameChange={setEditingColumnName}
                  onNameSave={handleSaveColumnName}
                  onDeleteTask={deleteWorkBoardTool}
                  onSetColumnColor={setWorkBoardColumnColor}
                />
              ))}
            </div>
          </div>

          {/* Draggable divider */}
          <div
            className="workboard-divider"
            onMouseDown={() => setIsDraggingDivider(true)}
            style={{ cursor: 'col-resize' }}
          />

          {/* Task details panel */}
          <div className="workboard-right" style={{ flex: `0 0 ${panelWidth}px` }}>
            <TaskDetailsPanel task={liveSelectedTask} />
          </div>
        </div>
      </div>

      {showModal && (
        <TaskModal
          task={modalTask}
          columnId={modalColumnId}
          onClose={handleCloseModal}
        />
      )}
    </DndContext>
  )
}
