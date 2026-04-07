import React, { useState, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ChevronRight,
  ChevronDown,
  FileText,
  Folder,
  FolderOpen,
  Plus,
  FolderPlus,
  GripVertical,
} from 'lucide-react'
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import useAppStore from '../store/useAppStore.js'

// ── Build a sorted list of children for a given parent ──────────────────────
function getSortedChildren(docs, docOrder, parentId) {
  const key = parentId ?? 'root'
  const children = Object.values(docs).filter((d) => d.parentId === parentId)
  const order = docOrder[key]
  if (!order) {
    return children.sort((a, b) => {
      if (a.type === 'folder' && b.type !== 'folder') return -1
      if (a.type !== 'folder' && b.type === 'folder') return 1
      return a.title.localeCompare(b.title)
    })
  }
  return [
    ...order.map((id) => children.find((c) => c.id === id)).filter(Boolean),
    ...children.filter((c) => !order.includes(c.id)),
  ]
}

// ── Flatten the visible tree into a single ordered list ──────────────────────
function buildFlatList(docs, docOrder, openFolders, parentId = null, level = 0) {
  const children = getSortedChildren(docs, docOrder, parentId)
  return children.flatMap((doc) => {
    const isOpen = openFolders[doc.id] !== false
    const nested =
      doc.type === 'folder' && isOpen
        ? buildFlatList(docs, docOrder, openFolders, doc.id, level + 1)
        : []
    return [{ ...doc, level }, ...nested]
  })
}

// ── Single sortable row ──────────────────────────────────────────────────────
function DocTreeRow({ item, onToggle, onNavigate, onAddDoc, onAddFolder, isActive, isDragOverlay }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id, disabled: isDragOverlay })

  const isFolder = item.type === 'folder'
  const isOpen = item._isOpen

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging && !isDragOverlay ? 0.3 : 1,
  }

  return (
    <div ref={setNodeRef} style={style}>
      <div
        className={`doc-tree-item${isActive ? ' active' : ''}${isDragOverlay ? ' doc-tree-item--overlay' : ''}`}
        style={{ paddingLeft: `${8 + item.level * 16}px` }}
        onClick={() => {
          if (isFolder) onToggle(item.id)
          else onNavigate(item.id)
        }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            if (isFolder) onToggle(item.id)
            else onNavigate(item.id)
          }
        }}
      >
        <span
          className="doc-tree-drag-handle"
          {...attributes}
          {...listeners}
          onClick={(e) => e.stopPropagation()}
          title="Drag to reorder / move"
        >
          <GripVertical size={12} />
        </span>
        <span className="doc-tree-icon">
          {isFolder ? (
            isOpen ? (
              <><ChevronDown size={12} className="doc-tree-chevron" /><FolderOpen size={14} /></>
            ) : (
              <><ChevronRight size={12} className="doc-tree-chevron" /><Folder size={14} /></>
            )
          ) : (
            <><span style={{ width: 12, display: 'inline-block' }} /><FileText size={14} /></>
          )}
        </span>
        <span className="doc-tree-label">{item.title}</span>
        {isFolder && (
          <span className="doc-tree-actions">
            <button
              className="doc-tree-action-btn"
              title="New document in folder"
              onClick={(e) => { e.stopPropagation(); onAddDoc(item.id) }}
            >
              <Plus size={11} />
            </button>
            <button
              className="doc-tree-action-btn"
              title="New subfolder"
              onClick={(e) => { e.stopPropagation(); onAddFolder(item.id) }}
            >
              <FolderPlus size={11} />
            </button>
          </span>
        )}
      </div>
    </div>
  )
}

