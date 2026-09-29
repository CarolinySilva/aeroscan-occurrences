import express from 'express'

import { errorHandler } from './infrastructure/http/middlewares/errorHandler'
import { occurrenceRoutes } from './infrastructure/http/routes/occurrence.routes'

export const app = express()

app.use(express.json())

app.get('/health', (_request, response) => {
  response.status(200).json({
    status: 'ok',
  })
})

app.use(occurrenceRoutes)

app.use(errorHandler)