const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

const corsOptions = {
    origin: function (origin, callback) {
        // Permitir peticiones sin origin (como las de Postman o del mismo server), localhost, cualquier IP de la red local, y dominios de localtunnel (*.loca.lt)
        if (!origin || origin.includes('localhost') || origin.includes('127.0.0.1') || origin.startsWith('http://192.168.') || origin.includes('loca.lt') || (process.env.NODE_ENV === 'production' && origin.includes('tudominio.com'))) {
            callback(null, true);
        } else {
            callback(new Error('No permitido por CORS'));
        }
    },
    optionsSuccessStatus: 200
};

app.use(helmet({
    contentSecurityPolicy: false,
}));
app.use(cors(corsOptions));
app.use(compression());

// Limitador de peticiones para evitar ataques de fuerza bruta en la API
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100 // límite de 100 peticiones por IP cada 15 minutos
});
app.use('/api', limiter);

// Rate limiting estricto para login (anti fuerza bruta)
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 10, // máximo 10 intentos de login por IP
    message: { message: 'Demasiados intentos de inicio de sesión. Intenta de nuevo en 15 minutos.' }
});
app.use('/api/auth/login', loginLimiter);
app.use('/api/clientes/login', loginLimiter);

// Middlewares para procesar JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
const productosRoutes = require('./src/routes/productos');
const pedidosRoutes = require('./src/routes/pedidos');
const medidasRoutes = require('./src/routes/medidas');
const authRoutes = require('./src/routes/auth');
const dashboardRoutes = require('./src/routes/dashboard');
const clientesRoutes = require('./src/routes/clientes');
const favoritosRoutes = require('./src/routes/favoritos');
const resenasRoutes = require('./src/routes/resenas');
// const perfilesMedidasRoutes = require('./src/routes/perfiles-medidas'); // Funcionalidad descartada
const { verificarToken } = require('./src/middlewares/auth');

// Rutas públicas de autenticación
app.use('/api/auth', authRoutes);
app.use('/api/clientes', clientesRoutes);

// Rutas de reseñas (GET público, POST/DELETE protegido internamente)
app.use('/api/resenas', resenasRoutes);

// Rutas protegidas para clientes autenticados (protección interna en cada ruta)
app.use('/api/favoritos', favoritosRoutes);
// app.use('/api/perfiles-medidas', perfilesMedidasRoutes); // Funcionalidad descartada

// Proteger las rutas con middleware de autenticación (el middleware permite GET público de productos y POST público de pedidos)
app.use('/api/productos', verificarToken, productosRoutes);
app.use('/api/pedidos', verificarToken, pedidosRoutes);
app.use('/api/medidas', verificarToken, medidasRoutes);
app.use('/api/dashboard', verificarToken, dashboardRoutes);

// Ruta de prueba
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'API funcionando correctamente' });
});

// Servir imágenes estáticas (cache 7 días)
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
    maxAge: '7d',
    immutable: true
}));

// Servir archivos estáticos del frontend (cache 1 día)
app.use(express.static(path.join(__dirname, '../frontend'), {
    maxAge: '1d'
}));

// Redirigir la raíz al catálogo
app.get('/', (req, res) => {
    res.redirect('/catalogo/index.html');
});

// Ruta catch-all para 404 en API
app.use('/api', (req, res) => {
    res.status(404).json({ error: 'Endpoint no encontrado' });
});

// Middleware Global de Errores
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        error: 'Error interno del servidor',
        ...(process.env.NODE_ENV !== 'production' && { details: err.message })
    });
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor de Martex corriendo en http://localhost:${PORT}`);
});
