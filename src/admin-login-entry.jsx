import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/tokens.css'
import './styles/liquid-wipe.css'
import AdminLoginPage from './pages/admin/AdminLoginPage.jsx'
import { ThemeProvider } from './theme/ThemeProvider.jsx'
import { AuthProvider } from './auth/AuthProvider.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <AdminLoginPage dashboardHref="./admin.html" homeHref="/" />
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>,
)