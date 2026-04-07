import React, { useState } from 'react'
import { useLocation } from 'react-router-dom'
import Sidebar from './Sidebar.jsx'
import ThemeToggle from './ThemeToggle.jsx'

export default function Layout({ children }) {
  const location = useLocation()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const pageTitle = () => {
    if (location.pathname.startsWith('/docs')) return 'Documentation'
    if (location.pathname.startsWith('/settings')) return 'Settings'
    return 'Helpdesk Dashboard'
  }

  return (
    <div className={`layout ${sidebarCollapsed ? 'layout-sidebar-collapsed' : ''}`}>
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((v) => !v)}
      />
      <div className="layout-main">
        <header className="layout-header">
          <h1 className="layout-header-title">{pageTitle()}</h1>
          <div className="layout-header-actions">
            <ThemeToggle />
          </div>
        </header>
        <main className="layout-content">
          {children}
        </main>
      </div>
    </div>
  )
}
