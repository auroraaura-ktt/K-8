import { Router } from 'express'

import { loginUser, registerUser, resendVerificationCode, verifyUser } from '../controllers/authController.js'

const router = Router()

router.get('/', (req, res) => {
  res.json({
    message: 'MiitVerse Auth routes',
    routes: ['/api/auth/register', '/api/auth/login', '/api/auth/verify', '/api/auth/verify/resend'],
  })
})

router.post('/register', registerUser)
router.post('/login', loginUser)
router.post('/verify', verifyUser)
router.post('/verify/resend', resendVerificationCode)

export default router