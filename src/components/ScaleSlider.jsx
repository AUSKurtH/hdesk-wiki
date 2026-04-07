import React from 'react'
import { Minimize2 } from 'lucide-react'
import useAppStore from '../store/useAppStore.js'

export default function ScaleSlider() {
  const uiScale = useAppStore((s) => s.uiScale)
  const setUIScale = useAppStore((s) => s.setUIScale)

  const handleChange = (e) => {
    const value = parseFloat(e.target.value)
    setUIScale(value)
    document.documentElement.style.setProperty('--ui-scale', value)
  }

  const percentage = Math.round(uiScale * 100)

  return (
    <div className="scale-slider-wrap">
      <button
        className="btn btn-ghost btn-sm"
        title="UI Scale"
        aria-label="UI Scale control"
      >
        <Minimize2 size={18} />
      </button>
      <input
        type="range"
        min="0.5"
        max="1.5"
        step="0.1"
        value={uiScale}
        onChange={handleChange}
        className="scale-slider-input"
        title={`UI Scale: ${percentage}%`}
      />
      <span className="scale-slider-label">{percentage}%</span>
    </div>
  )
}
