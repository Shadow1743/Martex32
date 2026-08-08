const pool = require('../config/db');

// Obtener todos los perfiles de medidas del cliente
exports.getAll = async (req, res) => {
    try {
        const { rows } = await pool.query(
            'SELECT * FROM perfiles_medidas WHERE cliente_id = $1 ORDER BY creado_en DESC',
            [req.cliente.id]
        );
        res.json(rows);
    } catch (error) {
        console.error('Error obteniendo perfiles de medidas:', error);
        res.status(500).json({ error: 'Error al obtener los perfiles de medidas' });
    }
};

// Crear perfil de medidas
exports.create = async (req, res) => {
    const {
        nombre_perfil,
        hombro, busto, cintura_sup, cadera_sup, largo_cintura, largo_manga, grosor_manga, largo_total_sup,
        cintura_inf, cadera_inf, largo_rodilla, largo_total_inf, tiro, grosor_pierna
    } = req.body;

    if (!nombre_perfil) {
        return res.status(400).json({ error: 'El nombre del perfil es requerido' });
    }

    try {
        // Limitar a 5 perfiles por cliente
        const { rows: countRows } = await pool.query(
            'SELECT COUNT(*) FROM perfiles_medidas WHERE cliente_id = $1',
            [req.cliente.id]
        );
        if (parseInt(countRows[0].count) >= 5) {
            return res.status(400).json({ error: 'Máximo 5 perfiles de medidas permitidos' });
        }

        const { rows } = await pool.query(`
            INSERT INTO perfiles_medidas (
                cliente_id, nombre_perfil,
                hombro, busto, cintura_sup, cadera_sup, largo_cintura, largo_manga, grosor_manga, largo_total_sup,
                cintura_inf, cadera_inf, largo_rodilla, largo_total_inf, tiro, grosor_pierna
            ) VALUES (
                $1, $2,
                $3, $4, $5, $6, $7, $8, $9, $10,
                $11, $12, $13, $14, $15, $16
            ) RETURNING *
        `, [
            req.cliente.id, nombre_perfil.trim(),
            hombro || null, busto || null, cintura_sup || null, cadera_sup || null,
            largo_cintura || null, largo_manga || null, grosor_manga || null, largo_total_sup || null,
            cintura_inf || null, cadera_inf || null, largo_rodilla || null, largo_total_inf || null,
            tiro || null, grosor_pierna || null
        ]);

        res.status(201).json(rows[0]);
    } catch (error) {
        console.error('Error creando perfil de medidas:', error);
        res.status(500).json({ error: 'Error al crear el perfil de medidas' });
    }
};

// Actualizar perfil de medidas
exports.update = async (req, res) => {
    const { id } = req.params;
    const {
        nombre_perfil,
        hombro, busto, cintura_sup, cadera_sup, largo_cintura, largo_manga, grosor_manga, largo_total_sup,
        cintura_inf, cadera_inf, largo_rodilla, largo_total_inf, tiro, grosor_pierna
    } = req.body;

    try {
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

        addField('nombre_perfil', nombre_perfil);
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

        if (campos.length === 0) {
            return res.status(400).json({ error: 'No se proporcionaron campos para actualizar' });
        }

        campos.push(`actualizado_en = CURRENT_TIMESTAMP`);
        valores.push(req.cliente.id);
        valores.push(id);

        const query = `UPDATE perfiles_medidas SET ${campos.join(', ')} WHERE cliente_id = $${idx} AND id = $${idx + 1} RETURNING *`;
        const { rows } = await pool.query(query, valores);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Perfil de medidas no encontrado' });
        }

        res.json(rows[0]);
    } catch (error) {
        console.error('Error actualizando perfil de medidas:', error);
        res.status(500).json({ error: 'Error al actualizar el perfil de medidas' });
    }
};

// Eliminar perfil de medidas
exports.delete = async (req, res) => {
    const { id } = req.params;

    try {
        const { rowCount } = await pool.query(
            'DELETE FROM perfiles_medidas WHERE id = $1 AND cliente_id = $2',
            [id, req.cliente.id]
        );

        if (rowCount === 0) {
            return res.status(404).json({ error: 'Perfil de medidas no encontrado' });
        }

        res.json({ message: 'Perfil de medidas eliminado' });
    } catch (error) {
        console.error('Error eliminando perfil de medidas:', error);
        res.status(500).json({ error: 'Error al eliminar el perfil de medidas' });
    }
};
