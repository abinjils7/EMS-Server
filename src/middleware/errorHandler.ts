import { Request, Response, NextFunction } from 'express'
import { ZodError } from 'zod'

export class AppError extends Error {
  statusCode: number

  constructor(message: string, statusCode: number) {
    super(message)
    this.statusCode = statusCode
    this.name = 'AppError'
    Error.captureStackTrace(this, this.constructor)
  }
}

interface MongoError extends Error {
  code?: number
  statusCode?: number
  errors?: Record<string, { message: string }>
}

export const errorHandler = (
  err: MongoError | ZodError | Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let statusCode = (err as MongoError).statusCode ?? 500
  let message    = err.message ?? 'Internal server error'

  // Zod validation errors
  if (err instanceof ZodError) {
    statusCode = 400
    message = err.issues.map((i) => i.message).join(', ')
  }

  // Mongoose validation errors
  if (err.name === 'ValidationError' && (err as MongoError).errors) {
    statusCode = 400
    message = Object.values((err as MongoError).errors!)
      .map((e) => e.message)
      .join(', ')
  }

  if ((err as MongoError).code === 11000) {
    statusCode = 400
    message = 'Email already exists'
  }

  if (err.name === 'JsonWebTokenError') {
    statusCode = 401
    message = 'Invalid token'
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401
    message = 'Token expired'
  }

  res.status(statusCode).json({ success: false, message })
}

