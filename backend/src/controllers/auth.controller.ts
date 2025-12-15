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
