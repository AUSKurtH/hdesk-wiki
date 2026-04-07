import React from 'react'
import * as LucideIcons from 'lucide-react'

export default function ToolCard({ tool, onEdit }) {
  const IconComponent = LucideIcons[tool.icon] || LucideIcons.Globe

  const handleClick = (e) => {
    if (e.target.closest('.tool-card-edit')) return
    window.open(tool.url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div
      className="tool-card card"
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          window.open(tool.url, '_blank', 'noopener,noreferrer')
        }
      }}
      title={`Open ${tool.name}`}
    >
      <div className="tool-card-icon">
        <IconComponent size={28} strokeWidth={1.5} />
      </div>
      <div className="tool-card-body">
        <span className="tool-card-name">{tool.name}</span>
        {tool.description && (
          <span className="tool-card-desc">{tool.description}</span>
        )}
      </div>
      {onEdit && (
        <button
          className="tool-card-edit btn btn-ghost btn-sm"
          onClick={(e) => {
            e.stopPropagation()
            onEdit(tool)
          }}
          title="Edit tool"
          aria-label={`Edit ${tool.name}`}
        >
          <LucideIcons.Pencil size={13} />
        </button>
      )}
    </div>
  )
}
