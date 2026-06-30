import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import rateLimit from 'express-rate-limit'
import authRoutes from './routes/auth.routes.js'
import departmentRoutes from './routes/department.routes.js'
import employeeRoutes from './routes/employee.routes.js'
import attendanceRoutes from './routes/attendance.routes.js'
import taskRoutes from './routes/task.routes.js'
import leaveRoutes from './routes/leave.routes.js'
import dashboardRoutes from './routes/dashboard.routes.js'
import eventRoutes from './routes/event.routes.js'
import profileRoutes from './routes/profile.routes.js'
import { errorHandler } from './middleware/errorHandler.js'

const app = express()

app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
}))
app.use(helmet())
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many requests, try again later' },
})

app.use('/api/auth', authLimiter, authRoutes)
app.use('/api/departments', departmentRoutes)
app.use('/api/employees', employeeRoutes)
app.use('/api/attendance', attendanceRoutes)
app.use('/api/tasks', taskRoutes)
app.use('/api/leaves', leaveRoutes)
app.use('/api/dashboard', dashboardRoutes)
app.use('/api/events',   eventRoutes)
app.use('/api/profile',  profileRoutes)

app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'Server is running' })
})

app.use(errorHandler)

export default app
