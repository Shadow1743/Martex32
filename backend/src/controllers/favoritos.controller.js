const pool = require('../config/db');

// Obtener todos los favoritos del cliente autenticado
exports.getAll = async (req, res) => {
    try {
        const { rows } = await pool.query(`
            SELECT f.id, f.producto_id, f.creado_en,
                   p.nombre, p.descripcion, p.precio_base, p.porcentaje_descuento, p.imagen_url, p.categoria
            FROM favoritos f
            JOIN productos p ON f.producto_id = p.id
            WHERE f.cliente_id = $1
            ORDER BY f.creado_en DESC
        `, [req.cliente.id]);
        res.json(rows);
    } catch (error) {
        console.error('Error obteniendo favoritos:', error);
        res.status(500).json({ error: 'Error al obtener los favoritos' });
    }
};

// Toggle favorito (agregar/quitar)
exports.toggle = async (req, res) => {
    const { productoId } = req.params;

    try {
        // Verificar que el producto existe
        const producto = await pool.query('SELECT id FROM productos WHERE id = $1', [productoId]);
        if (producto.rows.length === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        // Verificar si ya está en favoritos
        const existing = await pool.query(
            'SELECT id FROM favoritos WHERE cliente_id = $1 AND producto_id = $2',
            [req.cliente.id, productoId]
        );

        if (existing.rows.length > 0) {
            // Quitar de favoritos
            await pool.query('DELETE FROM favoritos WHERE cliente_id = $1 AND producto_id = $2', [req.cliente.id, productoId]);
            res.json({ isFavorite: false, message: 'Producto removido de favoritos' });
        } else {
            // Agregar a favoritos
            await pool.query(
                'INSERT INTO favoritos (cliente_id, producto_id) VALUES ($1, $2)',
                [req.cliente.id, productoId]
            );
            res.json({ isFavorite: true, message: 'Producto agregado a favoritos' });
        }
    } catch (error) {
        console.error('Error en toggle de favorito:', error);
        res.status(500).json({ error: 'Error al actualizar favoritos' });
    }
};

// Verificar si un producto está en favoritos
exports.check = async (req, res) => {
    const { productoId } = req.params;

    try {
        const { rows } = await pool.query(
            'SELECT id FROM favoritos WHERE cliente_id = $1 AND producto_id = $2',
            [req.cliente.id, productoId]
        );
        res.json({ isFavorite: rows.length > 0 });
    } catch (error) {
        console.error('Error verificando favorito:', error);
        res.status(500).json({ error: 'Error al verificar favorito' });
    }
};

// Verificar múltiples productos (batch check)
exports.checkBatch = async (req, res) => {
    const { productoIds } = req.body;

    if (!productoIds || !Array.isArray(productoIds)) {
        return res.status(400).json({ error: 'Se requiere un array de productoIds' });
    }

    try {
        const { rows } = await pool.query(
            'SELECT producto_id FROM favoritos WHERE cliente_id = $1 AND producto_id = ANY($2::uuid[])',
            [req.cliente.id, productoIds]
        );
        const favoriteIds = rows.map(r => r.producto_id);
        res.json({ favoritos: favoriteIds });
    } catch (error) {
        console.error('Error en batch check:', error);
        res.status(500).json({ error: 'Error al verificar favoritos' });
    }
};
