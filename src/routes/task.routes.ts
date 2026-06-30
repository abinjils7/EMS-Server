import { Router } from 'express'
import {
  createTask,
  getMyTasks,
  getAllTasks,
  getTaskById,
  updateTask,
  addManagerComment,
  deleteTask,
} from '../controllers/task.controller.js'
import { verifyToken } from '../middleware/verifyToken.js'
import { authorizeRoles } from '../middleware/authorizeRoles.js'

const router = Router()

router.post('/',       verifyToken, createTask)
router.get('/me',      verifyToken, getMyTasks)
router.get('/',        verifyToken, authorizeRoles('Admin', 'Manager'), getAllTasks)
router.get('/:id',     verifyToken, authorizeRoles('Admin', 'Manager'), getTaskById)
router.patch('/:id',   verifyToken, updateTask)
router.patch('/:id/comment', verifyToken, authorizeRoles('Admin', 'Manager'), addManagerComment)
router.delete('/:id',  verifyToken, deleteTask)

export default router
