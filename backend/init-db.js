const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function initDB() {
  // Conectar a la base de datos por defecto 'postgres' para crear 'martex_db' si no existe
  const client = new Client({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    password: process.env.DB_PASSWORD || 'admin',
    port: process.env.DB_PORT || 5432,
    database: 'postgres' // Conectamos a postgres por defecto
  });

  try {
    await client.connect();
    console.log("Conectado a PostgreSQL (db: postgres).");
    
    const dbName = process.env.DB_NAME || 'martex_db';
    
    const res = await client.query(`SELECT 1 FROM pg_database WHERE datname = '${dbName}'`);
    if (res.rowCount === 0) {
      console.log(`Creando base de datos '${dbName}'...`);
      await client.query(`CREATE DATABASE ${dbName}`);
      console.log(`Base de datos '${dbName}' creada exitosamente.`);
    } else {
      console.log(`La base de datos '${dbName}' ya existe.`);
    }
  } catch (err) {
    console.error("Error al crear la base de datos:", err);
  } finally {
    await client.end();
  }

  // Ahora conectamos a la nueva base de datos para crear las tablas
  const dbClient = new Client({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    password: process.env.DB_PASSWORD || 'admin',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'martex_db'
  });

  try {
    await dbClient.connect();
    console.log(`Conectado a la base de datos '${process.env.DB_NAME || 'martex_db'}'.`);

    const sqlPath = path.join(__dirname, 'database.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log("Ejecutando script de creación de tablas (database.sql)...");
    await dbClient.query(sql);
    console.log("Tablas creadas y configuradas exitosamente.");

  } catch (err) {
    console.error("Error al crear las tablas:", err);
  } finally {
    await dbClient.end();
  }
}

initDB();
