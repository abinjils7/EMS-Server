import mongoose, { Schema, Document, Types } from 'mongoose'

export interface ILeaveDocument extends Document {
  employeeId:  Types.ObjectId
  type:        'Annual' | 'Sick' | 'Casual' | 'Unpaid'
  startDate:   string
  endDate:     string
  totalDays:   number
  reason:      string
  status:      'Pending' | 'Approved' | 'Rejected'
  rejectedReason: string
  approvedBy:  string
  createdAt:   Date
  updatedAt:   Date
}

const LeaveSchema = new Schema<ILeaveDocument>(
  {
    employeeId:     { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
    type:           {
      type:    String,
      enum:    ['Annual', 'Sick', 'Casual', 'Unpaid'],
      default: 'Annual',
    },
    startDate:      { type: String, required: true },
    endDate:        { type: String, required: true },
    totalDays:      { type: Number, default: 1 },
    reason:         { type: String, required: true },
    status:         {
      type:    String,
      enum:    ['Pending', 'Approved', 'Rejected'],
      default: 'Pending',
    },
    rejectedReason: { type: String, default: '' },
    approvedBy:     { type: String, default: '' },
  },
  { timestamps: true }
)

export const Leave = mongoose.model<ILeaveDocument>('Leave', LeaveSchema)
