import React from 'react'
import * as LucideIcons from 'lucide-react'

export default function ToolCard({ tool, onSelect, onEdit, selected }) {
  const IconComponent = LucideIcons[tool.icon] || LucideIcons.Globe
  const color = tool.color || null

  // Build inline styles only when a custom colour is set
  const cardStyle = color ? {
    '--card-color': color,
    background: `${color}18`,
    borderColor: `${color}55`,
  } : {}

  const iconStyle = color ? {
    background: `${color}30`,
    color,
  } : {}

  const handleClick = (e) => {
    if (e.target.closest('.tool-card-edit')) return
    onSelect && onSelect(tool)
  }

  return (
    <div
      className={`tool-card card${selected ? ' tool-card--selected' : ''}${color ? ' tool-card--colored' : ''}`}
      style={cardStyle}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onSelect && onSelect(tool)
        }
      }}
      title={tool.name}
    >
      <div className="tool-card-icon" style={iconStyle}>
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
