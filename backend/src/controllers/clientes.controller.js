const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config/config');
const { OAuth2Client } = require('google-auth-library');
const axios = require('axios');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);


// Registro de cliente
exports.register = async (req, res) => {
    const { nombre, email, password, telefono } = req.body;

    if (!nombre || !email || !password) {
        return res.status(400).json({ message: 'Nombre, email y contraseña son requeridos' });
    }

    if (password.length < 6) {
        return res.status(400).json({ message: 'La contraseña debe tener al menos 6 caracteres' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'El formato del email no es válido' });
    }

    try {
        // Verificar si el email ya está registrado
        const existingClient = await pool.query('SELECT id FROM clientes WHERE email = $1', [email.toLowerCase()]);
        if (existingClient.rows.length > 0) {
            return res.status(409).json({ message: 'Este correo electrónico ya está registrado' });
        }

        // Hash de contraseña
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        const { rows } = await pool.query(
            'INSERT INTO clientes (nombre, email, password_hash, telefono) VALUES ($1, $2, $3, $4) RETURNING id, nombre, email, telefono, creado_en',
            [nombre.trim(), email.toLowerCase().trim(), password_hash, telefono || null]
        );

        const cliente = rows[0];

        // Generar token
        const token = jwt.sign(
            { id: cliente.id, email: cliente.email, tipo: 'cliente' },
            config.JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Intentar enviar email de bienvenida
        try {
            const emailService = require('../services/email.service');
            await emailService.enviarBienvenida(cliente);
        } catch (e) {
            console.log('Email de bienvenida no enviado (SMTP no configurado):', e.message);
        }

        res.status(201).json({
            message: 'Cuenta creada exitosamente',
            token,
            cliente: {
                id: cliente.id,
                nombre: cliente.nombre,
                email: cliente.email,
                telefono: cliente.telefono
            }
        });

    } catch (error) {
        console.error('Error en registro de cliente:', error);
        res.status(500).json({ message: 'Error en el servidor al registrar' });
    }
};

// Login de cliente
exports.login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email y contraseña son requeridos' });
    }

    try {
        const result = await pool.query('SELECT * FROM clientes WHERE email = $1', [email.toLowerCase()]);
        const cliente = result.rows[0];

        if (!cliente) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        const validPassword = await bcrypt.compare(password, cliente.password_hash);
        if (!validPassword) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        const token = jwt.sign(
            { id: cliente.id, email: cliente.email, tipo: 'cliente' },
            config.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            token,
            cliente: {
                id: cliente.id,
                nombre: cliente.nombre,
                email: cliente.email,
                telefono: cliente.telefono
            }
        });

    } catch (error) {
        console.error('Error en login de cliente:', error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
};

// Obtener perfil del cliente autenticado
exports.getProfile = async (req, res) => {
    try {
        const { rows } = await pool.query(
            'SELECT id, nombre, email, telefono, avatar_url, creado_en FROM clientes WHERE id = $1',
            [req.cliente.id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Cliente no encontrado' });
        }

        res.json(rows[0]);
    } catch (error) {
        console.error('Error obteniendo perfil:', error);
        res.status(500).json({ message: 'Error al obtener el perfil' });
    }
};

// Actualizar perfil del cliente
exports.updateProfile = async (req, res) => {
    const { nombre, telefono } = req.body;

    try {
        const campos = [];
        const valores = [];
        let idx = 1;

        if (nombre !== undefined) {
            campos.push(`nombre = $${idx}`);
            valores.push(nombre.trim());
            idx++;
        }
        if (telefono !== undefined) {
            campos.push(`telefono = $${idx}`);
            valores.push(telefono || null);
            idx++;
        }

        if (campos.length === 0) {
            return res.status(400).json({ message: 'No se proporcionaron datos para actualizar' });
        }

        campos.push(`actualizado_en = CURRENT_TIMESTAMP`);
        valores.push(req.cliente.id);

        const query = `UPDATE clientes SET ${campos.join(', ')} WHERE id = $${idx} RETURNING id, nombre, email, telefono, avatar_url`;
        const { rows } = await pool.query(query, valores);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Cliente no encontrado' });
        }

        res.json({ message: 'Perfil actualizado', cliente: rows[0] });
    } catch (error) {
        console.error('Error actualizando perfil:', error);
        res.status(500).json({ message: 'Error al actualizar el perfil' });
    }
};

// Obtener todos los clientes (solo admin)
exports.getAll = async (req, res) => {
    try {
        const { rows } = await pool.query(
            'SELECT id, nombre, email, telefono, creado_en FROM clientes ORDER BY creado_en DESC'
        );
        res.json(rows);
    } catch (error) {
        console.error('Error obteniendo clientes:', error);
        res.status(500).json({ message: 'Error al obtener los clientes' });
    }
};

// Login con Google
exports.googleLogin = async (req, res) => {
    const { token } = req.body;
    
    if (!token) {
        return res.status(400).json({ message: 'Token de Google requerido' });
    }

    if (process.env.NODE_ENV === 'development' && token === 'mock_google_token') {
        return await handleSocialLogin(res, 'demo@google.com', 'Usuario Google Demo', null, 'google_id', 'mock_google_123');
    }

    try {
        const ticket = await googleClient.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        
        const payload = ticket.getPayload();
        const { sub: googleId, email, name, picture } = payload;
        
        await handleSocialLogin(res, email, name, picture, 'google_id', googleId);
    } catch (error) {
        console.error('Error verificando token de Google:', error);
        res.status(401).json({ message: 'Autenticación con Google fallida' });
    }
};

// Login con Facebook
exports.facebookLogin = async (req, res) => {
    const { accessToken } = req.body;
    
    if (!accessToken) {
        return res.status(400).json({ message: 'Access Token de Facebook requerido' });
    }

    if (process.env.NODE_ENV === 'development' && accessToken === 'mock_facebook_token') {
        return await handleSocialLogin(res, 'demo@facebook.com', 'Usuario Facebook Demo', null, 'facebook_id', 'mock_facebook_123');
    }

    try {
        const { data } = await axios.get(`https://graph.facebook.com/me?fields=id,name,email,picture.type(large)&access_token=${accessToken}`);
        
        const facebookId = data.id;
        const email = data.email;
        const name = data.name;
        const picture = data.picture?.data?.url;
        
        if (!email) {
            return res.status(400).json({ message: 'Tu cuenta de Facebook no tiene un email asociado' });
        }

        await handleSocialLogin(res, email, name, picture, 'facebook_id', facebookId);
    } catch (error) {
        console.error('Error verificando token de Facebook:', error);
        res.status(401).json({ message: 'Autenticación con Facebook fallida' });
    }
};

// Helper genérico para login social
async function handleSocialLogin(res, email, name, picture, providerIdField, providerId) {
    try {
        email = email.toLowerCase().trim();
        
        // Buscar cliente por email
        const result = await pool.query('SELECT * FROM clientes WHERE email = $1', [email]);
        let cliente = result.rows[0];

        if (cliente) {
            // Cliente existe, vincular providerId si no está vinculado
            if (!cliente[providerIdField]) {
                await pool.query(
                    `UPDATE clientes SET ${providerIdField} = $1, auth_provider = $2 WHERE id = $3`,
                    [providerId, providerIdField.split('_')[0], cliente.id]
                );
            }
        } else {
            // Cliente no existe, crearlo
            const { rows } = await pool.query(
                `INSERT INTO clientes (nombre, email, avatar_url, ${providerIdField}, auth_provider) 
                 VALUES ($1, $2, $3, $4, $5) RETURNING *`,
                [name, email, picture, providerId, providerIdField.split('_')[0]]
            );
            cliente = rows[0];
            
            // Enviar email de bienvenida
            try {
                const emailService = require('../services/email.service');
                await emailService.enviarBienvenida(cliente);
            } catch (e) {
                console.log('Email de bienvenida no enviado:', e.message);
            }
        }

        // Generar JWT
        const jwtToken = jwt.sign(
            { id: cliente.id, email: cliente.email, tipo: 'cliente' },
            config.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            token: jwtToken,
            cliente: {
                id: cliente.id,
                nombre: cliente.nombre,
                email: cliente.email,
                telefono: cliente.telefono,
                avatar_url: cliente.avatar_url || picture
            }
        });
    } catch (error) {
        console.error('Error en handleSocialLogin:', error);
        res.status(500).json({ message: 'Error interno en login social' });
    }
}
