const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'martex_super_secret_key_2026';

const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Buscar el usuario
        const result = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
        let user = result.rows[0];

        // Si no existe, y es el default (admin@martex.com / admin123), crearlo automáticamente
        if (!user && email === 'admin@martex.com' && password === 'admin123') {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('admin123', salt);
            
            const insertResult = await pool.query(
                'INSERT INTO usuarios (nombre, email, password_hash, rol) VALUES ($1, $2, $3, $4) RETURNING *',
                ['Admin Martex', 'admin@martex.com', hashedPassword, 'admin']
            );
            user = insertResult.rows[0];
            console.log("Usuario admin@martex.com creado automáticamente.");
        }

        if (!user) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        // Verificar contraseña
        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        // Generar token
        const token = jwt.sign(
            { id: user.id, rol: user.rol, email: user.email },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                nombre: user.nombre,
                email: user.email,
                rol: user.rol
            }
        });

    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
};

module.exports = {
    login
};
