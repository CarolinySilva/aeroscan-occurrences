import {
    ErrorRequestHandler,
  } from 'express'
  
  import { DomainError } from '../../../domain/errors/DomainError'
  
  export const errorHandler: ErrorRequestHandler = (
    error,
    _request,
    response,
    _next,
  ) => {
    if (error instanceof DomainError) {
      response.status(409).json({
        message: error.message,
      })
      return
    }
  
    if (
      error instanceof Error &&
      error.message === 'Occurrence not found'
    ) {
      response.status(404).json({
        message: error.message,
      })
      return
    }
  
    console.error(error)
  
    response.status(500).json({
      message: 'Internal server error',
    })
  }