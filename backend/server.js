const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de Seguridad
// app.use(helmet({
//     contentSecurityPolicy: false,
// }));
app.use(cors());   // Permitir peticiones desde otros dominios

// Limitador de peticiones para evitar ataques de fuerza bruta en la API
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100 // límite de 100 peticiones por IP cada 15 minutos
});
app.use('/api', limiter);

// Middlewares para procesar JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
const productosRoutes = require('./src/routes/productos');
const pedidosRoutes = require('./src/routes/pedidos');
const medidasRoutes = require('./src/routes/medidas');
const authRoutes = require('./src/routes/auth');
const { verificarToken } = require('./src/middlewares/auth');

app.use('/api/auth', authRoutes);

// Proteger las rutas con middleware de autenticación (el middleware permite GET público de productos y POST público de pedidos)
app.use('/api/productos', verificarToken, productosRoutes);
app.use('/api/pedidos', verificarToken, pedidosRoutes);
app.use('/api/medidas', verificarToken, medidasRoutes);

// Ruta de prueba
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'API funcionando correctamente' });
});

// Servir imágenes estáticas
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Servir archivos estáticos del frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor de Martex corriendo en http://localhost:${PORT}`);
});
