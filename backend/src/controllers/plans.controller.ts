import { Request, Response } from 'express'
import { getPool } from '../services/db'

export async function listPlans(req: Request, res: Response) {
  const { q, page = '1', size = '10', sort = 'id', dir = 'desc', activo = 'all' } = req.query as any
  const p = Number(page)
  const s = Number(size)
  const offset = (p - 1) * s
  const like = q ? `%${q}%` : '%'
  const allowedSort: Record<string, string> = { id: 'id', nombre: 'nombre', precio: 'precio', periodo: 'periodo', activo: 'activo' }
  const sortCol = allowedSort[String(sort)] || 'id'
  const direction = String(dir).toUpperCase() === 'ASC' ? 'ASC' : 'DESC'
  const whereActivo = activo === '1' || activo === '0' ? 'activo = ?' : 'activo IN (0,1)'
  const params: any[] = []
  if (whereActivo === 'activo = ?') params.push(Number(activo))
  params.push(like, like, s, offset)
  const sql = `SELECT id, nombre, precio, periodo, descripcion, activo FROM planes
               WHERE ${whereActivo} AND (nombre LIKE ? OR descripcion LIKE ?)
               ORDER BY ${sortCol} ${direction} LIMIT ? OFFSET ?`
  const [rows] = await getPool().query(sql, params)
  res.json(rows)
}

export async function getPlan(req: Request, res: Response) {
  const id = Number(req.params.id)
  const [rows] = await getPool().query('SELECT * FROM planes WHERE id=? LIMIT 1', [id])
  const it = (rows as any[])[0]
  if (!it) return res.status(404).json({ error: 'not_found' })
  res.json(it)
}

export async function createOrUpdatePlan(req: Request, res: Response) {
  const id = req.params.id ? Number(req.params.id) : 0
  const { nombre, precio, periodo, descripcion } = req.body as { nombre: string; precio: number; periodo: 'mensual'|'anual'; descripcion?: string }
  if (!nombre || !precio || !periodo) return res.status(400).json({ error: 'invalid_input' })
  if (id) {
    await getPool().query('UPDATE planes SET nombre=?, precio=?, periodo=?, descripcion=? WHERE id=?', [nombre, precio, periodo, descripcion || null, id])
    res.json({ id })
  } else {
    const [r] = await getPool().query('INSERT INTO planes(nombre, precio, periodo, descripcion, activo) VALUES (?,?,?,?,1)', [nombre, precio, periodo, descripcion || null])
    const insertId = (r as any).insertId
    res.status(201).json({ id: insertId })
  }
}

export async function togglePlan(req: Request, res: Response) {
  const id = Number(req.params.id)
  const [rows] = await getPool().query('SELECT activo FROM planes WHERE id=?', [id])
  const it = (rows as any[])[0]
  if (!it) return res.status(404).json({ error: 'not_found' })
  const next = it.activo ? 0 : 1
  await getPool().query('UPDATE planes SET activo=? WHERE id=?', [next, id])
  res.json({ id, activo: next })
}

export async function deletePlan(req: Request, res: Response) {
  const id = Number(req.params.id)
  const [rows] = await getPool().query('SELECT id FROM planes WHERE id=? LIMIT 1', [id])
  const it = (rows as any[])[0]
  if (!it) return res.status(404).json({ error: 'not_found' })
  await getPool().query('DELETE FROM planes WHERE id=?', [id])
  res.status(204).end()
}
