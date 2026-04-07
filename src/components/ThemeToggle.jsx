import React from 'react'
import { Sun, Moon } from 'lucide-react'
import useAppStore from '../store/useAppStore.js'

export default function ThemeToggle() {
  const theme = useAppStore((s) => s.theme)
  const toggleTheme = useAppStore((s) => s.toggleTheme)

  return (
    <button
      onClick={toggleTheme}
      className="theme-toggle btn btn-ghost"
      title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
      aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
    >
      {theme === 'light' ? (
        <Moon size={18} />
      ) : (
        <Sun size={18} />
      )}
      <span style={{ fontSize: 13 }}>{theme === 'light' ? 'Dark' : 'Light'}</span>
    </button>
  )
}
