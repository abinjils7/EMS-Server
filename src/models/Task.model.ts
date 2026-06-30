import mongoose, { Schema, Document, Types } from 'mongoose'

export interface ITaskDocument extends Document {
  employeeId:     Types.ObjectId
  date:           string
  title:          string
  description:    string
  hoursWorked:    number
  status:         'Pending' | 'In Progress' | 'Completed'
  managerComment: string
  createdAt:      Date
  updatedAt:      Date
}

const TaskSchema = new Schema<ITaskDocument>(
  {
    employeeId:     { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
    date:           { type: String, required: true },
    title:          { type: String, required: true, trim: true },
    description:    { type: String, default: '' },
    hoursWorked:    { type: Number, default: 0 },
    status:         {
      type:    String,
      enum:    ['Pending', 'In Progress', 'Completed'],
      default: 'Pending',
    },
    managerComment: { type: String, default: '' },
  },
  { timestamps: true }
)

export const Task = mongoose.model<ITaskDocument>('Task', TaskSchema)
