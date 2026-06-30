import { Request, Response, NextFunction } from 'express'
import { Employee } from '../models/Employee.model.js'
import { Attendance } from '../models/Attendance.model.js'
import { Task } from '../models/Task.model.js'
import { Leave } from '../models/Leave.model.js'
import { Department } from '../models/Department.model.js'
import { AppError } from '../middleware/errorHandler.js'

const getToday = (): string => new Date().toISOString().slice(0, 10)

// Total counts + today attendance summary + pending leaves
export const getAdminDashboard = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const today = getToday()

    // Total counts
    const totalEmployees   = await Employee.countDocuments({ status: 'Active' })
    const totalDepartments = await Department.countDocuments()

    // Today attendance
    const todayRecords = await Attendance.find({ date: today })

    const presentToday = todayRecords.filter(r => r.status === 'Present').length
    const absentToday  = todayRecords.filter(r => r.status === 'Absent').length
    const halfDayToday = todayRecords.filter(r => r.status === 'Half Day').length
    const holidayToday = todayRecords.filter(r => r.status === 'Holiday').length
    const lateToday    = todayRecords.filter(r => r.isLate).length

    // Pending leaves
    const pendingLeaves = await Leave.countDocuments({ status: 'Pending' })

    // Recent 5 employees added
    const recentEmployees = await Employee.find()
      .populate('userId', 'name email role')
      .populate('department', 'name')
      .sort({ createdAt: -1 })
      .limit(5)

    res.status(200).json({
      success: true,
      data: {
        totalEmployees,
        totalDepartments,
        pendingLeaves,
        today: {
          date:       today,
          present:    presentToday,
          absent:     absentToday,
          halfDay:    halfDayToday,
          holiday:    holidayToday,
          late:       lateToday,
        },
        recentEmployees,
      },
    })
  } catch (err) {
    next(err)
  }
}

// Team tasks summary + team leave summary
export const getManagerDashboard = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const today = getToday()

    // All active employees
    const employees = await Employee.find({ status: 'Active' })
      .populate('userId', 'name email')
    const employeeIds = employees.map(e => e._id)

    // Today attendance for all employees
    const todayAttendance = await Attendance.find({
      employeeId: { $in: employeeIds },
      date:       today,
    })

    const presentToday = todayAttendance.filter(r => r.status === 'Present').length
    const absentToday  = todayAttendance.filter(r => r.status === 'Absent').length

    // Task summary
    const allTasks = await Task.find({ employeeId: { $in: employeeIds } })

    const taskSummary = {
      total:      allTasks.length,
      pending:    allTasks.filter(t => t.status === 'Pending').length,
      inProgress: allTasks.filter(t => t.status === 'In Progress').length,
      completed:  allTasks.filter(t => t.status === 'Completed').length,
    }

    // Pending leaves
    const pendingLeaves = await Leave.find({
      employeeId: { $in: employeeIds },
      status:     'Pending',
    }).populate('employeeId', 'employeeId designation')

    res.status(200).json({
      success: true,
      data: {
        totalTeamMembers: employees.length,
        today: {
          date:    today,
          present: presentToday,
          absent:  absentToday,
        },
        taskSummary,
        pendingLeaves,
      },
    })
  } catch (err) {
    next(err)
  }
}

// Own today attendance + own task summary + own leave summary
export const getEmployeeDashboard = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const today = getToday()

    const employee = await Employee.findOne({ userId: req.user!.id })
      .populate('userId', 'name email role')
      .populate('department', 'name')
    if (!employee) throw new AppError('Employee profile not found', 404)

    // Today attendance
    const todayAttendance = await Attendance.findOne({
      employeeId: employee._id,
      date:       today,
    })

    // Own task summary
    const myTasks = await Task.find({ employeeId: employee._id })

    const taskSummary = {
      total:      myTasks.length,
      pending:    myTasks.filter(t => t.status === 'Pending').length,
      inProgress: myTasks.filter(t => t.status === 'In Progress').length,
      completed:  myTasks.filter(t => t.status === 'Completed').length,
    }

    // Own leave summary
    const myLeaves = await Leave.find({ employeeId: employee._id })

    const leaveSummary = {
      total:    myLeaves.length,
      pending:  myLeaves.filter(l => l.status === 'Pending').length,
      approved: myLeaves.filter(l => l.status === 'Approved').length,
      rejected: myLeaves.filter(l => l.status === 'Rejected').length,
    }

    res.status(200).json({
      success: true,
      data: {
        employee,
        todayAttendance: todayAttendance ?? null,
        taskSummary,
        leaveSummary,
      },
    })
  } catch (err) {
    next(err)
  }
}
