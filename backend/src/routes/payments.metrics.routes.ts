import { Router } from 'express'
import { authenticate, authorize } from '../middleware/auth'
import { metrics } from '../controllers/metrics.controller'

const r = Router()

r.use(authenticate)

r.get('/metrics', authorize(['admin','cobrador','supervisor']), metrics)

export default r
