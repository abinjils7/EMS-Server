import mongoose, { Schema, Document } from 'mongoose'

export interface IDepartmentDocument extends Document {
  name: string
  description: string
  createdAt: Date
  updatedAt: Date
}

const DepartmentSchema = new Schema<IDepartmentDocument>(
  {
    name:        { type: String, required: true, unique: true, trim: true },
    description: { type: String, default: '' },
  },
  { timestamps: true }
)

export const Department = mongoose.model<IDepartmentDocument>('Department', DepartmentSchema)
