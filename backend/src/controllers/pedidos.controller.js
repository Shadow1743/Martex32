const pool = require('../config/db');

exports.getAll = async (req, res) => {
    try {
        const { rows } = await pool.query(`
            SELECT p.*, 
                   json_agg(json_build_object('id', pi.id, 'producto_id', pi.producto_id, 'cantidad', pi.cantidad, 'precio_unitario', pi.precio_unitario, 'producto_nombre', pr.nombre, 'talla', pi.talla)) as items
            FROM pedidos p
            LEFT JOIN pedido_items pi ON p.id = pi.pedido_id
            LEFT JOIN productos pr ON pi.producto_id = pr.id
            GROUP BY p.id
            ORDER BY p.creado_en DESC
        `);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al obtener los pedidos" });
    }
};

exports.create = async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        const { cliente_nombre, cliente_email, cliente_telefono, direccion, dui, metodo_pago, total, items } = req.body;
        
        // Manejar subida de archivo para comprobante
        const comprobante_url = req.file ? `/uploads/${req.file.filename}` : null;
        const totalNumerico = parseFloat(total) || 0;
        
        // Parsear items en caso de que vengan serializados como JSON String (FormData)
        let parsedItems = items;
        if (typeof items === 'string') {
            try {
                parsedItems = JSON.parse(items);
            } catch (e) {
                console.error("Error al parsear items de pedido:", e);
                parsedItems = [];
            }
        }
        
        const { rows: pedidoRows } = await client.query(
            'INSERT INTO pedidos (cliente_nombre, cliente_email, cliente_telefono, direccion, dui, metodo_pago, total, comprobante_url) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
            [cliente_nombre, cliente_email || null, cliente_telefono, direccion, dui || null, metodo_pago, totalNumerico, comprobante_url]
        );
        
        const pedidoId = pedidoRows[0].id;
        
        if (parsedItems && parsedItems.length > 0) {
            for (let item of parsedItems) {
                await client.query(
                    'INSERT INTO pedido_items (pedido_id, producto_id, cantidad, precio_unitario, talla) VALUES ($1, $2, $3, $4, $5)',
                    [pedidoId, item.producto_id, item.cantidad, item.precio_unitario, item.talla || 'M']
                );
            }
        }
        
        await client.query('COMMIT');
        res.status(201).json(pedidoRows[0]);
    } catch (error) {
        await client.query('ROLLBACK');
        console.error(error);
        res.status(500).json({ error: "Error al crear el pedido" });
    } finally {
        client.release();
    }
};

exports.updateStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { estado } = req.body;
        
        const { rows } = await pool.query(
            'UPDATE pedidos SET estado = $1 WHERE id = $2 RETURNING *',
            [estado, id]
        );
        
        if (rows.length === 0) return res.status(404).json({ error: "Pedido no encontrado" });
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: "Error al actualizar estado del pedido" });
    }
};
