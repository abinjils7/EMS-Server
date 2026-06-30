import { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { Employee } from '../models/Employee.model.js'
import { User } from '../models/User.model.js'
import { Department } from '../models/Department.model.js'
import { AppError } from '../middleware/errorHandler.js'

export const createEmployee = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const schema = z.object({
      name:        z.string().min(2),
      email:       z.string().email(),
      password:    z.string().min(6),
      role:        z.enum(['Manager', 'Employee']).optional(),
      phone:       z.string().optional(),
      department:  z.string().min(1),
      designation: z.string().min(1),
      joiningDate: z.string(),
      salary:      z.coerce.number().optional(),
    })

    const body = schema.parse(req.body)

    const userExists = await User.findOne({ email: body.email })
    if (userExists) {
      throw new AppError('Email already exists', 400)
    }

    const deptExists = await Department.findById(body.department)
    if (!deptExists) {
      throw new AppError('Department not found', 404)
    }

    const count = await Employee.countDocuments()
    const employeeId = `EMP-${String(count + 1).padStart(3, '0')}`

    const user = await User.create({
      name:     body.name,
      email:    body.email,
      password: body.password,
      role:     body.role ?? 'Employee',
    })

    const employee = await Employee.create({
      userId:      user._id,
      employeeId,
      phone:       body.phone ?? '',
      department:  body.department,
      designation: body.designation,
      joiningDate: new Date(body.joiningDate),
      salary:      body.salary ?? 0,
    })

    const populatedEmployee = await Employee.findById(employee._id)
      .populate('userId', 'name email role')
      .populate('department', 'name')

    res.status(201).json({
      success: true,
      data: {
        employee: populatedEmployee,
      },
    })
  } catch (err) {
    next(err)
  }
}

export const getAllEmployees = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const employees = await Employee.find()
      .populate('userId', 'name email role')
      .populate('department', 'name')
      .sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      count: employees.length,
      data: employees,
    })
  } catch (err) {
    next(err)
  }
}

export const getEmployeeById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const employee = await Employee.findById(req.params.id)
      .populate('userId', 'name email role')
      .populate('department', 'name')

    if (!employee) {
      throw new AppError('Employee not found', 404)
    }

    res.status(200).json({
      success: true,
      data: employee,
    })
  } catch (err) {
    next(err)
  }
}

export const getMyProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user || !req.user.id) {
      throw new AppError('Access denied', 403)
    }

    const employee = await Employee.findOne({ userId: req.user.id })
      .populate('userId', 'name email role profilePic')
      .populate('department', 'name')

    if (!employee) {
      throw new AppError('Employee profile not found', 404)
    }

    res.status(200).json({
      success: true,
      data: employee,
    })
  } catch (err) {
    next(err)
  }
}

export const updateEmployee = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const schema = z.object({
      phone:       z.string().optional(),
      department:  z.string().optional(),
      designation: z.string().optional(),
      joiningDate: z.string().optional(),
      salary:      z.coerce.number().optional(),
      status:      z.enum(['Active', 'Inactive']).optional(),
    })

    const body = schema.parse(req.body)

    if (body.department) {
      const deptExists = await Department.findById(body.department)
      if (!deptExists) {
        throw new AppError('Department not found', 404)
      }
    }

    const updateData: any = { ...body }
    if (body.joiningDate) {
      updateData.joiningDate = new Date(body.joiningDate)
    }

    const updated = await Employee.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate('userId', 'name email role')
      .populate('department', 'name')

    if (!updated) {
      throw new AppError('Employee not found', 404)
    }

    res.status(200).json({
      success: true,
      data: updated,
    })
  } catch (err) {
    next(err)
  }
}

export const deleteEmployee = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const employee = await Employee.findById(req.params.id)
    if (!employee) {
      throw new AppError('Employee not found', 404)
    }

    await User.findByIdAndDelete(employee.userId)
    await Employee.findByIdAndDelete(req.params.id)

    res.status(200).json({
      success: true,
      message: 'Employee deleted',
    })
  } catch (err) {
    next(err)
  }
}
