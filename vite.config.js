import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/simcoApi': {
        target: 'http://127.0.0.1:5001/rts-labs-f3981/us-central1',
        changeOrigin: true,
      },
    },
  },
})
