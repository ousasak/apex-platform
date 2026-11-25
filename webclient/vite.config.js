// Vite configuration with Tailwind PostCSS support
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const backendTarget = env.VITE_BACKEND_URL || env.NUXT_DEV_API_PROXY || 'http://127.0.0.1:8003'

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/') || id.includes('node_modules/react-router-dom/')) {
              return 'react-vendor'
            }
            if (id.includes('node_modules/highlight.js/')) {
              return 'highlight-vendor'
            }
            if (id.includes('node_modules/chart.js/') || id.includes('node_modules/react-chartjs-2/')) {
              return 'chart-vendor'
            }
          },
        },
      },
    },
    server: {
      host: '0.0.0.0',
      port: 3000,
      proxy: {
        '/api': {
          target: backendTarget,
          changeOrigin: true,
        },
        '/storage': {
          target: backendTarget,
          changeOrigin: true,
        },
      },
    },
  }
})
