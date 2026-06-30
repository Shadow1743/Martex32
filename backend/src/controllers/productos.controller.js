const pool = require('../config/db');

exports.getAll = async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT * FROM productos ORDER BY creado_en DESC');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener los productos" });
    }
};

exports.getById = async (req, res) => {
    try {
        const { id } = req.params;
        const { rows } = await pool.query('SELECT * FROM productos WHERE id = $1', [id]);
        if (rows.length === 0) return res.status(404).json({ error: "Producto no encontrado" });
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener el producto" });
    }
};

exports.create = async (req, res) => {
    try {
        const { nombre, descripcion, precio_base, porcentaje_descuento, categoria } = req.body;
        let imagen_url = null;
        if (req.file) {
            imagen_url = `/uploads/${req.file.filename}`;
        }
        
        const { rows } = await pool.query(
            'INSERT INTO productos (nombre, descripcion, precio_base, porcentaje_descuento, categoria, imagen_url) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [nombre, descripcion, precio_base || 0, porcentaje_descuento || 0, categoria, imagen_url]
        );
        res.status(201).json(rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al crear el producto" });
    }
};

exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, descripcion, precio_base, porcentaje_descuento, categoria } = req.body;
        
        let query = 'UPDATE productos SET nombre = $1, descripcion = $2, precio_base = $3, porcentaje_descuento = $4, categoria = $5';
        let params = [nombre, descripcion, precio_base, porcentaje_descuento, categoria];
        
        if (req.file) {
            query += ', imagen_url = $6 WHERE id = $7 RETURNING *';
            params.push(`/uploads/${req.file.filename}`, id);
        } else {
            query += ' WHERE id = $6 RETURNING *';
            params.push(id);
        }

        const { rows } = await pool.query(query, params);
        if (rows.length === 0) return res.status(404).json({ error: "Producto no encontrado" });
        res.json(rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al actualizar el producto" });
    }
};

exports.delete = async (req, res) => {
    try {
        const { id } = req.params;
        const { rowCount } = await pool.query('DELETE FROM productos WHERE id = $1', [id]);
        if (rowCount === 0) return res.status(404).json({ error: "Producto no encontrado" });
        res.json({ message: "Producto eliminado correctamente" });
    } catch (error) {
        res.status(500).json({ error: "Error al eliminar el producto" });
    }
};
