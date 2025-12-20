import { Router } from 'express'
import { login, register, requestPasswordReset } from '../controllers/auth.controller'

const r = Router()

r.post('/login', login)
r.post('/register', register)
r.post('/forgot-password', requestPasswordReset)

export default r
