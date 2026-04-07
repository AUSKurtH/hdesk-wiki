import React, { useState } from 'react'
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

function SortableDocNode({ doc, docs, level = 0, onAddDoc, onAddFolder, docOrder, setDocOrder }) {
  const navigate = useNavigate()
  const { docId } = useParams()
  const [open, setOpen] = useState(true)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: doc.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  const allChildren = Object.values(docs).filter((d) => d.parentId === doc.id)
  const isFolder = doc.type === 'folder'
  const isActive = docId === doc.id

  // Sort children by docOrder if available, else fallback to folder-first + title
  const parentKey = doc.id
  const order = docOrder[parentKey]
  const sortedChildren = order
    ? [
        ...order.map((id) => allChildren.find((c) => c.id === id)).filter(Boolean),
        ...allChildren.filter((c) => !order.includes(c.id)).sort((a, b) => {
          if (a.type === 'folder' && b.type !== 'folder') return -1
          if (a.type !== 'folder' && b.type === 'folder') return 1
          return a.title.localeCompare(b.title)
        }),
      ]
    : allChildren.sort((a, b) => {
        if (a.type === 'folder' && b.type !== 'folder') return -1
        if (a.type !== 'folder' && b.type === 'folder') return 1
        return a.title.localeCompare(b.title)
      })

  const handleClick = () => {
    if (isFolder) {
      setOpen((v) => !v)
    } else {
      navigate(`/docs/${doc.id}`)
    }
  }

  const childSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleChildDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return
    const oldIdx = sortedChildren.findIndex((c) => c.id === active.id)
    const newIdx = sortedChildren.findIndex((c) => c.id === over.id)
    const newOrder = arrayMove(sortedChildren, oldIdx, newIdx).map((c) => c.id)
    setDocOrder(parentKey, newOrder)
  }

  return (
    <div ref={setNodeRef} style={style} className="doc-tree-node">
      <div
        className={`doc-tree-item ${isActive ? 'active' : ''}`}
        style={{ paddingLeft: `${8 + level * 16}px` }}
        onClick={handleClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            handleClick()
          }
        }}
      >
        <span
          className="doc-tree-drag-handle"
          {...attributes}
          {...listeners}
          onClick={(e) => e.stopPropagation()}
          title="Drag to reorder"
        >
          <GripVertical size={12} />
        </span>
        <span className="doc-tree-icon">
          {isFolder ? (
            open ? (
              <>
                <ChevronDown size={12} className="doc-tree-chevron" />
                <FolderOpen size={14} />
              </>
            ) : (
              <>
                <ChevronRight size={12} className="doc-tree-chevron" />
                <Folder size={14} />
              </>
            )
          ) : (
            <>
              <span style={{ width: 12, display: 'inline-block' }} />
              <FileText size={14} />
            </>
          )}
        </span>
        <span className="doc-tree-label">{doc.title}</span>
        {isFolder && (
          <span className="doc-tree-actions">
            <button
              className="doc-tree-action-btn"
              title="New doc in folder"
              onClick={(e) => {
                e.stopPropagation()
                onAddDoc(doc.id)
              }}
            >
              <Plus size={11} />
            </button>
          </span>
        )}
      </div>

      {isFolder && open && sortedChildren.length > 0 && (
        <div className="doc-tree-children">
          <DndContext
            sensors={childSensors}
            collisionDetection={closestCenter}
            onDragEnd={handleChildDragEnd}
          >
            <SortableContext items={sortedChildren.map((c) => c.id)} strategy={verticalListSortingStrategy}>
              {sortedChildren.map((child) => (
                <SortableDocNode
                  key={child.id}
                  doc={child}
                  docs={docs}
                  level={level + 1}
                  onAddDoc={onAddDoc}
                  onAddFolder={onAddFolder}
                  docOrder={docOrder}
                  setDocOrder={setDocOrder}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>
      )}
    </div>
  )
}

export default function DocTree() {
  const docs = useAppStore((s) => s.docs)
  const addDoc = useAppStore((s) => s.addDoc)
  const docOrder = useAppStore((s) => s.docOrder)
  const setDocOrder = useAppStore((s) => s.setDocOrder)
  const navigate = useNavigate()

  // Sort root docs by docOrder if available
  const allRootDocs = Object.values(docs).filter((d) => d.parentId === null)
  const rootOrder = docOrder['root']
  const rootDocs = rootOrder
    ? [
        ...rootOrder.map((id) => allRootDocs.find((d) => d.id === id)).filter(Boolean),
        ...allRootDocs.filter((d) => !rootOrder.includes(d.id)).sort((a, b) => {
          if (a.type === 'folder' && b.type !== 'folder') return -1
          if (a.type !== 'folder' && b.type === 'folder') return 1
          return a.title.localeCompare(b.title)
        }),
      ]
    : allRootDocs.sort((a, b) => {
        if (a.type === 'folder' && b.type !== 'folder') return -1
        if (a.type !== 'folder' && b.type === 'folder') return 1
        return a.title.localeCompare(b.title)
      })

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleRootDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return
    const oldIdx = rootDocs.findIndex((d) => d.id === active.id)
    const newIdx = rootDocs.findIndex((d) => d.id === over.id)
    const newOrder = arrayMove(rootDocs, oldIdx, newIdx).map((d) => d.id)
    setDocOrder('root', newOrder)
  }

  const handleAddDoc = (parentId = null) => {
    const title = prompt('Doc title:')
    if (!title) return
    const id = `doc-${Date.now()}`
    addDoc({
      id,
      title,
      content: `# ${title}\n\n`,
      parentId,
      type: 'file',
    })
    navigate(`/docs/${id}`)
  }

  const handleAddFolder = (parentId = null) => {
    const title = prompt('Folder name:')
    if (!title) return
    const id = `folder-${Date.now()}`
    addDoc({
      id,
      title,
      content: null,
      parentId,
      type: 'folder',
    })
  }

  return (
    <div className="doc-tree">
      <div className="doc-tree-toolbar">
        <span className="doc-tree-toolbar-label">Docs</span>
        <div className="doc-tree-toolbar-actions">
          <button
            className="doc-tree-action-btn"
            title="New document"
            onClick={() => handleAddDoc(null)}
          >
            <Plus size={13} />
          </button>
          <button
            className="doc-tree-action-btn"
            title="New folder"
            onClick={() => handleAddFolder(null)}
          >
            <FolderPlus size={13} />
          </button>
        </div>
      </div>

      <div className="doc-tree-list">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleRootDragEnd}
        >
          <SortableContext items={rootDocs.map((d) => d.id)} strategy={verticalListSortingStrategy}>
            {rootDocs.map((doc) => (
              <SortableDocNode
                key={doc.id}
                doc={doc}
                docs={docs}
                level={0}
                onAddDoc={handleAddDoc}
                onAddFolder={handleAddFolder}
                docOrder={docOrder}
                setDocOrder={setDocOrder}
              />
            ))}
          </SortableContext>
        </DndContext>
        {rootDocs.length === 0 && (
          <p className="doc-tree-empty">No docs yet. Click + to create one.</p>
        )}
      </div>
    </div>
  )
}
