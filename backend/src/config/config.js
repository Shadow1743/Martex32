require('dotenv').config();

const config = {
    JWT_SECRET: process.env.JWT_SECRET || 'martex_super_secret_key_2026',
    JWT_EXPIRES_IN: '24h',
};

if (config.JWT_SECRET === 'martex_super_secret_key_2026' && process.env.NODE_ENV === 'production') {
    console.warn("⚠️ ADVERTENCIA DE SEGURIDAD: Estás usando el JWT_SECRET por defecto en producción. ¡Cámbialo inmediatamente en el archivo .env!");
}

module.exports = config;
