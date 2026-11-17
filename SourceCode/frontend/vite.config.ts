import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // In development the React app calls /api/... and Vite forwards it to Spring Boot.
    proxy: {
      '/api': 'http://localhost:8080',
    },
  },
})
