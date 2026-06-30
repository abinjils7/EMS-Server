import mongoose, { Schema, Document, Types } from 'mongoose'

export interface IEmployeeDocument extends Document {
  userId:       Types.ObjectId
  employeeId:   string
  phone:        string
  department:   Types.ObjectId
  designation:  string
  joiningDate:  Date
  salary:       number
  profilePic:   string
  status:       'Active' | 'Inactive'
  createdAt:    Date
  updatedAt:    Date
}

const EmployeeSchema = new Schema<IEmployeeDocument>(
  {
    userId:      { type: Schema.Types.ObjectId, ref: 'User', required: true },
    employeeId:  { type: String, required: true, unique: true },
    phone:       { type: String, default: '' },
    department:  { type: Schema.Types.ObjectId, ref: 'Department', required: true },
    designation: { type: String, required: true },
    joiningDate: { type: Date, required: true },
    salary:      { type: Number, default: 0 },
    profilePic:  { type: String, default: '' },
    status:      { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  },
  { timestamps: true }
)

export const Employee = mongoose.model<IEmployeeDocument>('Employee', EmployeeSchema)
