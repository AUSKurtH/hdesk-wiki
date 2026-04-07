import React, { useState } from 'react'
import { ChevronDown, ChevronRight, Plus } from 'lucide-react'
import ToolCard from './ToolCard.jsx'
import useAppStore from '../store/useAppStore.js'

export default function ToolGrid({ searchQuery = '', onEditTool }) {
  const categories = useAppStore((s) => s.categories)
  const tools = useAppStore((s) => s.tools)
  const [collapsed, setCollapsed] = useState({})

  const toggleCategory = (cat) => {
    setCollapsed((prev) => ({ ...prev, [cat]: !prev[cat] }))
  }

  const filteredTools = (cat) => {
    const catTools = tools.filter((t) => t.category === cat)
    if (!searchQuery.trim()) return catTools
    const q = searchQuery.toLowerCase()
    return catTools.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        (t.description || '').toLowerCase().includes(q)
    )
  }

  const visibleCategories = categories.filter((cat) => {
    if (!searchQuery.trim()) return true
    return filteredTools(cat).length > 0
  })

  if (visibleCategories.length === 0) {
    return (
      <div className="tool-grid-empty">
        <p>No tools match your search.</p>
      </div>
    )
  }

  return (
    <div className="tool-grid-container">
      {visibleCategories.map((cat) => {
        const categoryTools = filteredTools(cat)
        const isCollapsed = collapsed[cat]

        return (
          <section key={cat} className="tool-category-section">
            <div
              className="tool-category-header"
              onClick={() => toggleCategory(cat)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  toggleCategory(cat)
                }
              }}
            >
              <div className="tool-category-title-wrap">
                <span className="tool-category-chevron">
                  {isCollapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
                </span>
                <h2 className="tool-category-name">{cat}</h2>
                <span className="tool-category-count">{categoryTools.length}</span>
              </div>
            </div>

            {!isCollapsed && (
              <div className="tool-cards-grid">
                {categoryTools.map((tool) => (
                  <ToolCard key={tool.id} tool={tool} onEdit={onEditTool} />
                ))}
                <button
                  className="tool-add-card"
                  onClick={() => onEditTool && onEditTool(null, cat)}
                  title={`Add tool to ${cat}`}
                >
                  <Plus size={20} />
                  <span>Add Tool</span>
                </button>
              </div>
            )}
          </section>
        )
      })}
    </div>
  )
}
