import React, { useState, useRef, useEffect } from 'react'
import { Plus, X, Pencil, GripVertical } from 'lucide-react'
import useAppStore from '../store/useAppStore.js'
import QRGPanel from '../components/QRGPanel.jsx'
import * as LucideIcons from 'lucide-react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  useSortable,
  SortableContext,
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

function TaskModal({ task, columnId, onClose }) {
  const addTask = useAppStore((s) => s.addWorkBoardTool)
  const updateTask = useAppStore((s) => s.updateWorkBoardTool)
  const deleteTask = useAppStore((s) => s.deleteWorkBoardTool)

  const isEdit = !!task?.id

  const [form, setForm] = useState({
    name: task?.name || '',
    icon: task?.icon || 'Globe',
    color: task?.color || null,
    description: task?.description || '',
    qrg: task?.qrg || '',
  })

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.name.trim()) return
    const taskData = { ...form, columnId: columnId || task?.columnId }
    if (isEdit) {
      updateTask(task.id, taskData)
    } else {
      addTask(taskData)
    }
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
              {isEdit ? 'Save Changes' : 'Add Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function SortableWorkBoardTask({ task, onEdit, onSelect }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const IconComponent = LucideIcons[task.icon] || LucideIcons.Globe
  const cardStyle = task.color ? {
    '--card-color': task.color,
    background: `${task.color}18`,
    borderColor: `${task.color}55`,
  } : {}
  const iconStyle = task.color ? {
    background: `${task.color}30`,
    color: task.color,
  } : {}

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
      {onEdit && (
        <button
          className="workboard-tool-edit btn btn-ghost btn-sm"
          onClick={(e) => {
            e.stopPropagation()
            onEdit(task)
          }}
          title="Edit task"
        >
          <Pencil size={12} />
        </button>
      )}
    </div>
  )
}

function WorkBoardColumn({ column, tasks, onAddTask, onEditTask, onSelectTask }) {
  const columnTasks = tasks.filter((t) => t.columnId === column.id).sort((a, b) => (a.position || 0) - (b.position || 0))

  return (
    <div className="workboard-column">
      <div className="workboard-column-header">
        <h3 className="workboard-column-title">{column.name}</h3>
        <span className="workboard-column-count">{columnTasks.length}</span>
      </div>
      <SortableContext items={columnTasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <div className="workboard-column-tools">
          {columnTasks.map((task) => (
            <SortableWorkBoardTask
              key={task.id}
              task={task}
              onEdit={onEditTask}
              onSelect={onSelectTask}
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
    </div>
  )
}

export default function WorkBoard() {
  const columns = useAppStore((s) => s.workBoardColumns)
  const tasks = useAppStore((s) => s.workBoardTools)
  const moveWorkBoardTool = useAppStore((s) => s.moveWorkBoardTool)
  const addWorkBoardColumn = useAppStore((s) => s.addWorkBoardColumn)

  const [modalTask, setModalTask] = useState(null)
  const [modalColumnId, setModalColumnId] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [selectedTask, setSelectedTask] = useState(null)
  const [rightPanelWidth, setRightPanelWidth] = useState(350)
  const dividerRef = useRef(null)
  const containerRef = useRef(null)
  const [isDraggingDivider, setIsDraggingDivider] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  )

  // Initialize with default columns if empty
  useEffect(() => {
    if (columns.length === 0) {
      addWorkBoardColumn('Personal')
      addWorkBoardColumn('Work')
    }
  }, [])

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

  const handleDragEnd = (event) => {
    const { active, over } = event

    if (!over) return
    if (active.id === over.id) return

    const activeTask = tasks.find((t) => t.id === active.id)
    if (!activeTask) return

    const overTask = tasks.find((t) => t.id === over.id)
    const targetColumnId = overTask?.columnId || modalColumnId

    if (!targetColumnId) return

    const targetColumnTasks = tasks
      .filter((t) => t.columnId === targetColumnId && t.id !== activeTask.id)
      .sort((a, b) => (a.position || 0) - (b.position || 0))

    const overIndex = targetColumnTasks.findIndex((t) => t.id === over.id)
    const position = overIndex >= 0 ? overIndex : targetColumnTasks.length

    moveWorkBoardTool(activeTask.id, targetColumnId, position)
  }

  const handleDividerMouseDown = () => {
    setIsDraggingDivider(true)
  }

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDraggingDivider || !containerRef.current) return

      const containerRect = containerRef.current.getBoundingClientRect()
      const newWidth = containerRect.right - e.clientX
      const minWidth = 250
      const maxWidth = containerRect.width - 300

      if (newWidth >= minWidth && newWidth <= maxWidth) {
        setRightPanelWidth(newWidth)
      }
    }

    const handleMouseUp = () => {
      setIsDraggingDivider(false)
    }

    if (isDraggingDivider) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDraggingDivider])

  const liveSelectedTask = selectedTask
    ? tasks.find((t) => t.id === selectedTask.id) || null
    : null

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
      <div className="workboard" ref={containerRef}>
        <div className="workboard-header">
          <button
            className="btn btn-primary btn-sm"
            onClick={() => addWorkBoardColumn('New Column')}
          >
            <Plus size={15} />
            Add Column
          </button>
        </div>

        <div className="workboard-split">
          <div className="workboard-left" style={{ flex: `1 1 calc(100% - ${rightPanelWidth}px)` }}>
            <div className="workboard-columns">
              {columns.map((col) => (
                <WorkBoardColumn
                  key={col.id}
                  column={col}
                  tasks={tasks}
                  onAddTask={handleAddTask}
                  onEditTask={handleEditTask}
                  onSelectTask={setSelectedTask}
                />
              ))}
            </div>
          </div>

          <div
            className="workboard-divider"
            ref={dividerRef}
            onMouseDown={handleDividerMouseDown}
            style={{ cursor: isDraggingDivider ? 'col-resize' : 'col-resize' }}
          />

          <div className="workboard-right" style={{ flex: `0 0 ${rightPanelWidth}px` }}>
            <div className="workboard-panel-label">Task Details</div>
            <QRGPanel tool={liveSelectedTask} />
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
