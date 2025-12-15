import { Router } from 'express'
import { authenticate, authorize } from '../middleware/auth'
import { createOrUpdateClient, listClients, getClient, toggleClient, deleteClient, resolveClient } from '../controllers/clients.controller'

const r = Router()

r.use(authenticate)

r.get('/', authorize(['admin', 'cobrador', 'supervisor']), listClients)
r.get('/:id', authorize(['admin', 'cobrador', 'supervisor']), getClient)
r.post('/', authorize(['admin']), createOrUpdateClient)
r.put('/:id', authorize(['admin']), createOrUpdateClient)
r.patch('/:id/toggle', authorize(['admin']), toggleClient)
r.delete('/:id', authorize(['admin']), deleteClient)
r.post('/resolve', authorize(['admin', 'cobrador', 'supervisor']), resolveClient)

export default r
