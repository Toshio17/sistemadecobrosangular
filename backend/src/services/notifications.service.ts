import axios from 'axios'
import { getPool } from './db'

type PaymentPayload = {
  clienteId: number
  clienteNombre: string
  nroDoc: string
  mensualidadId: number
  monto: number
}

async function postWasapi(path: string, body: any) {
  const url = `${process.env.WASAPI_URL}${path}`
  const r = await axios.post(url, body, { headers: { Authorization: `Bearer ${process.env.WASAPI_TOKEN}` } })
  return r.data
}

export async function sendPaymentNotification(p: PaymentPayload) {
  const payload = { type: 'payment', clienteId: p.clienteId, mensualidadId: p.mensualidadId, monto: p.monto, nombre: p.clienteNombre, nroDoc: p.nroDoc }
  let attempt = 0
  let lastErr: any = null
  while (attempt < 3) {
    try {
      await postWasapi('/whatsapp/send', payload)
      await getPool().query('INSERT INTO notification_logs(type, destinatario, payload, status) VALUES (?,?,?,?)', ['payment', p.clienteNombre, JSON.stringify(payload), 'sent'])
      return true
    } catch (err) {
      lastErr = err
      await getPool().query('INSERT INTO notification_logs(type, destinatario, payload, status) VALUES (?,?,?,?)', ['payment', p.clienteNombre, JSON.stringify(payload), 'failed'])
      await new Promise(r => setTimeout(r, 1000 * (attempt + 1)))
      attempt++
    }
  }
  throw lastErr
}
