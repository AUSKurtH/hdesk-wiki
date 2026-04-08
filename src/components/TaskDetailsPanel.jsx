import React, { useState, useEffect } from 'react'
import * as LucideIcons from 'lucide-react'
import WikiEditor from './WikiEditor.jsx'
import useAppStore from '../store/useAppStore.js'

export default function TaskDetailsPanel({ task }) {
  const updateWorkBoardTool = useAppStore((s) => s.updateWorkBoardTool)
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const [hasChanges, setHasChanges] = useState(false)

  // Reset to view mode and sync draft when task changes
  useEffect(() => {
    setIsEditing(false)
    setDraft(task?.qrg || '')
    setHasChanges(false)
  }, [task?.id])

  if (!task) {
    return (
      <div className="qrg-panel qrg-panel--empty">
        <div className="qrg-empty-state">
          <LucideIcons.MousePointerClick size={40} strokeWidth={1.2} className="qrg-empty-icon" />
          <p className="qrg-empty-title">Select a task</p>
          <p className="qrg-empty-sub">Click any task on the left to view its details</p>
        </div>
      </div>
    )
  }

  const IconComponent = LucideIcons[task.icon] || LucideIcons.Globe

  const handleEdit = () => {
    setDraft(task.qrg || '')
    setHasChanges(false)
    setIsEditing(true)
  }

  const handleSave = () => {
    updateWorkBoardTool(task.id, { qrg: draft })
    setIsEditing(false)
    setHasChanges(false)
  }

  const handleDiscard = () => {
    setDraft(task.qrg || '')
    setIsEditing(false)
    setHasChanges(false)
  }

  const iconStyle = task.color ? { background: `${task.color}30`, color: task.color } : {}

  return (
    <div className="qrg-panel">
      {/* Header */}
      <div className="qrg-header">
        <div className="qrg-tool-identity">
          <div className="qrg-tool-icon" style={iconStyle}>
            <IconComponent size={24} strokeWidth={1.5} />
          </div>
          <div>
            <h2 className="qrg-tool-name">{task.name}</h2>
            {task.description && (
              <p className="qrg-tool-desc">{task.description}</p>
            )}
          </div>
        </div>
      </div>

      {/* Task Details label + edit controls */}
      <div className="qrg-section-header">
        <span className="qrg-section-label">Task Details</span>
        <div className="qrg-edit-actions">
          {isEditing ? (
            <>
              <button className="btn btn-secondary btn-sm" onClick={handleDiscard}>
                <LucideIcons.X size={13} /> Discard
              </button>
              <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={!hasChanges}>
                <LucideIcons.Save size={13} /> Save
              </button>
            </>
          ) : (
            <button className="btn btn-secondary btn-sm" onClick={handleEdit}>
              <LucideIcons.Pencil size={13} /> Edit
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="qrg-content">
        <WikiEditor
          key={task.id}
          value={isEditing ? draft : (task.qrg || '')}
          onChange={(md) => { setDraft(md); setHasChanges(true) }}
          placeholder="Add notes, instructions, or details about this task…"
          readOnly={!isEditing}
        />
      </div>
    </div>
  )
}
