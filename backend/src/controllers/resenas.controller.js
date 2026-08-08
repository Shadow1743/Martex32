const pool = require('../config/db');

// Obtener reseñas de un producto (público)
exports.getByProducto = async (req, res) => {
    const { productoId } = req.params;

    try {
        const { rows } = await pool.query(`
            SELECT r.id, r.calificacion, r.comentario, r.creado_en,
                   c.nombre AS cliente_nombre
            FROM resenas r
            JOIN clientes c ON r.cliente_id = c.id
            WHERE r.producto_id = $1
            ORDER BY r.creado_en DESC
        `, [productoId]);

        // Calcular promedio
        const promedio = rows.length > 0
            ? rows.reduce((sum, r) => sum + r.calificacion, 0) / rows.length
            : 0;

        res.json({
            resenas: rows,
            promedio: Math.round(promedio * 10) / 10,
            total: rows.length
        });
    } catch (error) {
        console.error('Error obteniendo reseñas:', error);
        res.status(500).json({ error: 'Error al obtener las reseñas' });
    }
};

// Crear reseña (solo clientes que hayan comprado el producto)
exports.create = async (req, res) => {
    const { productoId } = req.params;
    const { calificacion, comentario } = req.body;

    if (!calificacion || calificacion < 1 || calificacion > 5) {
        return res.status(400).json({ error: 'La calificación debe ser entre 1 y 5' });
    }

    try {
        // Verificar que el producto existe
        const producto = await pool.query('SELECT id FROM productos WHERE id = $1', [productoId]);
        if (producto.rows.length === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        // Verificar que el cliente ha comprado el producto
        const compra = await pool.query(`
            SELECT p.id FROM pedidos p
            JOIN pedido_items pi ON p.id = pi.pedido_id
            WHERE p.cliente_id = $1 AND pi.producto_id = $2 AND p.estado IN ('Enviado', 'Entregado')
            LIMIT 1
        `, [req.cliente.id, productoId]);

        if (compra.rows.length === 0) {
            return res.status(403).json({ error: 'Solo puedes reseñar productos que hayas comprado' });
        }

        // Verificar si ya dejó una reseña
        const existingReview = await pool.query(
            'SELECT id FROM resenas WHERE cliente_id = $1 AND producto_id = $2',
            [req.cliente.id, productoId]
        );

        if (existingReview.rows.length > 0) {
            // Actualizar reseña existente
            const { rows } = await pool.query(
                'UPDATE resenas SET calificacion = $1, comentario = $2 WHERE cliente_id = $3 AND producto_id = $4 RETURNING *',
                [calificacion, comentario || null, req.cliente.id, productoId]
            );
            return res.json({ message: 'Reseña actualizada', resena: rows[0] });
        }

        // Crear nueva reseña
        const { rows } = await pool.query(
            'INSERT INTO resenas (cliente_id, producto_id, calificacion, comentario) VALUES ($1, $2, $3, $4) RETURNING *',
            [req.cliente.id, productoId, calificacion, comentario || null]
        );

        res.status(201).json({ message: 'Reseña creada', resena: rows[0] });
    } catch (error) {
        console.error('Error creando reseña:', error);
        res.status(500).json({ error: 'Error al crear la reseña' });
    }
};

// Eliminar reseña (admin o el propio cliente)
exports.delete = async (req, res) => {
    const { id } = req.params;

    try {
        // Si es un cliente, solo puede borrar la suya
        let query = 'DELETE FROM resenas WHERE id = $1';
        let params = [id];

        if (req.cliente) {
            query += ' AND cliente_id = $2';
            params.push(req.cliente.id);
        }

        const { rowCount } = await pool.query(query, params);
        if (rowCount === 0) {
            return res.status(404).json({ error: 'Reseña no encontrada' });
        }

        res.json({ message: 'Reseña eliminada' });
    } catch (error) {
        console.error('Error eliminando reseña:', error);
        res.status(500).json({ error: 'Error al eliminar la reseña' });
    }
};

// Obtener promedio de calificación para múltiples productos (batch)
exports.getPromedios = async (req, res) => {
    try {
        const { rows } = await pool.query(`
            SELECT producto_id, 
                   ROUND(AVG(calificacion)::numeric, 1) AS promedio,
                   COUNT(*) AS total
            FROM resenas
            GROUP BY producto_id
        `);

        const map = {};
        rows.forEach(r => {
            map[r.producto_id] = { promedio: parseFloat(r.promedio), total: parseInt(r.total) };
        });

        res.json(map);
    } catch (error) {
        console.error('Error obteniendo promedios:', error);
        res.status(500).json({ error: 'Error al obtener promedios de reseñas' });
    }
};
