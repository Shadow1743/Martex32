const pool = require('./src/config/db');

async function migrate() {
    const client = await pool.connect();
    try {
        console.log('🚀 Iniciando migración v3 — Autenticación de Clientes y Nuevas Funcionalidades...');
        await client.query('BEGIN');

        // =============================================
        // 1. Tabla de Clientes (registro público)
        // =============================================
        await client.query(`
            CREATE TABLE IF NOT EXISTS clientes (
                id SERIAL PRIMARY KEY,
                nombre VARCHAR(100) NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                telefono VARCHAR(20),
                avatar_url VARCHAR(255),
                creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('✅ Tabla clientes creada');

        // =============================================
        // 2. Tabla de Favoritos (Wishlist)
        // =============================================
        await client.query(`
            CREATE TABLE IF NOT EXISTS favoritos (
                id SERIAL PRIMARY KEY,
                cliente_id INT NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
                producto_id UUID NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
                creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(cliente_id, producto_id)
            );
        `);
        console.log('✅ Tabla favoritos creada');

        // =============================================
        // 3. Tabla de Reseñas
        // =============================================
        await client.query(`
            CREATE TABLE IF NOT EXISTS resenas (
                id SERIAL PRIMARY KEY,
                cliente_id INT NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
                producto_id UUID NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
                calificacion INT NOT NULL CHECK (calificacion >= 1 AND calificacion <= 5),
                comentario TEXT,
                creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(cliente_id, producto_id)
            );
        `);
        console.log('✅ Tabla resenas creada');

        // =============================================
        // 4. Tabla de Perfiles de Medidas (guardadas por cliente)
        // =============================================
        await client.query(`
            CREATE TABLE IF NOT EXISTS perfiles_medidas (
                id SERIAL PRIMARY KEY,
                cliente_id INT NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
                nombre_perfil VARCHAR(100) NOT NULL DEFAULT 'Mis Medidas',
                
                -- Medidas Superiores
                hombro DECIMAL(5,2),
                busto DECIMAL(5,2),
                cintura_sup DECIMAL(5,2),
                cadera_sup DECIMAL(5,2),
                largo_cintura DECIMAL(5,2),
                largo_manga DECIMAL(5,2),
                grosor_manga DECIMAL(5,2),
                largo_total_sup DECIMAL(5,2),

                -- Medidas Inferiores
                cintura_inf DECIMAL(5,2),
                cadera_inf DECIMAL(5,2),
                largo_rodilla DECIMAL(5,2),
                largo_total_inf DECIMAL(5,2),
                tiro DECIMAL(5,2),
                grosor_pierna DECIMAL(5,2),

                creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('✅ Tabla perfiles_medidas creada');

        // =============================================
        // 5. Tabla de Notificaciones de Email
        // =============================================
        await client.query(`
            CREATE TABLE IF NOT EXISTS notificaciones_email (
                id SERIAL PRIMARY KEY,
                destinatario_email VARCHAR(100) NOT NULL,
                tipo VARCHAR(50) NOT NULL,
                asunto VARCHAR(255) NOT NULL,
                contenido TEXT,
                enviado BOOLEAN DEFAULT FALSE,
                error TEXT,
                creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('✅ Tabla notificaciones_email creada');

        // =============================================
        // 6. Agregar cliente_id a pedidos (FK opcional)
        // =============================================
        await client.query(`
            ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS cliente_id INT REFERENCES clientes(id) ON DELETE SET NULL;
        `);
        console.log('✅ Columna cliente_id añadida a pedidos');

        // =============================================
        // 7. Índices de rendimiento
        // =============================================
        await client.query(`CREATE INDEX IF NOT EXISTS idx_clientes_email ON clientes(email);`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_favoritos_cliente ON favoritos(cliente_id);`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_resenas_producto ON resenas(producto_id);`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_resenas_cliente ON resenas(cliente_id);`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_perfiles_medidas_cliente ON perfiles_medidas(cliente_id);`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_pedidos_cliente ON pedidos(cliente_id);`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_notificaciones_tipo ON notificaciones_email(tipo);`);
        console.log('✅ Índices de rendimiento creados');

        await client.query('COMMIT');
        console.log('\n🎉 Migración v3 completada exitosamente.');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Error durante la migración v3:', error);
    } finally {
        client.release();
        process.exit(0);
    }
}

migrate();
