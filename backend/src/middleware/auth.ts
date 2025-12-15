import jwt from 'jsonwebtoken'
import { Request, Response, NextFunction } from 'express'

export interface AuthUser {
  id: number
  username: string
  role: 'admin' | 'cobrador' | 'supervisor'
}

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authorization || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : ''
  if (!token) return res.status(401).json({ error: 'unauthorized' })
  try {
    const payload = jwt.verify(token, String(process.env.JWT_SECRET)) as AuthUser
    ;(req as any).user = payload
    next()
  } catch {
    res.status(401).json({ error: 'invalid_token' })
  }
}

export function authorize(roles: AuthUser['role'][]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user as AuthUser | undefined
    if (!user) return res.status(401).json({ error: 'unauthorized' })
    if (!roles.includes(user.role)) return res.status(403).json({ error: 'forbidden' })
    next()
  }
}
