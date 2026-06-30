import { Request, Response, NextFunction } from 'express'
import { UserRole } from '../types/index.js'
import { AppError } from './errorHandler.js'

export const authorizeRoles = (...roles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      if (!req.user || !roles.includes(req.user.role)) {
        throw new AppError('Access denied', 403)
      }
      next()
    } catch (err) {
      next(err)
    }
  }
}
