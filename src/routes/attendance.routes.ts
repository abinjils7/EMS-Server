import { Router } from 'express'
import {
  checkIn,
  checkOut,
  getMyAttendance,
  getAllAttendance,
  getAttendanceById,
  getMonthlyAttendance,
  markHoliday,
} from '../controllers/attendance.controller.js'
import { verifyToken } from '../middleware/verifyToken.js'
import { authorizeRoles } from '../middleware/authorizeRoles.js'

const router = Router()

// Employee routes
router.post('/checkin',    verifyToken, checkIn)
router.patch('/checkout',  verifyToken, checkOut)
router.get('/me',          verifyToken, getMyAttendance)
router.get('/me/monthly',  verifyToken, getMonthlyAttendance)

// Admin + Manager routes
router.get('/',     verifyToken, authorizeRoles('Admin', 'Manager'), getAllAttendance)
router.get('/:id',  verifyToken, authorizeRoles('Admin', 'Manager'), getAttendanceById)

// Admin only
router.post('/holiday', verifyToken, authorizeRoles('Admin'), markHoliday)

export default router
