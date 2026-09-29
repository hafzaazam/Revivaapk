import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/tokens.css'
import './styles/liquid-wipe.css'
import NotFoundPage from './pages/NotFoundPage.jsx'
import { ThemeProvider } from './theme/ThemeProvider.jsx'
import { AuthProvider } from './auth/AuthProvider.jsx'
import { CartProvider } from './lib/CartContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <NotFoundPage standalone homeHref="/" />
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>,
)