// ── Main DocTree component ───────────────────────────────────────────────────
export default function DocTree() {
  const docs = useAppStore((s) => s.docs)
  const addDoc = useAppStore((s) => s.addDoc)
  const moveDoc = useAppStore((s) => s.moveDoc)
  const docOrder = useAppStore((s) => s.docOrder)
  const setDocOrder = useAppStore((s) => s.setDocOrder)
  const navigate = useNavigate()
  const { docId } = useParams()

  const [openFolders, setOpenFolders] = useState({})
  const [activeId, setActiveId] = useState(null)  // dragging item id

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  // Build flat visible list
  const flatItems = useMemo(
    () => buildFlatList(docs, docOrder, openFolders).map((item) => ({
      ...item,
      _isOpen: openFolders[item.id] !== false,
    })),
    [docs, docOrder, openFolders]
  )

  const handleToggle = (id) =>
    setOpenFolders((prev) => ({ ...prev, [id]: prev[id] === false ? true : false }))

  const handleNavigate = (id) => navigate(`/docs/${id}`)

  const handleAddDoc = (parentId = null) => {
    const title = prompt('Doc title:')
    if (!title) return
    const id = `doc-${Date.now()}`
    addDoc({ id, title, content: `# ${title}\n\n`, parentId, type: 'file' })
    // Ensure parent folder is open
    if (parentId) setOpenFolders((prev) => ({ ...prev, [parentId]: true }))
    navigate(`/docs/${id}`)
  }

  const handleAddFolder = (parentId = null) => {
    const title = prompt('Folder name:')
    if (!title) return
    const id = `folder-${Date.now()}`
    addDoc({ id, title, content: null, parentId, type: 'folder' })
    if (parentId) setOpenFolders((prev) => ({ ...prev, [parentId]: true }))
  }

  const handleDragStart = ({ active }) => setActiveId(active.id)

  const handleDragEnd = ({ active, over }) => {
    setActiveId(null)
    if (!over || active.id === over.id) return

    const activeIdx = flatItems.findIndex((i) => i.id === active.id)
    const overIdx = flatItems.findIndex((i) => i.id === over.id)
    if (activeIdx === -1 || overIdx === -1) return

    const activeItem = flatItems[activeIdx]
    const overItem = flatItems[overIdx]

    // Determine the new parent for the dragged item:
    // - Dropping ONTO an open folder → move inside that folder
    // - Dropping ONTO anything else → become a sibling (same parent as over)
    const movingDown = activeIdx < overIdx
    let newParentId

    if (overItem.type === 'folder' && openFolders[overItem.id] !== false) {
      // Dropping onto an open folder: place inside it
      newParentId = overItem.id
    } else {
      newParentId = overItem.parentId ?? null
    }

    // Guard: don't allow dropping a folder into its own descendant
    if (newParentId !== null) {
      let check = newParentId
      while (check !== null) {
        if (check === active.id) return // would create a cycle
        check = docs[check]?.parentId ?? null
      }
    }

    const parentChanged = activeItem.parentId !== newParentId

    if (parentChanged) {
      // Reparent first, then reorder within new parent
      moveDoc(active.id, newParentId)
    }

    // Reorder within the new parent
    // Build ordered sibling list (excluding active), then insert active at correct position
    const siblings = flatItems.filter(
      (i) => i.id !== active.id && (i.parentId ?? null) === newParentId
    )
    const overInSiblings = siblings.findIndex((i) => i.id === over.id)

    let insertIdx
    if (overItem.type === 'folder' && openFolders[overItem.id] !== false && !parentChanged) {
      // Same open folder — over IS the parent, put active first inside
      insertIdx = 0
    } else if (overInSiblings === -1) {
      // over is not in the sibling list (e.g. it was the folder we dropped INTO)
      insertIdx = siblings.length
    } else {
      insertIdx = movingDown ? overInSiblings + 1 : overInSiblings
    }

    const newOrder = [...siblings]
    newOrder.splice(insertIdx, 0, { id: active.id })
    setDocOrder(newParentId ?? 'root', newOrder.map((i) => i.id))

    // Ensure destination folder is open
    if (newParentId) setOpenFolders((prev) => ({ ...prev, [newParentId]: true }))
  }

  const draggingItem = activeId ? flatItems.find((i) => i.id === activeId) : null

  return (
    <div className="doc-tree">
      <div className="doc-tree-toolbar">
        <span className="doc-tree-toolbar-label">Docs</span>
        <div className="doc-tree-toolbar-actions">
          <button className="doc-tree-action-btn" title="New document" onClick={() => handleAddDoc(null)}>
            <Plus size={13} />
          </button>
          <button className="doc-tree-action-btn" title="New folder" onClick={() => handleAddFolder(null)}>
            <FolderPlus size={13} />
          </button>
        </div>
      </div>

      <div className="doc-tree-list">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={flatItems.map((i) => i.id)} strategy={verticalListSortingStrategy}>
            {flatItems.map((item) => (
              <DocTreeRow
                key={item.id}
                item={item}
                onToggle={handleToggle}
                onNavigate={handleNavigate}
                onAddDoc={handleAddDoc}
                onAddFolder={handleAddFolder}
                isActive={docId === item.id}
              />
            ))}
          </SortableContext>

          <DragOverlay>
            {draggingItem && (
              <DocTreeRow
                item={draggingItem}
                onToggle={() => {}}
                onNavigate={() => {}}
                onAddDoc={() => {}}
                onAddFolder={() => {}}
                isActive={false}
                isDragOverlay
              />
            )}
          </DragOverlay>
        </DndContext>

        {flatItems.length === 0 && (
          <p className="doc-tree-empty">No docs yet. Click + to create one.</p>
        )}
      </div>
    </div>
  )
}
