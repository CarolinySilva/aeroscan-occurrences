import { ErrorRequestHandler } from 'express'
import { ZodError } from 'zod'

import { DomainError } from '../../../domain/errors/DomainError'
import { OccurrenceNotFoundError } from '../../../domain/errors/OccurrenceNotFoundError'

export const errorHandler: ErrorRequestHandler = (
  error,
  _request,
  response,
  _next,
) => {
  if (error instanceof ZodError) {
    response.status(400).json({
      message: 'Invalid request data',
      issues: error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      })),
    })

    return
  }

  if (error instanceof OccurrenceNotFoundError) {
    response.status(404).json({
      message: error.message,
    })

    return
  }

  if (error instanceof DomainError) {
    response.status(409).json({
      message: error.message,
    })

    return
  }

  console.error(error)

  response.status(500).json({
    message: 'Internal server error',
  })
}