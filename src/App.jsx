import React, { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import Dashboard from './pages/Dashboard.jsx'
import DocPage from './pages/DocPage.jsx'
import Settings from './pages/Settings.jsx'
import useAppStore from './store/useAppStore.js'

const CSS_VAR_MAP = {
  mdBoldColor: '--md-bold-color',
  mdItalicColor: '--md-italic-color',
  mdCodeColor: '--md-code-color',
  mdHeadingColor: '--md-heading-color',
  mdLinkColor: '--md-link-color',
  colorPrimary: '--color-primary',
  colorBg: '--color-bg',
  colorSidebar: '--color-sidebar',
  colorSurface: '--color-surface',
  colorBorder: '--color-border',
  colorText: '--color-text',
}

export default function App() {
  const theme = useAppStore((s) => s.theme)
  const themeOverrides = useAppStore((s) => s.themeOverrides)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

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

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/docs" element={<DocPage />} />
        <Route path="/docs/:docId" element={<DocPage />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Layout>
  )
}
