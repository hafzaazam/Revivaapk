import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    emptyOutDir: false,
    cssCodeSplit: true,
    cssMinify: true,
    sourcemap: false,
    chunkSizeWarningLimit: 600,
    modulePreload: false,
    rollupOptions: {
      input: {
        main: 'index.html',
        notFound: '404.html',
        adminLogin: 'admin-login.html',
        admin: 'admin.html',
      },
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/framer-motion')) return 'motion'
          if (id.includes('node_modules/lucide-react')) return 'icons'
          if (id.includes('node_modules/react-router') || id.includes('node_modules/react-router-dom')) {
            return 'router'
          }
          if (id.includes('node_modules/react-dom') || id.includes('node_modules/react/')) {
            return 'react-vendor'
          }
          if (id.includes('node_modules/@supabase/')) return 'supabase'
          return undefined
        },
      },
    },
  },
})
