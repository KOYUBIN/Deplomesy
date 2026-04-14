import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    // Vite runs on 5174 internally — Express on 3001 proxies to it.
    // Do NOT expose to external host; only the Express server (port 3001) is public.
    port: 5174,
    strictPort: true,
    host: 'localhost',
  },
})
