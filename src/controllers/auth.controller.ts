import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { z } from 'zod'
import { User } from '../models/User.model.js'
import { Employee } from '../models/Employee.model.js'
import { Department } from '../models/Department.model.js'
import { sendEmail } from '../utils/sendEmail.js'
import { AppError } from '../middleware/errorHandler.js'
import { RefreshTokenPayload } from '../types/index.js'

const generateAccessToken = (id: string, role: string): string =>
  jwt.sign({ id, role }, process.env.JWT_SECRET as string, {
    expiresIn: process.env.JWT_EXPIRES_IN as any,
  })

const generateRefreshToken = (id: string): string =>
  jwt.sign({ id }, process.env.JWT_REFRESH_SECRET as string, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN as any,
  })

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
}

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const schema = z.object({
      name: z.string().min(2),
      email: z.string().email(),
      password: z.string().min(6),
      role: z.enum(['Admin', 'Manager', 'Employee']).optional(),
    })

    const body = schema.parse(req.body)

    console.log(body)

    const exists = await User.findOne({ email: body.email })
    if (exists) throw new AppError('Email already exists', 400)

    const user = await User.create(body)

    // Automatically create a default Employee profile for the registered user
    let defaultDept = await Department.findOne()
    if (!defaultDept) {
      defaultDept = await Department.create({
        name: 'General',
        description: 'Default department for new registrants.',
      })
    }

    const employeeCount = await Employee.countDocuments()
    const employeeId = `EMP-${String(employeeCount + 1).padStart(3, '0')}`

    await Employee.create({
      userId: user._id,
      employeeId,
      phone: '',
      department: defaultDept._id,
      designation: user.role === 'Admin' ? 'Administrator' : user.role === 'Manager' ? 'Manager' : 'Staff Associate',
      joiningDate: new Date(),
      salary: 0,
      status: 'Active',
    })

    const accessToken = generateAccessToken(String(user._id), user.role)

    res.status(201).json({
      success: true,
      accessToken,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })
  } catch (err) {
    console.error('REGISTER ERROR:', err)
    next(err)
  }
}

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const schema = z.object({
      email: z.string().email(),
      password: z.string(),
    })

    const body = schema.parse(req.body)

    const user = await User.findOne({ email: body.email }).select('+password')
    if (!user || !user.isActive) throw new AppError('Invalid credentials', 401)

    const match = await user.comparePassword(body.password)
    if (!match) throw new AppError('Invalid credentials', 401)

    const accessToken = generateAccessToken(String(user._id), user.role)
    const refreshToken = generateRefreshToken(String(user._id))

    res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS)

    res.status(200).json({
      success: true,
      accessToken,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })
  } catch (err) {
    next(err)
  }
}

export const logout = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    res.clearCookie('refreshToken', { httpOnly: true, sameSite: 'strict' })
    res.status(200).json({ success: true, message: 'Logged out' })
  } catch (err) {
    next(err)
  }
}

export const refresh = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.cookies.refreshToken as string | undefined
    if (!token) throw new AppError('No refresh token', 401)

    const decoded = jwt.verify(
      token,
      process.env.JWT_REFRESH_SECRET as string
    ) as RefreshTokenPayload

    const user = await User.findById(decoded.id)
    if (!user || !user.isActive) throw new AppError('User not found', 401)

    const accessToken = generateAccessToken(String(user._id), user.role)

    res.status(200).json({ success: true, accessToken })
  } catch (err) {
    next(err)
  }
}

export const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const schema = z.object({ email: z.string().email() })
    const { email } = schema.parse(req.body)

    const user = await User.findOne({ email })

    if (user) {
      const rawToken = crypto.randomBytes(32).toString('hex')
      const hash = crypto.createHash('sha256').update(rawToken).digest('hex')

      user.resetPasswordToken = hash
      user.resetPasswordExpire = new Date(Date.now() + 10 * 60 * 1000)
      await user.save({ validateBeforeSave: false })

      const resetUrl = `${process.env.CLIENT_URL}/reset-password/${rawToken}`

      await sendEmail({
        to: user.email,
        subject: 'Password Reset Request',
        html: `
          <p>You requested a password reset.</p>
          <p><a href="${resetUrl}">Click here to reset your password</a></p>
          <p>This link expires in 10 minutes.</p>
          <p>If you did not request this, ignore this email.</p>
        `,
      })
    }

    res.status(200).json({
      success: true,
      message: 'If that email exists, a reset link was sent',
    })
  } catch (err) {
    next(err)
  }
}

export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const hash = crypto
      .createHash('sha256')
      .update(req.params.token as string)
      .digest('hex')

    const user = await User.findOne({
      resetPasswordToken: hash,
      resetPasswordExpire: { $gt: Date.now() },
    }).select('+resetPasswordToken +resetPasswordExpire')

    if (!user) throw new AppError('Token invalid or expired', 400)

    const schema = z.object({ password: z.string().min(6) })
    const { password } = schema.parse(req.body)

    user.password = password
    user.resetPasswordToken = undefined
    user.resetPasswordExpire = undefined
    await user.save()

    res.status(200).json({ success: true, message: 'Password updated successfully' })
  } catch (err) {
    next(err)
  }
}

export const changePassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const schema = z.object({
      oldPassword: z.string(),
      newPassword: z.string().min(6),
    })

    const { oldPassword, newPassword } = schema.parse(req.body)

    const user = await User.findById(req.user!.id).select('+password')
    if (!user) throw new AppError('User not found', 404)

    const match = await user.comparePassword(oldPassword)
    if (!match) throw new AppError('Old password is incorrect', 400)

    user.password = newPassword
    await user.save()

    res.status(200).json({ success: true, message: 'Password changed successfully' })
  } catch (err) {
    next(err)
  }
}
