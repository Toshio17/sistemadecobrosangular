import dotenv from 'dotenv'
dotenv.config()
import { app } from './app'
import { getPool } from './services/db'

const port = Number(process.env.PORT || 4000)

async function start() {
  try {
    await getPool().query('SELECT 1')
    app.listen(port, () => {})
  } catch (err) {
    process.exit(1)
  }
}

start()
