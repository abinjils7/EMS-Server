import { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import streamifier from 'streamifier'
import { User } from '../models/User.model.js'
import { Employee } from '../models/Employee.model.js'
import { cloudinary } from '../utils/cloudinary.js'
import { AppError } from '../middleware/errorHandler.js'

// Helper: upload a buffer to Cloudinary via upload_stream
const uploadToCloudinary = (
  buffer: Buffer,
  folder: string
): Promise<string> =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, transformation: [{ width: 400, height: 400, crop: 'fill', gravity: 'face' }] },
      (error, result) => {
        if (error || !result) return reject(error ?? new Error('Cloudinary upload failed'))
        resolve(result.secure_url)
      }
    )
    streamifier.createReadStream(buffer).pipe(stream)
  })

// GET /api/profile/me
export const getMyProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const employee = await Employee.findOne({ userId: req.user!.id })
      .populate('userId', 'name email role profilePic isActive')
      .populate('department', 'name')

    if (!employee) throw new AppError('Employee profile not found', 404)

    res.status(200).json({ success: true, data: employee })
  } catch (err) {
    next(err)
  }
}

// PATCH /api/profile/me  — update name or phone
export const updateMyProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const schema = z.object({
      name:  z.string().min(2).optional(),
      phone: z.string().optional(),
    })

    const body = schema.parse(req.body)

    // Update User name if provided
    if (body.name) {
      await User.findByIdAndUpdate(req.user!.id, { name: body.name })
    }

    // Update Employee phone if provided
    if (body.phone !== undefined) {
      await Employee.findOneAndUpdate({ userId: req.user!.id }, { phone: body.phone })
    }

    const employee = await Employee.findOne({ userId: req.user!.id })
      .populate('userId', 'name email role profilePic isActive')
      .populate('department', 'name')

    res.status(200).json({ success: true, data: employee })
  } catch (err) {
    next(err)
  }
}

// POST /api/profile/picture  — upload / replace profile picture
export const uploadProfilePicture = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.file) throw new AppError('No file uploaded', 400)

    const url = await uploadToCloudinary(
      req.file.buffer,
      'ems/profile-pictures'
    )

    // Save URL to User document
    await User.findByIdAndUpdate(req.user!.id, { profilePic: url })

    res.status(200).json({ success: true, profilePic: url })
  } catch (err) {
    next(err)
  }
}
