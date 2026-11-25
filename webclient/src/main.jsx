import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'

// i18n initialization
import './lib/i18n'

// Styles
import 'highlight.js/styles/github-dark.css'
import 'aos/dist/aos.css'
import './index.css'

import AOS from 'aos'

AOS.init({
  duration: 800,
  easing: 'ease-out-cubic',
  once: true,
  offset: 50,
})

const rootEl = document.getElementById('root')
if (rootEl) {
  ReactDOM.createRoot(rootEl).render(
    <React.StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </React.StrictMode>
  )
}

const staticFooter = document.getElementById('static-footer')
if (staticFooter) staticFooter.style.display = 'none'
