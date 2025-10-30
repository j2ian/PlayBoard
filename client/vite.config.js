import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import { readFileSync } from 'fs'

// 讀取 package.json 取得版本號
const packageJson = JSON.parse(readFileSync('./package.json', 'utf-8'))

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [vue(), tailwindcss()],
    define: {
      __APP_VERSION__: JSON.stringify(packageJson.version)
    },
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
          target: env.VITE_PROXY_TARGET || 'http://localhost:3000',
          changeOrigin: true
        }
      }
    }
  }
})
