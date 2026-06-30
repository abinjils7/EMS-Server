import { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { Leave } from '../models/Leave.model.js'
import { Employee } from '../models/Employee.model.js'
import { AppError } from '../middleware/errorHandler.js'

// Helper: count days between two YYYY-MM-DD strings inclusive
const countDays = (start: string, end: string): number => {
  const s    = new Date(start)
  const e    = new Date(end)
  const diff = e.getTime() - s.getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24)) + 1
}

// Employee applies for leave
export const applyLeave = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const schema = z.object({
      type:      z.enum(['Annual', 'Sick', 'Casual', 'Unpaid']),
      startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD'),
      endDate:   z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD'),
      reason:    z.string().min(1),
    })

    const body = schema.parse(req.body)

    if (body.startDate > body.endDate) {
      throw new AppError('Start date cannot be after end date', 400)
    }

    const employee = await Employee.findOne({ userId: req.user!.id })
    if (!employee) throw new AppError('Employee profile not found', 404)

    const totalDays = countDays(body.startDate, body.endDate)

    const leave = await Leave.create({
      employeeId: employee._id,
      type:       body.type,
      startDate:  body.startDate,
      endDate:    body.endDate,
      totalDays,
      reason:     body.reason,
    })

    res.status(201).json({ success: true, data: leave })
  } catch (err) {
    next(err)
  }
}

// Employee sees only their own leaves
export const getMyLeaves = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const employee = await Employee.findOne({ userId: req.user!.id })
    if (!employee) throw new AppError('Employee profile not found', 404)

    const leaves = await Leave.find({ employeeId: employee._id })
      .sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      count:   leaves.length,
      data:    leaves,
    })
  } catch (err) {
    next(err)
  }
}

// Admin + Manager: optional query by status, employeeId
export const getAllLeaves = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const filter: Record<string, unknown> = {}

    if (req.query.status)     filter.status     = req.query.status
    if (req.query.employeeId) filter.employeeId = req.query.employeeId

    const leaves = await Leave.find(filter)
      .populate('employeeId', 'employeeId designation')
      .sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      count:   leaves.length,
      data:    leaves,
    })
  } catch (err) {
    next(err)
  }
}

// Admin + Manager gets single leave
export const getLeaveById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const leave = await Leave.findById(req.params.id)
      .populate('employeeId', 'employeeId designation')

    if (!leave) throw new AppError('Leave request not found', 404)

    res.status(200).json({ success: true, data: leave })
  } catch (err) {
    next(err)
  }
}

// Admin + Manager approves a pending leave
export const approveLeave = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const leave = await Leave.findById(req.params.id)
    if (!leave) throw new AppError('Leave request not found', 404)

    if (leave.status !== 'Pending') {
      throw new AppError('Only pending leaves can be approved', 400)
    }

    leave.status     = 'Approved'
    leave.approvedBy = req.user!.id
    await leave.save()

    res.status(200).json({ success: true, data: leave })
  } catch (err) {
    next(err)
  }
}

// Admin + Manager rejects a pending leave with reason
export const rejectLeave = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const schema = z.object({
      rejectedReason: z.string().min(1),
    })

    const { rejectedReason } = schema.parse(req.body)

    const leave = await Leave.findById(req.params.id)
    if (!leave) throw new AppError('Leave request not found', 404)

    if (leave.status !== 'Pending') {
      throw new AppError('Only pending leaves can be rejected', 400)
    }

    leave.status         = 'Rejected'
    leave.rejectedReason = rejectedReason
    await leave.save()

    res.status(200).json({ success: true, data: leave })
  } catch (err) {
    next(err)
  }
}

// Employee cancels their own pending leave
export const cancelLeave = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const leave = await Leave.findById(req.params.id)
    if (!leave) throw new AppError('Leave request not found', 404)

    if (req.user!.role === 'Employee') {
      const employee = await Employee.findOne({ userId: req.user!.id })
      if (!employee) throw new AppError('Employee profile not found', 404)
      if (leave.employeeId.toString() !== employee._id.toString()) {
        throw new AppError('Not allowed to cancel this leave', 403)
      }
    }

    if (leave.status !== 'Pending') {
      throw new AppError('Only pending leaves can be cancelled', 400)
    }

    await leave.deleteOne()

    res.status(200).json({ success: true, message: 'Leave request cancelled' })
  } catch (err) {
    next(err)
  }
}
