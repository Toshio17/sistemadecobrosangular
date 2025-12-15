import { Request, Response } from 'express'
import { getPool } from '../services/db'
import { sendPaymentNotification } from '../services/notifications.service'

export async function listMensualidades(req: Request, res: Response) {
  const { cliente_id } = req.query as any
  const where = cliente_id ? 'WHERE m.cliente_id=?' : ''
  const params = cliente_id ? [Number(cliente_id)] : []
  const [rows] = await getPool().query(
    `SELECT m.id, m.cliente_id, c.tipo_doc, c.nombres, c.apellidos, c.razon_social, m.monto, m.recargo, m.descuento, m.fecha_vencimiento, m.estado, m.fecha_pago, m.monto_pagado, m.metodo_pago
     FROM mensualidades m JOIN clientes c ON c.id=m.cliente_id ${where} ORDER BY m.id DESC`,
    params
  )
  res.json(rows)
}

export async function createMensualidad(req: Request, res: Response) {
  const { cliente_id, monto, fecha_vencimiento, recargo = 0, descuento = 0 } = req.body as { cliente_id: number; monto: number; fecha_vencimiento: string; recargo?: number; descuento?: number }
  if (!cliente_id || !monto || !fecha_vencimiento) return res.status(400).json({ error: 'invalid_input' })
  const [r] = await getPool().query(
    'INSERT INTO mensualidades(cliente_id, monto, recargo, descuento, fecha_vencimiento, estado) VALUES (?,?,?,?,?,?)',
    [cliente_id, monto, recargo, descuento, fecha_vencimiento, 'pendiente']
  )
  const id = (r as any).insertId
  res.status(201).json({ id })
}

export async function markPago(req: Request, res: Response) {
  const id = Number(req.params.id)
  const { monto_pagado, fecha_pago, metodo_pago } = req.body as { monto_pagado: number; fecha_pago: string; metodo_pago?: 'yape'|'plin'|'tarjeta'|'transferencia'|'efectivo' }
  const [rows] = await getPool().query('SELECT m.*, c.nro_doc, c.nombres, c.apellidos FROM mensualidades m JOIN clientes c ON c.id=m.cliente_id WHERE m.id=?', [id])
  const m = (rows as any[])[0]
  if (!m) return res.status(404).json({ error: 'not_found' })
  await getPool().query('UPDATE mensualidades SET estado=?, fecha_pago=?, monto_pagado=?, metodo_pago=? WHERE id=?', ['pagado', fecha_pago, monto_pagado, metodo_pago || null, id])
  const nombre = (m.nombres && m.apellidos) ? `${m.nombres} ${m.apellidos}` : (m.razon_social || '')
  await sendPaymentNotification({ clienteId: m.cliente_id, clienteNombre: nombre, nroDoc: m.nro_doc, mensualidadId: id, monto: monto_pagado })
  res.json({ id })
}

export async function createPagoDirecto(req: Request, res: Response) {
  const { cliente_id, monto_pagado, fecha_pago, metodo_pago } = req.body as { cliente_id: number; monto_pagado: number; fecha_pago: string; metodo_pago: 'yape'|'plin'|'tarjeta'|'transferencia'|'efectivo' }
  if (!cliente_id || !monto_pagado || !fecha_pago || !metodo_pago) return res.status(400).json({ error: 'invalid_input' })
  const [r] = await getPool().query(
    'INSERT INTO mensualidades(cliente_id, monto, recargo, descuento, fecha_vencimiento, estado, fecha_pago, monto_pagado, metodo_pago) VALUES (?,?,?,?,?,?,?,?,?)',
    [cliente_id, monto_pagado, 0, 0, fecha_pago, 'pagado', fecha_pago, monto_pagado, metodo_pago]
  )
  const id = (r as any).insertId
  const [rows] = await getPool().query('SELECT c.nro_doc, c.nombres, c.apellidos, c.razon_social FROM clientes c WHERE c.id=?', [cliente_id])
  const c = (rows as any[])[0]
  if (c) {
    const nombre = (c.nombres && c.apellidos) ? `${c.nombres} ${c.apellidos}` : (c.razon_social || '')
    await sendPaymentNotification({ clienteId: cliente_id, clienteNombre: nombre, nroDoc: c.nro_doc, mensualidadId: id, monto: monto_pagado })
  }
  res.status(201).json({ id })
}

export async function exportCsv(_req: Request, res: Response) {
  const [rows] = await getPool().query(
    `SELECT m.id, m.cliente_id, c.tipo_doc, c.nro_doc, c.nombres, c.apellidos, c.razon_social, m.monto, m.recargo, m.descuento, m.fecha_vencimiento, m.estado, m.fecha_pago, m.monto_pagado, m.metodo_pago
     FROM mensualidades m JOIN clientes c ON c.id=m.cliente_id ORDER BY m.id DESC`
  )
  const items = rows as any[]
  function fmtDate(d: any) {
    if (!d) return ''
    const date = d instanceof Date ? d : new Date(d)
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
  }
  function esc(v: any) {
    const s = String(v ?? '')
    return `"${s.replace(/"/g, '""')}"`
  }
  const sep = ';'
  const header = ['ID','Cliente ID','Tipo Doc','Nro Doc','Nombre/Razón','Monto','Recargo','Descuento','Vencimiento','Estado','Fecha Pago','Monto Pagado','Método']
  const lines = [header.join(sep)]
  for (const it of items) {
    const nombre = it.tipo_doc === 'DNI'
      ? `${it.nombres || ''} ${it.apellidos || ''}`.trim()
      : (it.razon_social || '')
    const line = [
      it.id, it.cliente_id, it.tipo_doc || '', esc(it.nro_doc),
      esc(nombre),
      it.monto, it.recargo, it.descuento,
      fmtDate(it.fecha_vencimiento),
      it.estado,
      fmtDate(it.fecha_pago),
      it.monto_pagado ?? '',
      it.metodo_pago || ''
    ].join(sep)
    lines.push(line)
  }
  const csv = '\uFEFF' + lines.join('\n')
  res.setHeader('Content-Type', 'text/csv; charset=utf-8')
  res.setHeader('Content-Disposition', 'attachment; filename="mensualidades.csv"')
  res.send(csv)
}

export async function markVencidos(_req: Request, res: Response) {
  const [r] = await getPool().query("UPDATE mensualidades SET estado='vencido' WHERE estado='pendiente' AND fecha_vencimiento < CURDATE()")
  res.json({ affected: (r as any).affectedRows || 0 })
}
