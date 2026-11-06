import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { A11yProvider } from './lib/a11y.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <A11yProvider>
      <App />
    </A11yProvider>
  </StrictMode>,
)
