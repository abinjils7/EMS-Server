import { Router } from 'express'
import { getMyProfile, updateMyProfile, uploadProfilePicture } from '../controllers/profile.controller.js'
import { verifyToken } from '../middleware/verifyToken.js'
import { upload } from '../middleware/upload.js'

const router = Router()

router.use(verifyToken)                                           // all profile routes are protected

router.get('/me',          getMyProfile)
router.patch('/me',        updateMyProfile)
router.post('/picture',    upload.single('profilePic'), uploadProfilePicture)

export default router
