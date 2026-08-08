const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'martex_db',
  password: process.env.DB_PASSWORD || 'qw12qw',
  port: process.env.DB_PORT || 5432,
});

const srcDir = path.join(__dirname, '../frontend/catalogo/imagenes');
const destDir = path.join(__dirname, 'uploads');

const productsToInsert = [
  {
    imageName: 'Abrigo médico.jpeg',
    destName: 'abrigo_medico.jpeg',
    nombre: 'Abrigo Médico Profesional',
    descripcion: 'Abrigo médico clásico de alta calidad, diseñado para brindar comodidad y protección durante largas jornadas de trabajo.',
    precio_base: 35.00,
    porcentaje_descuento: 10.00,
    categoria: 'Médico',
    stock: 50
  },
  {
    imageName: 'Camisa (scrug) color  verde esmeralda.jpeg',
    destName: 'camisa_scrub_verde_esmeralda.jpeg',
    nombre: 'Camisa Scrub Verde Esmeralda',
    descripcion: 'Filipina médica en color verde esmeralda, confeccionada con tela ligera, transpirable y resistente a fluidos.',
    precio_base: 18.00,
    porcentaje_descuento: 0.00,
    categoria: 'Médico',
    stock: 80
  },
  {
    imageName: 'Camisa de uniforme color gris.jpeg',
    destName: 'camisa_uniforme_gris.jpeg',
    nombre: 'Camisa de Uniforme Gris',
    descripcion: 'Camisa de uniforme formal en color gris. Excelente ajuste, durabilidad y costuras reforzadas.',
    precio_base: 20.00,
    porcentaje_descuento: 5.00,
    categoria: 'Médico',
    stock: 65
  },
  {
    imageName: 'Camisa(scrub)colorAzul.jpeg',
    destName: 'camisa_scrub_azul.jpeg',
    nombre: 'Camisa Scrub Azul Clásico',
    descripcion: 'Camisa scrub clásica color azul, ideal para enfermeros, médicos y personal de salud. Incluye amplios bolsillos.',
    precio_base: 18.00,
    porcentaje_descuento: 0.00,
    categoria: 'Médico',
    stock: 90
  },
  {
    imageName: 'conjunto de uniforme médico.jpeg',
    destName: 'conjunto_uniforme_medico.jpeg',
    nombre: 'Conjunto de Uniforme Médico Completo',
    descripcion: 'Conjunto premium que incluye filipina y pantalón clínico. Confeccionado con tela stretch para mayor libertad de movimiento.',
    precio_base: 32.00,
    porcentaje_descuento: 15.00,
    categoria: 'Médico',
    stock: 45
  }
];

async function main() {
  try {
    // Asegurar que la carpeta de destino existe
    if (!fs.existsSync(destDir)){
        fs.mkdirSync(destDir, { recursive: true });
    }

    // 1. Copiar archivos
    console.log('Copiando imágenes a la carpeta de uploads...');
    for (const prod of productsToInsert) {
      const srcPath = path.join(srcDir, prod.imageName);
      const destPath = path.join(destDir, prod.destName);
      if (fs.existsSync(srcPath)) {
        fs.copyFileSync(srcPath, destPath);
        console.log(`✅ Copiada: ${prod.imageName} -> ${prod.destName}`);
      } else {
        console.warn(`⚠️ Archivo de origen no encontrado: ${srcPath}`);
      }
    }

    // 2. Insertar en BD
    const client = await pool.connect();
    console.log('Conectado a la base de datos. Insertando productos...');

    for (const prod of productsToInsert) {
      const imgUrl = `/uploads/${prod.destName}`;
      
      // Verificar duplicados por nombre
      const checkRes = await client.query('SELECT 1 FROM productos WHERE nombre = $1', [prod.nombre]);
      if (checkRes.rowCount === 0) {
        await client.query(
          `INSERT INTO productos (nombre, descripcion, precio_base, porcentaje_descuento, imagen_url, categoria, stock)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [prod.nombre, prod.descripcion, prod.precio_base, prod.porcentaje_descuento, imgUrl, prod.categoria, prod.stock]
        );
        console.log(`✅ Insertado en BD: ${prod.nombre}`);
      } else {
        console.log(`ℹ️ El producto ya existe en la BD: ${prod.nombre}`);
      }
    }

    client.release();
    console.log('🎉 Proceso de inserción finalizado con éxito.');
  } catch (err) {
    console.error('❌ Error durante el proceso:', err);
  } finally {
    await pool.end();
  }
}

main();
