import { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { Task } from '../models/Task.model.js'
import { Employee } from '../models/Employee.model.js'
import { AppError } from '../middleware/errorHandler.js'

// Employee submits a daily task
export const createTask = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const schema = z.object({
      title:       z.string().min(1),
      description: z.string().optional(),
      hoursWorked: z.coerce.number().min(0).max(24).optional(),
      date:        z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD').optional(),
      employeeId:  z.string().optional(),
    })

    const body = schema.parse(req.body)

    let targetEmployeeId;
    if (body.employeeId && (req.user!.role === 'Manager' || req.user!.role === 'Admin')) {
      targetEmployeeId = body.employeeId;
    } else {
      const employee = await Employee.findOne({ userId: req.user!.id })
      if (!employee) throw new AppError('Employee profile not found', 404)
      targetEmployeeId = employee._id;
    }

    const date = body.date ?? new Date().toISOString().slice(0, 10)

    const task = await Task.create({
      employeeId:  targetEmployeeId,
      date,
      title:       body.title,
      description: body.description ?? '',
      hoursWorked: body.hoursWorked ?? 0,
    })

    res.status(201).json({ success: true, data: task })
  } catch (err) {
    next(err)
  }
}

// Employee sees only their own tasks
export const getMyTasks = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const employee = await Employee.findOne({ userId: req.user!.id })
    if (!employee) throw new AppError('Employee profile not found', 404)

    const tasks = await Task.find({ employeeId: employee._id })
      .sort({ date: -1 })

    res.status(200).json({
      success: true,
      count:   tasks.length,
      data:    tasks,
    })
  } catch (err) {
    next(err)
  }
}

// Admin + Manager sees all tasks
// Optional query: employeeId, date
export const getAllTasks = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const filter: Record<string, unknown> = {}

    if (req.query.employeeId) filter.employeeId = req.query.employeeId
    if (req.query.date)       filter.date       = req.query.date

    const tasks = await Task.find(filter)
      .populate('employeeId', 'employeeId designation')
      .sort({ date: -1 })

    res.status(200).json({
      success: true,
      count:   tasks.length,
      data:    tasks,
    })
  } catch (err) {
    next(err)
  }
}

// Admin + Manager gets single task
export const getTaskById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('employeeId', 'employeeId designation')

    if (!task) throw new AppError('Task not found', 404)

    res.status(200).json({ success: true, data: task })
  } catch (err) {
    next(err)
  }
}

// Employee updates their own task status or fields
// Manager/Admin can also update status
export const updateTask = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const schema = z.object({
      title:       z.string().min(1).optional(),
      description: z.string().optional(),
      hoursWorked: z.coerce.number().min(0).max(24).optional(),
      status:      z.enum(['Pending', 'In Progress', 'Completed']).optional(),
    })

    const body = schema.parse(req.body)

    const task = await Task.findById(req.params.id)
    if (!task) throw new AppError('Task not found', 404)

    // If employee role, verify they own this task
    if (req.user!.role === 'Employee') {
      const employee = await Employee.findOne({ userId: req.user!.id })
      if (!employee) throw new AppError('Employee profile not found', 404)
      if (task.employeeId.toString() !== employee._id.toString()) {
        throw new AppError('Not allowed to update this task', 403)
      }
    }

    Object.assign(task, body)
    await task.save()

    res.status(200).json({ success: true, data: task })
  } catch (err) {
    next(err)
  }
}

// Manager + Admin adds a comment to a task
export const addManagerComment = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const schema = z.object({
      managerComment: z.string().min(1),
    })

    const { managerComment } = schema.parse(req.body)

    const task = await Task.findById(req.params.id)
    if (!task) throw new AppError('Task not found', 404)

    task.managerComment = managerComment
    await task.save()

    res.status(200).json({ success: true, data: task })
  } catch (err) {
    next(err)
  }
}

// Employee deletes their own task only if status is Pending
export const deleteTask = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const task = await Task.findById(req.params.id)
    if (!task) throw new AppError('Task not found', 404)

    if (req.user!.role === 'Employee') {
      const employee = await Employee.findOne({ userId: req.user!.id })
      if (!employee) throw new AppError('Employee profile not found', 404)
      if (task.employeeId.toString() !== employee._id.toString()) {
        throw new AppError('Not allowed to delete this task', 403)
      }
      if (task.status !== 'Pending') {
        throw new AppError('Only pending tasks can be deleted', 400)
      }
    }

    await task.deleteOne()

    res.status(200).json({ success: true, message: 'Task deleted' })
  } catch (err) {
    next(err)
  }
}
