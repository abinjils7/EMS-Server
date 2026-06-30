import { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { Department } from '../models/Department.model.js'
import { AppError } from '../middleware/errorHandler.js'

export const createDepartment = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const schema = z.object({
      name: z.string().min(2),
      description: z.string().optional(),
    })

    const body = schema.parse(req.body)

    const exists = await Department.findOne({ name: body.name })
    if (exists) {
      throw new AppError('Department already exists', 400)
    }

    const department = await Department.create(body)

    res.status(201).json({
      success: true,
      data: department,
    })
  } catch (err) {
    next(err)
  }
}

export const getAllDepartments = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const departments = await Department.find().sort({ createdAt: -1 })
    res.status(200).json({
      success: true,
      count: departments.length,
      data: departments,
    })
  } catch (err) {
    next(err)
  }
}

export const getDepartmentById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const department = await Department.findById(req.params.id)
    if (!department) {
      throw new AppError('Department not found', 404)
    }

    res.status(200).json({
      success: true,
      data: department,
    })
  } catch (err) {
    next(err)
  }
}

export const updateDepartment = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const schema = z.object({
      name: z.string().min(2).optional(),
      description: z.string().optional(),
    })

    const body = schema.parse(req.body)

    const updated = await Department.findByIdAndUpdate(req.params.id, body, {
      new: true,
      runValidators: true,
    })

    if (!updated) {
      throw new AppError('Department not found', 404)
    }

    res.status(200).json({
      success: true,
      data: updated,
    })
  } catch (err) {
    next(err)
  }
}

export const deleteDepartment = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const department = await Department.findByIdAndDelete(req.params.id)
    if (!department) {
      throw new AppError('Department not found', 404)
    }

    res.status(200).json({
      success: true,
      message: 'Department deleted',
    })
  } catch (err) {
    next(err)
  }
}
