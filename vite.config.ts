import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/mesuds_morse_code/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
})
