import React, { useState } from 'react'
import { ChevronDown, ChevronRight, Plus, GripVertical } from 'lucide-react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import ToolCard from './ToolCard.jsx'
import useAppStore from '../store/useAppStore.js'

function SortableCategory({ cat, categoryTools, isCollapsed, onToggle, onEditTool, onSelectTool, selectedToolId }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: cat })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <section ref={setNodeRef} style={style} className="tool-category-section">
      <div className="tool-category-header">
        {/* Drag handle — only this triggers drag */}
        <span
          className="tool-category-drag-handle"
          {...attributes}
          {...listeners}
          title="Drag to reorder"
        >
          <GripVertical size={15} />
        </span>

        {/* Chevron + name — only this triggers collapse */}
        <button
          className="tool-category-title-wrap"
          onClick={() => onToggle(cat)}
          type="button"
        >
          <span className="tool-category-chevron">
            {isCollapsed ? <ChevronRight size={15} /> : <ChevronDown size={15} />}
          </span>
          <h2 className="tool-category-name">{cat}</h2>
          <span className="tool-category-count">{categoryTools.length}</span>
        </button>
      </div>

      {!isCollapsed && (
        <div className="tool-cards-grid">
          {categoryTools.map((tool) => (
            <ToolCard
              key={tool.id}
              tool={tool}
              onEdit={onEditTool}
              onSelect={onSelectTool}
              selected={tool.id === selectedToolId}
            />
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
}

export default function ToolGrid({ searchQuery = '', onEditTool, onSelectTool, selectedToolId }) {
  const categories = useAppStore((s) => s.categories)
  const tools = useAppStore((s) => s.tools)
  const reorderCategories = useAppStore((s) => s.reorderCategories)
  const [collapsed, setCollapsed] = useState({})

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  )

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

  const handleDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return
    const oldIndex = categories.indexOf(active.id)
    const newIndex = categories.indexOf(over.id)
    reorderCategories(arrayMove(categories, oldIndex, newIndex))
  }

  if (visibleCategories.length === 0) {
    return (
      <div className="tool-grid-empty">
        <p>No tools match your search.</p>
      </div>
    )
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={visibleCategories} strategy={verticalListSortingStrategy}>
        <div className="tool-grid-container">
          {visibleCategories.map((cat) => (
            <SortableCategory
              key={cat}
              cat={cat}
              categoryTools={filteredTools(cat)}
              isCollapsed={!!collapsed[cat]}
              onToggle={toggleCategory}
              onEditTool={onEditTool}
              onSelectTool={onSelectTool}
              selectedToolId={selectedToolId}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
