import { Router } from 'express'
import { authenticate, authorize } from '../middleware/auth'
import { sendMassToMorosos, listLogs } from '../controllers/notifications.controller'

const r = Router()

r.use(authenticate)

r.post('/morosos/mass', authorize(['admin', 'supervisor']), sendMassToMorosos)
r.get('/logs', authorize(['admin', 'supervisor']), listLogs)

export default r
