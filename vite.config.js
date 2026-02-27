import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080', 
        changeOrigin: true,
        secure: false,
      },
      '/ws-monarch': {
      target: 'http://localhost:8080',
      ws: true, // Crucial for WebSockets
    }
    }
  }, // <--- Added this missing comma
  define: {
    // This fixes the "global is not defined" error
    global: 'window',
  },
})