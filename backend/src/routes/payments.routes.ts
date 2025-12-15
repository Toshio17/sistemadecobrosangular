import { Router } from 'express'
import { authenticate, authorize } from '../middleware/auth'
import { createMensualidad, markPago, listMensualidades, exportCsv, markVencidos, createPagoDirecto } from '../controllers/payments.controller'

const r = Router()

r.use(authenticate)

r.get('/', authorize(['admin', 'cobrador', 'supervisor']), listMensualidades)
r.post('/', authorize(['admin']), createMensualidad)
r.post('/:id/pagar', authorize(['admin', 'cobrador']), markPago)
r.post('/pago-directo', authorize(['admin', 'cobrador']), createPagoDirecto)
r.get('/export.csv', authorize(['admin','supervisor']), exportCsv)
r.post('/mark-vencidos', authorize(['admin','supervisor']), markVencidos)

export default r
