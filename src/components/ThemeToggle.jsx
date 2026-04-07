import React from 'react'
import { Sun, Moon } from 'lucide-react'
import useAppStore from '../store/useAppStore.js'

const LIGHT_THEMES = ['light', 'warm']

const THEME_LABELS = {
  light: 'Light',
  dark: 'Dark',
  midnight: 'Midnight',
  forest: 'Forest',
  ocean: 'Ocean',
  warm: 'Warm',
}

export default function ThemeToggle() {
  const theme = useAppStore((s) => s.theme)
  const toggleTheme = useAppStore((s) => s.toggleTheme)
  const lastLightTheme = useAppStore((s) => s.lastLightTheme)
  const lastDarkTheme = useAppStore((s) => s.lastDarkTheme)

  const isLight = LIGHT_THEMES.includes(theme)
  const destination = isLight ? lastDarkTheme : lastLightTheme
  const destLabel = THEME_LABELS[destination] || destination

  return (
    <button
      onClick={toggleTheme}
      className="theme-toggle btn btn-ghost"
      title={`Switch to ${destLabel} theme`}
      aria-label={`Switch to ${destLabel} theme`}
    >
      {isLight ? (
        <Moon size={18} />
      ) : (
        <Sun size={18} />
      )}
      <span style={{ fontSize: 13 }}>{isLight ? 'Dark' : 'Light'}</span>
    </button>
  )
}
