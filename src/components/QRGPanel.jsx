import React, { useState, useEffect } from 'react'
import * as LucideIcons from 'lucide-react'
import WikiEditor from './WikiEditor.jsx'
import useAppStore from '../store/useAppStore.js'

export default function QRGPanel({ tool }) {
  const updateTool = useAppStore((s) => s.updateTool)
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const [hasChanges, setHasChanges] = useState(false)

  // Reset to view mode and sync draft when tool changes
  useEffect(() => {
    setIsEditing(false)
    setDraft(tool?.qrg || '')
    setHasChanges(false)
  }, [tool?.id])

  if (!tool) {
    return (
      <div className="qrg-panel qrg-panel--empty">
        <div className="qrg-empty-state">
          <LucideIcons.MousePointerClick size={40} strokeWidth={1.2} className="qrg-empty-icon" />
          <p className="qrg-empty-title">Select a tool</p>
          <p className="qrg-empty-sub">Click any tool on the left to view its Quick Reference Guide</p>
        </div>
      </div>
    )
  }

  const IconComponent = LucideIcons[tool.icon] || LucideIcons.Globe

  const handleEdit = () => {
    setDraft(tool.qrg || '')
    setHasChanges(false)
    setIsEditing(true)
  }

  const handleSave = () => {
    updateTool(tool.id, { qrg: draft })
    setIsEditing(false)
    setHasChanges(false)
  }

  const handleDiscard = () => {
    setDraft(tool.qrg || '')
    setIsEditing(false)
    setHasChanges(false)
  }

  const iconStyle = tool.color ? { background: `${tool.color}30`, color: tool.color } : {}

  return (
    <div className="qrg-panel">
      {/* Header */}
      <div className="qrg-header">
        <div className="qrg-tool-identity">
          <div className="qrg-tool-icon" style={iconStyle}>
            <IconComponent size={24} strokeWidth={1.5} />
          </div>
          <div>
            <h2 className="qrg-tool-name">{tool.name}</h2>
            {tool.description && (
              <p className="qrg-tool-desc">{tool.description}</p>
            )}
          </div>
        </div>

        <a
          href={tool.url}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-launch"
        >
          <LucideIcons.ExternalLink size={15} />
          Launch
        </a>
      </div>

      {/* QRG label + edit controls */}
      <div className="qrg-section-header">
        <span className="qrg-section-label">Quick Reference Guide</span>
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
          key={tool.id}
          value={isEditing ? draft : (tool.qrg || '')}
          onChange={(md) => { setDraft(md); setHasChanges(true) }}
          placeholder="Write a quick reference guide for this tool…"
          readOnly={!isEditing}
        />
      </div>
    </div>
  )
}
