import React, { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import Dashboard from './pages/Dashboard.jsx'
import DocPage from './pages/DocPage.jsx'
import Settings from './pages/Settings.jsx'
import useAppStore from './store/useAppStore.js'

export default function App() {
  const theme = useAppStore((s) => s.theme)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

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
