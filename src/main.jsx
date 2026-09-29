import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
/* Base resets + legacy clay helpers, then tokens win as source of truth */
import './index.css'
import './styles/tokens.css'
import './styles/liquid-wipe.css'
import App from './App.jsx'
import { ThemeProvider } from './theme/ThemeProvider.jsx'
import { AuthProvider } from './auth/AuthProvider.jsx'
import { CartProvider } from './lib/CartContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <CartProvider>
            <App />
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
)
