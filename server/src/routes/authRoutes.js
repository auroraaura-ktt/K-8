import { Router } from 'express'

import { loginUser, registerUser, resendVerificationCode, verifyUser } from '../controllers/authController.js'

const router = Router()

router.post('/register', registerUser)
router.post('/login', loginUser)
router.post('/verify', verifyUser)
router.post('/verify/resend', resendVerificationCode)

export default router