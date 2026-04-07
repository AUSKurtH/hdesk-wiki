import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './styles/global.css'

// Apply saved theme before render to avoid flash
const savedStore = localStorage.getItem('hdesk_wiki_store')
if (savedStore) {
  try {
    const { state } = JSON.parse(savedStore)
    if (state?.theme) {
      document.documentElement.setAttribute('data-theme', state.theme)
    }
  } catch {
    // ignore
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
