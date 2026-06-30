const pool = require('../config/db');

exports.getAll = async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT * FROM medidas ORDER BY creado_en DESC');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener las medidas" });
    }
};

exports.create = async (req, res) => {
    try {
        const { 
            cliente_nombre, cliente_telefono, tipo_pieza,
            hombro, busto, cintura_sup, cadera_sup, largo_cintura, largo_manga, grosor_manga, largo_total_sup,
            cintura_inf, cadera_inf, largo_rodilla, largo_total_inf, tiro, grosor_pierna,
            precio
        } = req.body;

        const { rows } = await pool.query(`
            INSERT INTO medidas (
                cliente_nombre, cliente_telefono, tipo_pieza,
                hombro, busto, cintura_sup, cadera_sup, largo_cintura, largo_manga, grosor_manga, largo_total_sup,
                cintura_inf, cadera_inf, largo_rodilla, largo_total_inf, tiro, grosor_pierna,
                precio
            ) VALUES (
                $1, $2, $3,
                $4, $5, $6, $7, $8, $9, $10, $11,
                $12, $13, $14, $15, $16, $17,
                $18
            ) RETURNING *
        `, [
            cliente_nombre, cliente_telefono, tipo_pieza,
            hombro || null, busto || null, cintura_sup || null, cadera_sup || null, largo_cintura || null, largo_manga || null, grosor_manga || null, largo_total_sup || null,
            cintura_inf || null, cadera_inf || null, largo_rodilla || null, largo_total_inf || null, tiro || null, grosor_pierna || null,
            precio || null
        ]);
        
        res.status(201).json(rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al crear la medida" });
    }
};

exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            cliente_nombre, cliente_telefono, tipo_pieza,
            hombro, busto, cintura_sup, cadera_sup, largo_cintura, largo_manga, grosor_manga, largo_total_sup,
            cintura_inf, cadera_inf, largo_rodilla, largo_total_inf, tiro, grosor_pierna,
            precio, estado
        } = req.body;

        // Construir dinámicamente los campos a actualizar
        const campos = [];
        const valores = [];
        let idx = 1;

        const addField = (name, value) => {
            if (value !== undefined) {
                campos.push(`${name} = $${idx}`);
                valores.push(value === '' ? null : value);
                idx++;
            }
        };

        addField('cliente_nombre', cliente_nombre);
        addField('cliente_telefono', cliente_telefono);
        addField('tipo_pieza', tipo_pieza);
        addField('hombro', hombro);
        addField('busto', busto);
        addField('cintura_sup', cintura_sup);
        addField('cadera_sup', cadera_sup);
        addField('largo_cintura', largo_cintura);
        addField('largo_manga', largo_manga);
        addField('grosor_manga', grosor_manga);
        addField('largo_total_sup', largo_total_sup);
        addField('cintura_inf', cintura_inf);
        addField('cadera_inf', cadera_inf);
        addField('largo_rodilla', largo_rodilla);
        addField('largo_total_inf', largo_total_inf);
        addField('tiro', tiro);
        addField('grosor_pierna', grosor_pierna);
        addField('precio', precio);
        addField('estado', estado);

        if (campos.length === 0) {
            return res.status(400).json({ error: "No se proporcionaron campos para actualizar" });
        }

        valores.push(id);
        const query = `UPDATE medidas SET ${campos.join(', ')} WHERE id = $${idx} RETURNING *`;
        
        const { rows } = await pool.query(query, valores);
        
        if (rows.length === 0) return res.status(404).json({ error: "Medida no encontrada" });
        res.json(rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al actualizar la medida" });
    }
};

exports.delete = async (req, res) => {
    try {
        const { id } = req.params;
        const { rowCount } = await pool.query('DELETE FROM medidas WHERE id = $1', [id]);
        if (rowCount === 0) return res.status(404).json({ error: "Medida no encontrada" });
        res.json({ message: "Medida eliminada" });
    } catch (error) {
        res.status(500).json({ error: "Error al eliminar la medida" });
    }
};
