import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import { createProxyMiddleware } from 'http-proxy-middleware'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 3000
const API_TARGET = process.env.API_TARGET || 'http://localhost:8080'

app.use(
  createProxyMiddleware({
    target: API_TARGET,
    changeOrigin: true,
    pathFilter: '/api',
    timeout: 0,
    proxyTimeout: 0,
    on: {
      error: (err, _req, res) => {
        console.error('API proxy error:', err.message)
        if ('writeHead' in res && !res.headersSent) {
          res.writeHead(502, { 'Content-Type': 'text/plain' })
        }
        res.end('Bad Gateway')
      },
    },
  })
)

const WEBDAV_USER = process.env.DEBRIDAV_WEBDAV_USERNAME || ''
const WEBDAV_PASS = process.env.DEBRIDAV_WEBDAV_PASSWORD || ''

app.use(
  createProxyMiddleware({
    target: API_TARGET,
    changeOrigin: true,
    pathFilter: '/stream',
    timeout: 0,
    proxyTimeout: 0,
    pathRewrite: { '^/stream': '' },
    on: {
      ...(WEBDAV_USER && {
        proxyReq: (proxyReq) => {
          proxyReq.setHeader(
            'Authorization',
            'Basic ' + Buffer.from(`${WEBDAV_USER}:${WEBDAV_PASS}`).toString('base64')
          )
        },
      }),
      error: (err, _req, res) => {
        console.error('Stream proxy error:', err.message)
        if ('writeHead' in res && !res.headersSent) {
          res.writeHead(502, { 'Content-Type': 'text/plain' })
        }
        res.end('Bad Gateway')
      },
    },
  })
)

app.use(express.static(path.join(__dirname, '..', 'dist')))

app.get('/{*path}', (_req, res) => {
  res.sendFile(path.join(__dirname, '..', 'dist', 'index.html'))
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}, proxying API to ${API_TARGET}`)
})
