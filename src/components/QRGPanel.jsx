import React, { useState, useEffect } from 'react'
import * as LucideIcons from 'lucide-react'
import MDEditor from '@uiw/react-md-editor'
import useAppStore from '../store/useAppStore.js'

export default function QRGPanel({ tool }) {
  const updateTool = useAppStore((s) => s.updateTool)
  const theme = useAppStore((s) => s.theme)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')

  useEffect(() => {
    setEditing(false)
    setDraft('')
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
  const qrg = tool.qrg || ''

  const handleEditStart = () => {
    setDraft(qrg)
    setEditing(true)
  }

  const handleSave = () => {
    updateTool(tool.id, { qrg: draft })
    setEditing(false)
  }

  const handleDiscard = () => {
    setDraft('')
    setEditing(false)
  }

  return (
    <div className="qrg-panel">
      {/* Header */}
      <div className="qrg-header">
        <div className="qrg-tool-identity">
          <div className="qrg-tool-icon">
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
        {!editing ? (
          <button className="btn btn-ghost btn-sm" onClick={handleEditStart}>
            <LucideIcons.Pencil size={13} />
            Edit
          </button>
        ) : (
          <div className="qrg-edit-actions">
            <button className="btn btn-secondary btn-sm" onClick={handleDiscard}>
              Discard
            </button>
            <button className="btn btn-primary btn-sm" onClick={handleSave}>
              Save
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="qrg-content" data-color-mode={theme}>
        {editing ? (
          <MDEditor
            value={draft}
            onChange={setDraft}
            preview="edit"
            hideToolbar={false}
            height={420}
          />
        ) : qrg ? (
          <div className="qrg-preview wmde-markdown-var">
            <MDEditor.Markdown source={qrg} />
          </div>
        ) : (
          <div className="qrg-no-content">
            <p>No quick reference guide yet.</p>
            <button className="btn btn-secondary btn-sm" onClick={handleEditStart}>
              <LucideIcons.Plus size={13} />
              Write one
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
