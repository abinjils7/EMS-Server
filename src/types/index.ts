import { Types } from 'mongoose'

export type UserRole = 'Admin' | 'Manager' | 'Employee'

export interface IUser {
  _id: Types.ObjectId
  name: string
  email: string
  password: string
  role: UserRole
  isActive: boolean
  resetPasswordToken?: string
  resetPasswordExpire?: Date
  createdAt: Date
  updatedAt: Date
  comparePassword(candidate: string): Promise<boolean>
}

export interface AuthTokenPayload {
  id: string
  role: UserRole
}

export interface RefreshTokenPayload {
  id: string
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthTokenPayload
    }
  }
}

export interface SendEmailOptions {
  to: string
  subject: string
  html: string
}

export interface IDepartment {
  _id: Types.ObjectId
  name: string
  description: string
  createdAt: Date
  updatedAt: Date
}

export interface IEmployee {
  _id:         Types.ObjectId
  userId:      Types.ObjectId
  employeeId:  string
  phone:       string
  department:  Types.ObjectId
  designation: string
  joiningDate: Date
  salary:      number
  profilePic:  string
  status:      'Active' | 'Inactive'
  createdAt:   Date
  updatedAt:   Date
}

export interface IAttendance {
  _id:         Types.ObjectId
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

export interface ITask {
  _id:            Types.ObjectId
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

export interface ILeave {
  _id:            Types.ObjectId
  employeeId:     Types.ObjectId
  type:           'Annual' | 'Sick' | 'Casual' | 'Unpaid'
  startDate:      string
  endDate:        string
  totalDays:      number
  reason:         string
  status:         'Pending' | 'Approved' | 'Rejected'
  rejectedReason: string
  approvedBy:     string
  createdAt:      Date
  updatedAt:      Date
}

export interface IEvent {
  _id:         Types.ObjectId
  title:       string
  description: string
  date:        string
  createdBy:   Types.ObjectId
  createdAt:   Date
  updatedAt:   Date
}
