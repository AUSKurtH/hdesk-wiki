import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { LayoutDashboard, BookOpen, Settings, ChevronRight, Kanban, User } from 'lucide-react'

export default function Sidebar({ collapsed, onToggle }) {
  const location = useLocation()
  const isWikiSection = location.pathname.startsWith('/wiki')

  return (
    <aside className={`sidebar ${collapsed ? 'sidebar-collapsed' : ''}`}>
      {/* Brand */}
      <div
        className="sidebar-brand"
        onClick={collapsed ? onToggle : undefined}
        style={collapsed ? { cursor: 'pointer' } : {}}
      >
        <div className="sidebar-brand-icon">
          <LayoutDashboard size={20} />
        </div>
        {!collapsed && (
          <div className="sidebar-brand-text">
            <span className="sidebar-brand-name">Helpdesk</span>
            <span className="sidebar-brand-sub">Dashboard</span>
          </div>
        )}
        <button
          className="sidebar-collapse-btn"
          onClick={onToggle}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <ChevronRight
            size={16}
            style={{
              transform: collapsed ? 'rotate(0deg)' : 'rotate(180deg)',
              transition: 'transform 200ms ease',
            }}
          />
        </button>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `sidebar-nav-item ${isActive ? 'active' : ''}`
          }
          title="Helpdesk"
        >
          <LayoutDashboard size={18} />
          {!collapsed && <span>Helpdesk</span>}
        </NavLink>

        <NavLink
          to="/wiki"
          className={({ isActive }) =>
            `sidebar-nav-item ${isActive || isWikiSection ? 'active' : ''}`
          }
          title="Wiki"
        >
          <BookOpen size={18} />
          {!collapsed && <span>Wiki</span>}
        </NavLink>

        <NavLink
          to="/work-board"
          className={({ isActive }) =>
            `sidebar-nav-item ${isActive ? 'active' : ''}`
          }
          title="Work Board"
        >
          <Kanban size={18} />
          {!collapsed && <span>Work Board</span>}
        </NavLink>

        <NavLink
          to="/self-admin"
          className={({ isActive }) =>
            `sidebar-nav-item ${isActive ? 'active' : ''}`
          }
          title="Self Administration"
        >
          <User size={18} />
          {!collapsed && <span>Self Admin</span>}
        </NavLink>

        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `sidebar-nav-item ${isActive ? 'active' : ''}`
          }
          title="Settings"
        >
          <Settings size={18} />
          {!collapsed && <span>Settings</span>}
        </NavLink>
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="sidebar-footer">
          <span className="sidebar-footer-text">Helpdesk Wiki v0.2.65</span>
          <span className="sidebar-footer-sub">Created by Kurt Hvejsel 2026</span>
        </div>
      )}
    </aside>
  )
}
