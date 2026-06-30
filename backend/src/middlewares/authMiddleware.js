const jwt = require('jsonwebtoken');

const verificarToken = (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) return res.status(401).json({ error: 'Acceso denegado' });

    try {
        const verified = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET || 'secreto_temporal');
        req.usuario = verified;
        next();
    } catch (err) {
        res.status(400).json({ error: 'Token no válido' });
    }
};

module.exports = verificarToken;
