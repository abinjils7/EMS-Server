import { Router } from 'express'
import {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
} from '../controllers/event.controller.js'
import { verifyToken } from '../middleware/verifyToken.js'
import { authorizeRoles } from '../middleware/authorizeRoles.js'

const router = Router()

router.get('/',      verifyToken, getAllEvents)
router.get('/:id',   verifyToken, getEventById)
router.post('/',     verifyToken, authorizeRoles('Admin'), createEvent)
router.patch('/:id', verifyToken, authorizeRoles('Admin'), updateEvent)
router.delete('/:id',verifyToken, authorizeRoles('Admin'), deleteEvent)

export default router
