import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'

import { proxyRequest } from './proxy.ts'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 7201

function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

// Upstream services
const API_BASE_URL = requireEnv('API_BASE_URL')
const AUTH_API_BASE_URL = requireEnv('AUTH_API_BASE_URL')

const allowedOrigins = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean)

const allowedHeaders = (process.env.CORS_HEADERS || '')
  .split(',')
  .map((h) => h.trim())
  .filter(Boolean)

const allowedMethods = (process.env.CORS_METHODS || '')
  .split(',')
  .map((h) => h.trim())
  .filter(Boolean)

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true)
      if (allowedOrigins.includes(origin)) return callback(null, true)
      return callback(new Error('Not allowed by CORS'))
    },
    credentials: true,
    methods: allowedMethods,
    allowedHeaders,
  }),
)

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Healthcheck endpoint
app.get('/api/tests/ping', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: Date.now(),
  })
})

// Proxy routes
app.use('/auth/api', (req, res) => proxyRequest(req, res, AUTH_API_BASE_URL))
app.use('/api', (req, res) => proxyRequest(req, res, API_BASE_URL))

const server = app.listen(PORT, () => {
  console.log(`PETS BFF running on port ${PORT}`)
})

function shutdown(signal: string): void {
  console.log(`${signal} received, shutting down gracefully`)

  server.close((err) => {
    if (err) {
      console.error('Error during shutdown:', err)
      process.exit(1)
    }
    console.log('Server closed, no longer accepting connections')
    process.exit(0)
  })

  // Force exit
  setTimeout(() => {
    console.error('Forced shutdown: connections did not close in time')
    process.exit(1)
  }, 20_000).unref()
}

process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT', () => shutdown('SIGINT'))
