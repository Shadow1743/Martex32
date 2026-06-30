const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'martex_super_secret_key_2026';

const verificarToken = (req, res, next) => {
    // Permitir acceso público a métodos GET en productos
    if (req.originalUrl.includes('/api/productos') && req.method === 'GET') {
        return next();
    }
    
    // Permitir acceso público a POST en pedidos (para que clientes puedan comprar)
    if (req.originalUrl.includes('/api/pedidos') && req.method === 'POST') {
        return next();
    }

    const authHeader = req.header('Authorization');
    if (!authHeader) {
        return res.status(401).json({ message: 'Acceso denegado. No se proporcionó token.' });
    }

    const token = authHeader.split(' ')[1]; // El formato es "Bearer <token>"
    if (!token) {
        return res.status(401).json({ message: 'Acceso denegado. Formato de token inválido.' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // Guardar información del usuario en la request
        next();
    } catch (error) {
        return res.status(400).json({ message: 'Token inválido o expirado.' });
    }
};

module.exports = { verificarToken };
