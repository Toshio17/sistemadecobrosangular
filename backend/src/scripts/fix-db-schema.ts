import 'dotenv/config';
import { getPool } from '../services/db';

async function fixSchema() {
  try {
    console.log('Checking database schema...');
    const pool = getPool();
    
    // Check if column metodo_pago exists in mensualidades
    try {
      await pool.query('SELECT metodo_pago FROM mensualidades LIMIT 1');
      console.log('Column metodo_pago already exists.');
    } catch (err: any) {
      if (err.code === 'ER_BAD_FIELD_ERROR') {
        console.log('Column metodo_pago missing. Adding it...');
        await pool.query(`
          ALTER TABLE mensualidades 
          ADD COLUMN metodo_pago ENUM('yape','plin','tarjeta','transferencia','efectivo') NULL
        `);
        console.log('Column metodo_pago added successfully.');
      } else {
        throw err;
      }
    }
    
    console.log('Database schema check complete.');
    process.exit(0);
  } catch (err) {
    console.error('Failed to fix schema:', err);
    process.exit(1);
  }
}

fixSchema();
