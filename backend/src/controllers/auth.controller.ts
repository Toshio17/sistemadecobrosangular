import { Request, Response } from 'express'
import { getPool } from '../services/db'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export async function login(req: Request, res: Response) {
  const { username, password } = req.body as { username: string; password: string }
  if (!username || !password) return res.status(400).json({ error: 'invalid_input' })
  const [rows] = await getPool().query('SELECT id, username, password_hash, role FROM users WHERE username=? AND active=1 LIMIT 1', [username])
  const user = (rows as any[])[0]
  if (!user) return res.status(401).json({ error: 'invalid_credentials' })
  const ok = await bcrypt.compare(password, user.password_hash)
  if (!ok) return res.status(401).json({ error: 'invalid_credentials' })
  const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, String(process.env.JWT_SECRET), { expiresIn: '8h' })
  res.json({ token, role: user.role, username: user.username })
}

export async function register(req: Request, res: Response) {
  const { username, password, role } = req.body as { username: string; password: string; role: string }
  if (!username || !password || !role) return res.status(400).json({ error: 'invalid_input' })
  
  const validRoles = ['admin', 'cobrador', 'supervisor']
  if (!validRoles.includes(role)) return res.status(400).json({ error: 'invalid_role' })

  const [existing] = await getPool().query('SELECT id FROM users WHERE username=? LIMIT 1', [username])
  if ((existing as any[]).length > 0) return res.status(409).json({ error: 'username_taken' })

  const hash = await bcrypt.hash(password, 10)
  await getPool().query('INSERT INTO users (username, password_hash, role, active) VALUES (?, ?, ?, 1)', [username, hash, role])
  
  res.status(201).json({ message: 'user_created' })
}

export async function requestPasswordReset(req: Request, res: Response) {
  const { username } = req.body
  if (!username) return res.status(400).json({ error: 'invalid_input' })
  // En un sistema real, aquí se generaría un token y se enviaría por email
  // Por ahora, solo verificamos que el usuario exista y simulamos éxito
  const [rows] = await getPool().query('SELECT id FROM users WHERE username=? AND active=1 LIMIT 1', [username])
  if ((rows as any[]).length === 0) return res.status(404).json({ error: 'user_not_found' })
  
  res.json({ message: 'reset_email_sent' })
}
