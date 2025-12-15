import express from 'express'
import cors from 'cors'
import authRouter from './routes/auth.routes'
import clientsRouter from './routes/clients.routes'
import paymentsRouter from './routes/payments.routes'
import paymentsMetricsRouter from './routes/payments.metrics.routes'
import notificationsRouter from './routes/notifications.routes'
import plansRouter from './routes/plans.routes'

export const app = express()

app.use(cors())
app.use(express.json())

app.use('/auth', authRouter)
app.use('/clients', clientsRouter)
app.use('/payments', paymentsRouter)
app.use('/payments', paymentsMetricsRouter)
app.use('/notifications', notificationsRouter)
app.use('/plans', plansRouter)

app.get('/health', (_req, res) => {
  res.json({ ok: true })
})
