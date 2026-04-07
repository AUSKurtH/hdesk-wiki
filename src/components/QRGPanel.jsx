import React, { useState, useEffect } from 'react'
import * as LucideIcons from 'lucide-react'
import WikiEditor from './WikiEditor.jsx'
import useAppStore from '../store/useAppStore.js'

export default function QRGPanel({ tool }) {
  const updateTool = useAppStore((s) => s.updateTool)
  const [draft, setDraft] = useState('')
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
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

  const handleSave = () => {
    updateTool(tool.id, { qrg: draft })
    setHasChanges(false)
  }

  const handleDiscard = () => {
    setDraft(tool.qrg || '')
    setHasChanges(false)
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

      {/* QRG label + save controls */}
      <div className="qrg-section-header">
        <span className="qrg-section-label">Quick Reference Guide</span>
        {hasChanges && (
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

      {/* Live editor */}
      <div className="qrg-content">
        <WikiEditor
          key={tool.id}
          value={draft}
          onChange={(md) => { setDraft(md); setHasChanges(true) }}
          placeholder="Write a quick reference guide for this tool…"
        />
      </div>
    </div>
  )
}
