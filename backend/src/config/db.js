const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'martex_db',
  password: process.env.DB_PASSWORD || 'admin',
  port: process.env.DB_PORT || 5432,
});

pool.connect((err, client, release) => {
  if (err) {
    return console.error('Error adquiriendo cliente de conexión', err.stack);
  }
  console.log('Conexión exitosa a la base de datos PostgreSQL de Martex');
  release();
});

module.exports = pool;
