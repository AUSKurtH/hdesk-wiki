import React, { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import Dashboard from './pages/Dashboard.jsx'
import SelfAdminDashboard from './pages/SelfAdminDashboard.jsx'
import WorkBoard from './pages/WorkBoard.jsx'
import WikiPage from './pages/WikiPage.jsx'
import Settings from './pages/Settings.jsx'
import useAppStore from './store/useAppStore.js'

const CSS_VAR_MAP = {
  mdBoldColor:    '--md-bold-color',
  mdItalicColor:  '--md-italic-color',
  mdCodeColor:    '--md-code-color',
  mdHeadingColor: '--md-heading-color',
  mdH1Color:      '--md-h1-color',
  mdH2Color:      '--md-h2-color',
  mdH3Color:      '--md-h3-color',
  mdLinkColor:    '--md-link-color',
  colorPrimary:   '--color-primary',
  colorBg:        '--color-bg',
  colorSidebar:   '--color-sidebar',
  colorSurface:   '--color-surface',
  colorBorder:    '--color-border',
  colorText:      '--color-text',
}

export default function App() {
  const theme = useAppStore((s) => s.theme)
  const themeOverrides = useAppStore((s) => s.themeOverrides)
  const customThemes = useAppStore((s) => s.customThemes)
  const uiScale = useAppStore((s) => s.uiScale)

  useEffect(() => {
    const ct = customThemes.find((t) => t.id === theme)
    document.documentElement.setAttribute('data-theme', ct ? ct.baseTheme : theme)
  }, [theme, customThemes])

  useEffect(() => {
    const override = themeOverrides[theme] || {}
    for (const [key, cssVar] of Object.entries(CSS_VAR_MAP)) {
      if (override[key] !== undefined) {
        document.documentElement.style.setProperty(cssVar, override[key])
      } else {
        document.documentElement.style.removeProperty(cssVar)
      }
    }
  }, [theme, themeOverrides])

  useEffect(() => {
    document.documentElement.style.setProperty('--ui-scale', uiScale)
  }, [uiScale])

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/self-admin" element={<SelfAdminDashboard />} />
        <Route path="/work-board" element={<WorkBoard />} />
        <Route path="/wiki" element={<WikiPage />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Layout>
  )
}
