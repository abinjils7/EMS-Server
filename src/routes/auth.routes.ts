import { Router } from 'express'
import {
  register,
  login,
  logout,
  refresh,
  forgotPassword,
  resetPassword,
  changePassword,
} from '../controllers/auth.controller.js'
import { verifyToken } from '../middleware/verifyToken.js'

const router = Router()

router.post('/register',               register)
router.post('/login',                  login)
router.post('/logout',                 logout)
router.post('/refresh',                refresh)
router.post('/forgot-password',        forgotPassword)
router.post('/reset-password/:token',  resetPassword)
router.patch('/change-password',       verifyToken, changePassword)

export default router
