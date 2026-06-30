const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'martex_db',
  password: process.env.DB_PASSWORD || 'admin',
  port: process.env.DB_PORT || 5432,
});

async function run() {
  try {
    console.log('Running database migration...');
    await pool.query('ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS comprobante_url VARCHAR(255);');
    console.log('Migration 1/2: Column comprobante_url OK');
    await pool.query('ALTER TABLE medidas ADD COLUMN IF NOT EXISTS precio DECIMAL(10,2);');
    console.log('Migration 2/2: Column precio on medidas OK');
    console.log('All migrations completed successfully.');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await pool.end();
  }
}

run();
