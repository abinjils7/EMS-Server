import { Router } from 'express'
import {
  createDepartment,
  getAllDepartments,
  getDepartmentById,
  updateDepartment,
  deleteDepartment,
} from '../controllers/department.controller.js'
import { verifyToken } from '../middleware/verifyToken.js'
import { authorizeRoles } from '../middleware/authorizeRoles.js'

const router = Router()

router.get('/',     verifyToken, getAllDepartments)
router.get('/:id',  verifyToken, getDepartmentById)
router.post('/',    verifyToken, authorizeRoles('Admin'), createDepartment)
router.patch('/:id',verifyToken, authorizeRoles('Admin'), updateDepartment)
router.delete('/:id',verifyToken, authorizeRoles('Admin'), deleteDepartment)

export default router
