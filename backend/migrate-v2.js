const pool = require('./src/config/db');

async function migrate() {
    const client = await pool.connect();
    try {
        console.log('Iniciando migración v2...');
        await client.query('BEGIN');

        // Agregar talla a pedido_items
        await client.query(`ALTER TABLE pedido_items ADD COLUMN IF NOT EXISTS talla VARCHAR(10) DEFAULT 'M';`);
        console.log('Columna talla añadida a pedido_items');

        // Agregar comprobante_url a pedidos
        await client.query(`ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS comprobante_url VARCHAR(255);`);
        console.log('Columna comprobante_url añadida a pedidos');

        // Agregar stock a productos
        await client.query(`ALTER TABLE productos ADD COLUMN IF NOT EXISTS stock INT DEFAULT 0;`);
        console.log('Columna stock añadida a productos');

        // Agregar actualizado_en a tablas principales
        await client.query(`ALTER TABLE productos ADD COLUMN IF NOT EXISTS actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP;`);
        await client.query(`ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP;`);
        await client.query(`ALTER TABLE medidas ADD COLUMN IF NOT EXISTS actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP;`);
        console.log('Columnas actualizado_en añadidas');

        // Constraints de estado (ignorar error si ya existe)
        try {
            await client.query(`ALTER TABLE pedidos ADD CONSTRAINT chk_pedido_estado CHECK (estado IN ('Nuevo', 'Procesando', 'Enviado', 'Entregado', 'Cancelado'));`);
        } catch(e) { /* ignore if exists */ }
        
        try {
            await client.query(`ALTER TABLE medidas ADD CONSTRAINT chk_medidas_estado CHECK (estado IN ('Pendiente', 'En confección', 'Terminado', 'Entregado'));`);
        } catch(e) { /* ignore if exists */ }
        console.log('Constraints de estado añadidos');

        // Índices
        await client.query(`CREATE INDEX IF NOT EXISTS idx_pedidos_estado ON pedidos(estado);`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_pedidos_creado_en ON pedidos(creado_en DESC);`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_productos_categoria ON productos(categoria);`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_medidas_estado ON medidas(estado);`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_medidas_cliente ON medidas(cliente_nombre);`);
        console.log('Índices de rendimiento añadidos');

        await client.query('COMMIT');
        console.log('Migración completada exitosamente.');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error durante la migración:', error);
    } finally {
        client.release();
        process.exit(0);
    }
}

migrate();
