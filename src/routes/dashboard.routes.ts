import { Router } from 'express'
import {
  getAdminDashboard,
  getManagerDashboard,
  getEmployeeDashboard,
} from '../controllers/dashboard.controller.js'
import { verifyToken } from '../middleware/verifyToken.js'
import { authorizeRoles } from '../middleware/authorizeRoles.js'

const router = Router()

router.get('/admin',    verifyToken, authorizeRoles('Admin'), getAdminDashboard)
router.get('/manager',  verifyToken, authorizeRoles('Admin', 'Manager'), getManagerDashboard)
router.get('/employee', verifyToken, getEmployeeDashboard)

export default router
