import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { AuthTokenPayload } from '../types/index.js'
import { AppError } from './errorHandler.js'

export const verifyToken = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('No token provided', 401)
    }

    const token   = authHeader.split(' ')[1]
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as AuthTokenPayload

    req.user = decoded
    next()
  } catch (err) {
    next(err)
  }
}
