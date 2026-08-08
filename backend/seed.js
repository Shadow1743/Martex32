require('dotenv').config();
const bcrypt = require('bcrypt');
const pool = require('./src/config/db');

async function seedAdmin() {
    const email = process.env.ADMIN_EMAIL || 'admin@martex.com';
    const password = process.env.ADMIN_PASSWORD || 'admin123';
    
    console.log(`Iniciando configuración de administrador para: ${email}...`);

    try {
        const client = await pool.connect();
        
        // Verificar si existe el usuario
        const result = await client.query('SELECT * FROM usuarios WHERE email = $1', [email]);
        
        if (result.rows.length > 0) {
            console.log("⚠️ El usuario administrador ya existe. Actualizando contraseña...");
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            
            await client.query(
                'UPDATE usuarios SET password_hash = $1 WHERE email = $2',
                [hashedPassword, email]
            );
            console.log("✅ Contraseña de administrador actualizada correctamente.");
        } else {
            console.log("Creando usuario administrador...");
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            
            await client.query(
                'INSERT INTO usuarios (nombre, email, password_hash, rol) VALUES ($1, $2, $3, $4)',
                ['Administrador Principal', email, hashedPassword, 'admin']
            );
            console.log("✅ Usuario administrador creado correctamente.");
        }

        client.release();
    } catch (error) {
        console.error("❌ Error al crear/actualizar el administrador:", error);
    } finally {
        process.exit(0);
    }
}

seedAdmin();
