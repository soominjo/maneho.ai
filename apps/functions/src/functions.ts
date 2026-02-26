import { onRequest } from 'firebase-functions/v2/https'
import express from 'express'
import { createHTTPHandler } from '@trpc/server/adapters/standalone'
import { appRouter } from './trpc/router'

const app = express()

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  if (req.method === 'OPTIONS') {
    res.sendStatus(200)
  } else {
    next()
  }
})

app.use(express.json())

app.use(
  ['/api/trpc', '/trpc'],
  createHTTPHandler({
    router: appRouter,
    createContext: () => ({}),
  })
)

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

export const api = onRequest(app)
