import cors from 'cors'
import express from 'express'

import { errorHandler } from './infrastructure/http/middlewares/errorHandler'
import { occurrenceRoutes } from './infrastructure/http/routes/occurrence.routes'

export const app = express()

app.use(
  cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PATCH'],
    allowedHeaders: ['Content-Type'],
  }),
)

app.use(express.json())

app.get('/health', (_request, response) => {
  return response.json({
    status: 'ok',
  })
})

app.use(occurrenceRoutes)

app.use(errorHandler)