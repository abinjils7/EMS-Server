import { Router } from 'express'
import {
  applyLeave,
  getMyLeaves,
  getAllLeaves,
  getLeaveById,
  approveLeave,
  rejectLeave,
  cancelLeave,
} from '../controllers/leave.controller.js'
import { verifyToken } from '../middleware/verifyToken.js'
import { authorizeRoles } from '../middleware/authorizeRoles.js'

const router = Router()

router.post('/',              verifyToken, applyLeave)
router.get('/me',             verifyToken, getMyLeaves)
router.get('/',               verifyToken, authorizeRoles('Admin', 'Manager'), getAllLeaves)
router.get('/:id',            verifyToken, authorizeRoles('Admin', 'Manager'), getLeaveById)
router.patch('/:id/approve',  verifyToken, authorizeRoles('Admin', 'Manager'), approveLeave)
router.patch('/:id/reject',   verifyToken, authorizeRoles('Admin', 'Manager'), rejectLeave)
router.patch('/:id/cancel',   verifyToken, cancelLeave)

export default router
