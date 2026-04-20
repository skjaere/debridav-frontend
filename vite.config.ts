import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/actuator': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/stream': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/stream/, ''),
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            const user = process.env.DEBRIDAV_WEBDAV_USERNAME || ''
            const pass = process.env.DEBRIDAV_WEBDAV_PASSWORD || ''
            if (user) {
              proxyReq.setHeader('Authorization', 'Basic ' + Buffer.from(`${user}:${pass}`).toString('base64'))
            }
          })
        },
      },
    },
  },
})
