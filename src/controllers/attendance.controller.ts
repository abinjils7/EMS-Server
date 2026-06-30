import { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { Attendance } from '../models/Attendance.model.js'
import { Employee } from '../models/Employee.model.js'
import { AppError } from '../middleware/errorHandler.js'

// Shift start time — 9:00 AM
const SHIFT_START_HOUR   = 9
const SHIFT_START_MINUTE = 0
const WORK_HOURS         = 8 // standard working hours per day

// Helper: get today's date as 'YYYY-MM-DD' in local time
const getTodayString = (): string => {
  const now = new Date()
  const yyyy = now.getFullYear()
  const mm   = String(now.getMonth() + 1).padStart(2, '0')
  const dd   = String(now.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

export const checkIn = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // 1. Find employee by logged-in userId
    const employee = await Employee.findOne({ userId: req.user!.id })
    if (!employee) throw new AppError('Employee profile not found', 404)

    const today = getTodayString()

    // 2. Prevent duplicate checkin for same day
    const existing = await Attendance.findOne({
      employeeId: employee._id,
      date: today,
    })
    if (existing) throw new AppError('Already checked in for today', 400)

    // 3. Determine if late
    const now        = new Date()
    const shiftStart = new Date(now)
    shiftStart.setHours(SHIFT_START_HOUR, SHIFT_START_MINUTE, 0, 0)
    const isLate = now > shiftStart

    // 4. Create attendance record
    const attendance = await Attendance.create({
      employeeId: employee._id,
      date:       today,
      checkIn:    now,
      isLate,
      status:     'Present',
    })

    res.status(201).json({ success: true, data: attendance })
  } catch (err) {
    next(err)
  }
}

export const checkOut = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // 1. Find employee
    const employee = await Employee.findOne({ userId: req.user!.id })
    if (!employee) throw new AppError('Employee profile not found', 404)

    const today = getTodayString()

    // 2. Find today's attendance record
    const attendance = await Attendance.findOne({
      employeeId: employee._id,
      date:       today,
    })
    if (!attendance)         throw new AppError('No check-in found for today', 404)
    if (attendance.checkOut) throw new AppError('Already checked out for today', 400)

    // 3. Calculate total hours
    const now        = new Date()
    const diffMs     = now.getTime() - attendance.checkIn.getTime()
    const totalHours = parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2))

    // 4. Calculate overtime (hours beyond standard work hours)
    const overtime = totalHours > WORK_HOURS
      ? parseFloat((totalHours - WORK_HOURS).toFixed(2))
      : 0

    // 5. Determine Half Day (less than 4 hours)
    const status = totalHours < 4 ? 'Half Day' : 'Present'

    // 6. Update record
    attendance.checkOut   = now
    attendance.totalHours = totalHours
    attendance.overtime   = overtime
    attendance.status     = status
    await attendance.save()

    res.status(200).json({ success: true, data: attendance })
  } catch (err) {
    next(err)
  }
}

export const getMyAttendance = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const employee = await Employee.findOne({ userId: req.user!.id })
    if (!employee) throw new AppError('Employee profile not found', 404)

    const records = await Attendance.find({ employeeId: employee._id })
      .sort({ date: -1 })

    res.status(200).json({
      success: true,
      count: records.length,
      data:  records,
    })
  } catch (err) {
    next(err)
  }
}

export const getMonthlyAttendance = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const employee = await Employee.findOne({ userId: req.user!.id })
    if (!employee) throw new AppError('Employee profile not found', 404)

    const now   = new Date()
    const month = parseInt(req.query.month as string) || now.getMonth() + 1
    const year  = parseInt(req.query.year  as string) || now.getFullYear()

    // Build date range strings 'YYYY-MM-DD'
    const mm    = String(month).padStart(2, '0')
    const start = `${year}-${mm}-01`
    const end   = `${year}-${mm}-31`

    const records = await Attendance.find({
      employeeId: employee._id,
      date: { $gte: start, $lte: end },
    }).sort({ date: 1 })

    // Summary counts
    const summary = {
      present:    records.filter(r => r.status === 'Present').length,
      absent:     records.filter(r => r.status === 'Absent').length,
      halfDay:    records.filter(r => r.status === 'Half Day').length,
      leave:      records.filter(r => r.status === 'Leave').length,
      holiday:    records.filter(r => r.status === 'Holiday').length,
      totalHours: parseFloat(
        records.reduce((sum, r) => sum + r.totalHours, 0).toFixed(2)
      ),
    }

    res.status(200).json({
      success: true,
      month,
      year,
      summary,
      count: records.length,
      data:  records,
    })
  } catch (err) {
    next(err)
  }
}

export const getAllAttendance = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const filter: Record<string, unknown> = {}

    if (req.query.date)       filter.date       = req.query.date
    if (req.query.employeeId) filter.employeeId = req.query.employeeId

    const records = await Attendance.find(filter)
      .populate('employeeId', 'employeeId designation')
      .sort({ date: -1 })

    res.status(200).json({
      success: true,
      count: records.length,
      data:  records,
    })
  } catch (err) {
    next(err)
  }
}

export const getAttendanceById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const record = await Attendance.findById(req.params.id)
      .populate('employeeId', 'employeeId designation')

    if (!record) throw new AppError('Attendance record not found', 404)

    res.status(200).json({ success: true, data: record })
  } catch (err) {
    next(err)
  }
}

export const markHoliday = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const schema = z.object({
      date:   z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
      reason: z.string().min(1),
    })

    const { date, reason } = schema.parse(req.body)

    // Get all active employees
    const employees = await Employee.find({ status: 'Active' })
    if (employees.length === 0) throw new AppError('No active employees found', 404)

    // Upsert holiday record for each employee
    const ops = employees.map((emp) => ({
      updateOne: {
        filter: { employeeId: emp._id, date },
        update: {
          $set: {
            employeeId: emp._id,
            date,
            status:     'Holiday' as const,
            checkIn:    undefined,
            checkOut:   undefined,
            totalHours: 0,
            isLate:     false,
            overtime:   0,
          },
        },
        upsert: true,
      },
    }))

    await Attendance.bulkWrite(ops)

    res.status(200).json({
      success: true,
      message: `Holiday marked for ${employees.length} employees on ${date}`,
      reason,
    })
  } catch (err) {
    next(err)
  }
}
