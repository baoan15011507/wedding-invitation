import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Repo GitHub Pages: https://baoan15011507.github.io/wedding-invitation/
  base: '/wedding-invitation/',
})
