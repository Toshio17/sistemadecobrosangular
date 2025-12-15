import { Router } from 'express'
import { authenticate, authorize } from '../middleware/auth'
import { listPlans, getPlan, createOrUpdatePlan, togglePlan, deletePlan } from '../controllers/plans.controller'

const r = Router()

r.use(authenticate)

r.get('/', authorize(['admin','supervisor','cobrador']), listPlans)
r.get('/:id', authorize(['admin','supervisor','cobrador']), getPlan)
r.post('/', authorize(['admin']), createOrUpdatePlan)
r.put('/:id', authorize(['admin']), createOrUpdatePlan)
r.patch('/:id/toggle', authorize(['admin']), togglePlan)
r.delete('/:id', authorize(['admin']), deletePlan)

export default r
