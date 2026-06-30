import mongoose, { Schema, Document, Types } from 'mongoose'

export interface IEventDocument extends Document {
  title:       string
  description: string
  date:        string
  createdBy:   Types.ObjectId
  createdAt:   Date
  updatedAt:   Date
}

const EventSchema = new Schema<IEventDocument>(
  {
    title:       { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    date:        { type: String, required: true },
    createdBy:   { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
)

export const Event = mongoose.model<IEventDocument>('Event', EventSchema)
