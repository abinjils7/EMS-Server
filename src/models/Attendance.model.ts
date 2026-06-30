import mongoose, { Schema, Document, Types } from 'mongoose'

export interface IAttendanceDocument extends Document {
  employeeId:  Types.ObjectId
  date:        string
  checkIn:     Date
  checkOut?:   Date
  totalHours:  number
  isLate:      boolean
  overtime:    number
  status:      'Present' | 'Absent' | 'Half Day' | 'Leave' | 'Holiday'
  createdAt:   Date
  updatedAt:   Date
}

const AttendanceSchema = new Schema<IAttendanceDocument>(
  {
    employeeId:  { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
    date:        { type: String, required: true },
    checkIn:     { type: Date },
    checkOut:    { type: Date },
    totalHours:  { type: Number, default: 0 },
    isLate:      { type: Boolean, default: false },
    overtime:    { type: Number, default: 0 },
    status:      {
      type:    String,
      enum:    ['Present', 'Absent', 'Half Day', 'Leave', 'Holiday'],
      default: 'Absent',
    },
  },
  { timestamps: true }
)

// Compound index: one record per employee per day
AttendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true })

export const Attendance = mongoose.model<IAttendanceDocument>('Attendance', AttendanceSchema)
