import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/tokens.css'
import './styles/liquid-wipe.css'
import AdminGate from './pages/admin/AdminGate.jsx'
import { ThemeProvider } from './theme/ThemeProvider.jsx'
import { AuthProvider } from './auth/AuthProvider.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <AdminGate />
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>,
)