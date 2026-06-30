import { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { Event } from '../models/Event.model.js'
import { AppError } from '../middleware/errorHandler.js'

// Admin creates an event
export const createEvent = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const schema = z.object({
      title:       z.string().min(1),
      description: z.string().optional(),
      date:        z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD'),
    })

    const body = schema.parse(req.body)

    const event = await Event.create({
      title:       body.title,
      description: body.description ?? '',
      date:        body.date,
      createdBy:   req.user!.id,
    })

    res.status(201).json({ success: true, data: event })
  } catch (err) {
    next(err)
  }
}

// All roles can view events
export const getAllEvents = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const events = await Event.find()
      .populate('createdBy', 'name email')
      .sort({ date: 1 })

    res.status(200).json({
      success: true,
      count:   events.length,
      data:    events,
    })
  } catch (err) {
    next(err)
  }
}

// All roles can view single event
export const getEventById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('createdBy', 'name email')

    if (!event) throw new AppError('Event not found', 404)

    res.status(200).json({ success: true, data: event })
  } catch (err) {
    next(err)
  }
}

// Admin updates an event
export const updateEvent = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const schema = z.object({
      title:       z.string().min(1).optional(),
      description: z.string().optional(),
      date:        z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD').optional(),
    })

    const body = schema.parse(req.body)

    const event = await Event.findByIdAndUpdate(
      req.params.id,
      body,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email')

    if (!event) throw new AppError('Event not found', 404)

    res.status(200).json({ success: true, data: event })
  } catch (err) {
    next(err)
  }
}

// Admin deletes an event
export const deleteEvent = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id)
    if (!event) throw new AppError('Event not found', 404)

    res.status(200).json({ success: true, message: 'Event deleted' })
  } catch (err) {
    next(err)
  }
}
