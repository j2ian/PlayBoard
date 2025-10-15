import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  base: '/PlayBoard/',
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    port: 8080,
    host: '0.0.0.0',
    allowedHosts: true,
    hmr: {
      port: 8080,
      host: '0.0.0.0'
    },
    proxy: {
      '/api': {
        target: 'http://playboard-backend:3001',
        changeOrigin: true
      }
    }
  }
})
