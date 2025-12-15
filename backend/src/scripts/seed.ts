import dotenv from 'dotenv'
dotenv.config()
import { getPool } from '../services/db'
import bcrypt from 'bcryptjs'

async function run() {
  const username = process.env.SEED_ADMIN_USER || 'admin'
  const password = process.env.SEED_ADMIN_PASS || 'admin123'
  const hash = await bcrypt.hash(password, 10)
  await getPool().query('INSERT IGNORE INTO users(username, password_hash, role, active) VALUES (?,?,?,1)', [username, hash, 'admin'])
  process.exit(0)
}

run()
