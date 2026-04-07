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
} from 'lucide-react'
import useAppStore from '../store/useAppStore.js'

function DocTreeNode({ doc, docs, level = 0, onAddDoc, onAddFolder }) {
  const navigate = useNavigate()
  const { docId } = useParams()
  const [open, setOpen] = useState(true)

  const children = Object.values(docs).filter((d) => d.parentId === doc.id)
  const isFolder = doc.type === 'folder'
  const isActive = docId === doc.id

  const handleClick = () => {
    if (isFolder) {
      setOpen((v) => !v)
    } else {
      navigate(`/docs/${doc.id}`)
    }
  }

  return (
    <div className="doc-tree-node">
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

      {isFolder && open && children.length > 0 && (
        <div className="doc-tree-children">
          {children
            .sort((a, b) => {
              if (a.type === 'folder' && b.type !== 'folder') return -1
              if (a.type !== 'folder' && b.type === 'folder') return 1
              return a.title.localeCompare(b.title)
            })
            .map((child) => (
              <DocTreeNode
                key={child.id}
                doc={child}
                docs={docs}
                level={level + 1}
                onAddDoc={onAddDoc}
                onAddFolder={onAddFolder}
              />
            ))}
        </div>
      )}
    </div>
  )
}

export default function DocTree() {
  const docs = useAppStore((s) => s.docs)
  const addDoc = useAppStore((s) => s.addDoc)
  const navigate = useNavigate()

  const rootDocs = Object.values(docs)
    .filter((d) => d.parentId === null)
    .sort((a, b) => {
      if (a.type === 'folder' && b.type !== 'folder') return -1
      if (a.type !== 'folder' && b.type === 'folder') return 1
      return a.title.localeCompare(b.title)
    })

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
        {rootDocs.map((doc) => (
          <DocTreeNode
            key={doc.id}
            doc={doc}
            docs={docs}
            level={0}
            onAddDoc={handleAddDoc}
            onAddFolder={handleAddFolder}
          />
        ))}
        {rootDocs.length === 0 && (
          <p className="doc-tree-empty">No docs yet. Click + to create one.</p>
        )}
      </div>
    </div>
  )
}
