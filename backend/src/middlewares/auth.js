const jwt = require('jsonwebtoken');
const config = require('../config/config');

// Middleware para verificar token de admin/empleado (sistema de gestión)
const verificarToken = (req, res, next) => {
    // Permitir acceso público a métodos GET en productos
    if (req.originalUrl.includes('/api/productos') && req.method === 'GET') {
        return next();
    }
    
    // Permitir acceso público a POST en pedidos (para que clientes puedan comprar)
    if (req.originalUrl.includes('/api/pedidos') && req.method === 'POST') {
        // Intentar extraer info del cliente si tiene token (para vincular el pedido)
        const authHeader = req.header('Authorization');
        if (authHeader) {
            try {
                const token = authHeader.split(' ')[1];
                const decoded = jwt.verify(token, config.JWT_SECRET);
                if (decoded.tipo === 'cliente') {
                    req.cliente = decoded;
                } else {
                    req.user = decoded;
                }
            } catch (e) {
                // Token inválido, continuar sin info de usuario (compra anónima)
            }
        }
        return next();
    }
    
    // Permitir acceso público a GET de un pedido en específico (para la factura)
    if (req.originalUrl.match(/^\/api\/pedidos\/\d+/) && req.method === 'GET') {
        return next();
    }

    // Permitir acceso público a rutas de reseñas GET
    if (req.originalUrl.includes('/api/resenas') && req.method === 'GET') {
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
        const decoded = jwt.verify(token, config.JWT_SECRET);
        req.user = decoded; // Guardar información del usuario en la request
        next();
    } catch (error) {
        return res.status(400).json({ message: 'Token inválido o expirado.' });
    }
};

// Middleware para verificar token de cliente (landing page / tienda)
const verificarCliente = (req, res, next) => {
    const authHeader = req.header('Authorization');
    if (!authHeader) {
        return res.status(401).json({ message: 'Acceso denegado. Inicia sesión para continuar.' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Formato de token inválido.' });
    }

    try {
        const decoded = jwt.verify(token, config.JWT_SECRET);
        if (decoded.tipo !== 'cliente') {
            return res.status(403).json({ message: 'Acceso solo para clientes registrados.' });
        }
        req.cliente = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Sesión expirada. Inicia sesión nuevamente.' });
    }
};

// Middleware RBAC genérico — verificar que el usuario tenga uno de los roles permitidos
const verificarRol = (rolesPermitidos) => {
    return (req, res, next) => {
        if (!req.user || !req.user.rol) {
            return res.status(403).json({ message: 'No tienes permisos para realizar esta acción.' });
        }

        if (!rolesPermitidos.includes(req.user.rol)) {
            return res.status(403).json({ message: `Se requiere uno de los siguientes roles: ${rolesPermitidos.join(', ')}` });
        }

        next();
    };
};

module.exports = { verificarToken, verificarCliente, verificarRol };
