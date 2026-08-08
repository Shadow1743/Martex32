const pool = require('../config/db');
const emailService = require('../services/email.service');

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
        
        // Validación de datos requeridos
        if (!cliente_nombre || !cliente_telefono || !direccion || !metodo_pago) {
            await client.query('ROLLBACK');
            return res.status(400).json({ error: "Faltan campos requeridos: nombre, teléfono, dirección o método de pago" });
        }

        const metodosValidos = ['Efectivo', 'Depósito', 'Transferencia', 'Deposito'];
        if (!metodosValidos.includes(metodo_pago)) {
            await client.query('ROLLBACK');
            return res.status(400).json({ error: "Método de pago inválido" });
        }

        const totalNumerico = parseFloat(total) || 0;
        if (totalNumerico <= 0) {
            await client.query('ROLLBACK');
            return res.status(400).json({ error: "El total debe ser mayor a 0" });
        }

        // Manejar subida de archivo para comprobante
        const comprobante_url = req.file ? `/uploads/${req.file.filename}` : null;
        
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
        
        // Vincular con cliente autenticado si existe
        const clienteId = req.cliente ? req.cliente.id : null;

        const { rows: pedidoRows } = await client.query(
            'INSERT INTO pedidos (cliente_nombre, cliente_email, cliente_telefono, direccion, dui, metodo_pago, total, comprobante_url, cliente_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
            [cliente_nombre, cliente_email || null, cliente_telefono, direccion, dui || null, metodo_pago, totalNumerico, comprobante_url, clienteId]
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

        // Enviar email de confirmación
        try {
            await emailService.enviarConfirmacionPedido(pedidoRows[0], cliente_email);
        } catch (e) {
            console.log('Email de confirmación no enviado:', e.message);
        }

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
    const client = await pool.connect();
    try {
        const { id } = req.params;
        const { estado } = req.body;
        
        await client.query('BEGIN');
        
        // Obtener el estado actual
        const { rows: currentOrder } = await client.query('SELECT estado FROM pedidos WHERE id = $1', [id]);
        if (currentOrder.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: "Pedido no encontrado" });
        }
        const estadoAnterior = currentOrder[0].estado;

        // Actualizar el estado
        const { rows } = await client.query(
            'UPDATE pedidos SET estado = $1, actualizado_en = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
            [estado, id]
        );
        
        // Manejo de Stock (Si pasa de Nuevo a Procesando/Enviado -> restar)
        // (Si pasa a Cancelado desde Procesando/Enviado -> sumar)
        const { rows: items } = await client.query('SELECT producto_id, cantidad FROM pedido_items WHERE pedido_id = $1', [id]);
        
        const restarStock = (estado === 'Procesando' || estado === 'Enviado') && (estadoAnterior === 'Nuevo' || estadoAnterior === 'Cancelado');
        const sumarStock = estado === 'Cancelado' && (estadoAnterior === 'Procesando' || estadoAnterior === 'Enviado');
        
        for (let item of items) {
            if (restarStock) {
                await client.query('UPDATE productos SET stock = stock - $1 WHERE id = $2', [item.cantidad, item.producto_id]);
            } else if (sumarStock) {
                await client.query('UPDATE productos SET stock = stock + $1 WHERE id = $2', [item.cantidad, item.producto_id]);
            }
        }
        
        await client.query('COMMIT');

        // Enviar email de cambio de estado
        try {
            const emailDest = rows[0].cliente_email;
            if (emailDest) {
                await emailService.enviarCambioEstado(rows[0], estadoAnterior, estado, emailDest);
            }
        } catch (e) {
            console.log('Email de cambio de estado no enviado:', e.message);
        }

        res.json(rows[0]);
    } catch (error) {
        await client.query('ROLLBACK');
        console.error(error);
        res.status(500).json({ error: "Error al actualizar estado del pedido" });
    } finally {
        client.release();
    }
};

exports.getById = async (req, res) => {
    try {
        const { id } = req.params;
        const { rows } = await pool.query(`
            SELECT p.*, 
                   json_agg(json_build_object('id', pi.id, 'producto_id', pi.producto_id, 'cantidad', pi.cantidad, 'precio_unitario', pi.precio_unitario, 'producto_nombre', pr.nombre, 'talla', pi.talla)) as items
            FROM pedidos p
            LEFT JOIN pedido_items pi ON p.id = pi.pedido_id
            LEFT JOIN productos pr ON pi.producto_id = pr.id
            WHERE p.id = $1
            GROUP BY p.id
        `, [id]);
        
        if (rows.length === 0) {
            return res.status(404).json({ error: "Pedido no encontrado" });
        }
        
        res.json(rows[0]);
    } catch (error) {
        console.error("Error obteniendo pedido por id:", error);
        res.status(500).json({ error: "Error al obtener el pedido" });
    }
};

// Obtener pedidos del cliente autenticado
exports.getByCliente = async (req, res) => {
    try {
        const { rows } = await pool.query(`
            SELECT p.*, 
                   json_agg(json_build_object('id', pi.id, 'producto_id', pi.producto_id, 'cantidad', pi.cantidad, 'precio_unitario', pi.precio_unitario, 'producto_nombre', pr.nombre, 'talla', pi.talla)) as items
            FROM pedidos p
            LEFT JOIN pedido_items pi ON p.id = pi.pedido_id
            LEFT JOIN productos pr ON pi.producto_id = pr.id
            WHERE p.cliente_id = $1
            GROUP BY p.id
            ORDER BY p.creado_en DESC
        `, [req.cliente.id]);
        res.json(rows);
    } catch (error) {
        console.error('Error obteniendo pedidos del cliente:', error);
        res.status(500).json({ error: 'Error al obtener tus pedidos' });
    }
};
