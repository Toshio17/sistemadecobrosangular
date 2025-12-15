import { Request, Response } from 'express'
import { getPool } from '../services/db'
import { sendPaymentNotification } from '../services/notifications.service'

export async function sendMassToMorosos(req: Request, res: Response) {
  const { dias } = req.body as { dias: number }
  const d = Number(dias || 30)
  const [rows] = await getPool().query(
    `SELECT m.id as mensualidadId, m.cliente_id as clienteId, c.nombres, c.apellidos, c.nro_doc, m.monto
     FROM mensualidades m JOIN clientes c ON c.id=m.cliente_id
     WHERE m.estado='vencido' AND DATEDIFF(CURDATE(), m.fecha_vencimiento) >= ?`,
    [d]
  )
  const items = rows as any[]
  const results = [] as any[]
  for (const it of items) {
    try {
      await sendPaymentNotification({ clienteId: it.clienteId, clienteNombre: `${it.nombres} ${it.apellidos}`, nroDoc: it.nro_doc, mensualidadId: it.mensualidadId, monto: it.monto })
      results.push({ mensualidadId: it.mensualidadId, status: 'sent' })
    } catch {
      results.push({ mensualidadId: it.mensualidadId, status: 'failed' })
    }
  }
  res.json({ count: results.length, results })
}

export async function listLogs(_req: Request, res: Response) {
  const [rows] = await getPool().query('SELECT id, type, destinatario, payload, status, created_at FROM notification_logs ORDER BY id DESC LIMIT 200')
  res.json(rows)
}
