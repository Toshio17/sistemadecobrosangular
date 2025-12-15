import dotenv from 'dotenv'
dotenv.config()
import mysql from 'mysql2/promise'
import fs from 'fs'
import path from 'path'

async function run() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
  })
  const db = String(process.env.DB_NAME)
  await conn.query(`CREATE DATABASE IF NOT EXISTS \`${db}\``)
  await conn.query(`USE \`${db}\``)
  const sql = fs.readFileSync(path.join(process.cwd(), 'db', 'schema.sql'), 'utf-8')
  const statements = sql.split(';').map(s => s.trim()).filter(Boolean)
  for (const st of statements) {
    await conn.query(st)
  }
  const [colRows] = await conn.query(
    'SELECT COUNT(*) as c FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=? AND TABLE_NAME=? AND COLUMN_NAME=?',
    [db, 'clientes', 'plan_id']
  )
  const hasPlanId = (colRows as any[])[0]?.c > 0
  if (!hasPlanId) {
    await conn.query('ALTER TABLE clientes ADD COLUMN plan_id INT NULL')
  }
  try {
    await conn.query('ALTER TABLE clientes ADD CONSTRAINT fk_clientes_plan FOREIGN KEY (plan_id) REFERENCES planes(id)')
  } catch {}
  const [recargoCol] = await conn.query(
    'SELECT COUNT(*) as c FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=? AND TABLE_NAME=? AND COLUMN_NAME=?',
    [db, 'mensualidades', 'recargo']
  )
  if (!((recargoCol as any[])[0]?.c > 0)) {
    await conn.query('ALTER TABLE mensualidades ADD COLUMN recargo DECIMAL(10,2) DEFAULT 0')
  }
  const [descuentoCol] = await conn.query(
    'SELECT COUNT(*) as c FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=? AND TABLE_NAME=? AND COLUMN_NAME=?',
    [db, 'mensualidades', 'descuento']
  )
  if (!((descuentoCol as any[])[0]?.c > 0)) {
    await conn.query('ALTER TABLE mensualidades ADD COLUMN descuento DECIMAL(10,2) DEFAULT 0')
  }
  const [metodoPagoCol] = await conn.query(
    'SELECT COUNT(*) as c FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=? AND TABLE_NAME=? AND COLUMN_NAME=?',
    [db, 'mensualidades', 'metodo_pago']
  )
  if (!((metodoPagoCol as any[])[0]?.c > 0)) {
    await conn.query("ALTER TABLE mensualidades ADD COLUMN metodo_pago ENUM('yape','plin','tarjeta','transferencia','efectivo') NULL")
  }
  await conn.end()
  process.exit(0)
}

run()
