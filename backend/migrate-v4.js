const pool = require('./src/config/db');

async function migrate() {
    const client = await pool.connect();
    try {
        console.log('🚀 Iniciando migración v4 — OAuth (Google & Facebook)...');
        await client.query('BEGIN');

        // Hacer la contraseña opcional (para usuarios que se registran por OAuth)
        await client.query(`
            ALTER TABLE clientes ALTER COLUMN password_hash DROP NOT NULL;
        `);
        console.log('✅ Columna password_hash en clientes ahora es nullable');

        // Agregar columnas para IDs sociales
        await client.query(`
            ALTER TABLE clientes ADD COLUMN IF NOT EXISTS google_id VARCHAR(255) UNIQUE;
        `);
        console.log('✅ Columna google_id añadida a clientes');

        await client.query(`
            ALTER TABLE clientes ADD COLUMN IF NOT EXISTS facebook_id VARCHAR(255) UNIQUE;
        `);
        console.log('✅ Columna facebook_id añadida a clientes');

        await client.query(`
            ALTER TABLE clientes ADD COLUMN IF NOT EXISTS auth_provider VARCHAR(50) DEFAULT 'local';
        `);
        console.log('✅ Columna auth_provider añadida a clientes');

        // Índices para búsquedas rápidas por ID social
        await client.query(`CREATE INDEX IF NOT EXISTS idx_clientes_google_id ON clientes(google_id);`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_clientes_facebook_id ON clientes(facebook_id);`);
        console.log('✅ Índices de rendimiento creados');

        await client.query('COMMIT');
        console.log('\n🎉 Migración v4 completada exitosamente.');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Error durante la migración v4:', error);
    } finally {
        client.release();
        process.exit(0);
    }
}

migrate();
