import React from 'react'
import * as LucideIcons from 'lucide-react'

// Derive a lighter tint from a hex colour for the icon background
function hexToRgb(hex) {
  const h = hex.replace('#', '')
  const r = parseInt(h.substring(0, 2), 16)
  const g = parseInt(h.substring(2, 4), 16)
  const b = parseInt(h.substring(4, 6), 16)
  return { r, g, b }
}

export default function ToolCard({ tool, onSelect, onEdit, selected }) {
  const IconComponent = LucideIcons[tool.icon] || LucideIcons.Globe
  const color = tool.color || null

  const iconStyle = color
    ? { background: `${color}22`, color }
    : {}

  const selectedStyle = color
    ? { borderColor: color, boxShadow: `0 0 0 3px ${color}33, var(--shadow-card-hover)`, background: `${color}11` }
    : {}

  const handleClick = (e) => {
    if (e.target.closest('.tool-card-edit')) return
    onSelect && onSelect(tool)
  }

  return (
    <div
      className={`tool-card card${selected ? ' tool-card--selected' : ''}`}
      style={selected && color ? selectedStyle : {}}
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
