import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import { createProxyMiddleware } from 'http-proxy-middleware'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 3000
const API_TARGET = process.env.API_TARGET || 'http://localhost:8080'

app.use(
  '/api',
  createProxyMiddleware({
    target: API_TARGET,
    changeOrigin: true,
  })
)

const WEBDAV_USER = process.env.DEBRIDAV_WEBDAV_USERNAME || ''
const WEBDAV_PASS = process.env.DEBRIDAV_WEBDAV_PASSWORD || ''

app.use(
  '/stream',
  createProxyMiddleware({
    target: API_TARGET,
    changeOrigin: true,
    pathRewrite: { '^/stream': '' },
    ...(WEBDAV_USER && {
      on: {
        proxyReq: (proxyReq) => {
          proxyReq.setHeader(
            'Authorization',
            'Basic ' + Buffer.from(`${WEBDAV_USER}:${WEBDAV_PASS}`).toString('base64')
          )
        },
      },
    }),
  })
)

app.use(express.static(path.join(__dirname, '..', 'dist')))

app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, '..', 'dist', 'index.html'))
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}, proxying API to ${API_TARGET}`)
})
