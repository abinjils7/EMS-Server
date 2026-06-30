import mongoose, { Schema, Document } from 'mongoose'
import bcrypt from 'bcryptjs'
import { UserRole } from '../types/index.js'

export interface IUserDocument extends Document {
  name:                string
  email:               string
  password:            string
  role:                UserRole
  isActive:            boolean
  profilePic:          string
  resetPasswordToken?: string
  resetPasswordExpire?: Date
  createdAt:           Date
  updatedAt:           Date
  comparePassword(candidate: string): Promise<boolean>
}

const UserSchema = new Schema<IUserDocument>(
  {
    profilePic: { type: String, default: '' },
    name:     { type: String, required: true, trim: true },
    email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    role:     {
      type:    String,
      enum:    ['Admin', 'Manager', 'Employee'] satisfies UserRole[],
      default: 'Employee',
    },
    isActive:            { type: Boolean, default: true },
    resetPasswordToken:  { type: String,  select: false },
    resetPasswordExpire: { type: Date,    select: false },
  },
  { timestamps: true }
)

UserSchema.pre('save', async function (this: IUserDocument) {
  if (!this.isModified('password')) return
  this.password = await bcrypt.hash(this.password, 10)
})

UserSchema.methods.comparePassword = async function (
  candidate: string
): Promise<boolean> {
  return bcrypt.compare(candidate, this.password)
}

export const User = mongoose.model<IUserDocument>('User', UserSchema)
