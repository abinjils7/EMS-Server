import { Router } from 'express'
import {
  createEmployee,
  getAllEmployees,
  getEmployeeById,
  getMyProfile,
  updateEmployee,
  deleteEmployee,
} from '../controllers/employee.controller.js'
import { verifyToken } from '../middleware/verifyToken.js'
import { authorizeRoles } from '../middleware/authorizeRoles.js'

const router = Router()

router.get('/me',   verifyToken, getMyProfile)
router.get('/',     verifyToken, authorizeRoles('Admin', 'Manager'), getAllEmployees)
router.get('/:id',  verifyToken, authorizeRoles('Admin', 'Manager'), getEmployeeById)
router.post('/',    verifyToken, authorizeRoles('Admin'), createEmployee)
router.patch('/:id',verifyToken, authorizeRoles('Admin'), updateEmployee)
router.delete('/:id',verifyToken, authorizeRoles('Admin'), deleteEmployee)

export default router
