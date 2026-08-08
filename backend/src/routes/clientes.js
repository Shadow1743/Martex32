const express = require('express');
const router = express.Router();
const clientesController = require('../controllers/clientes.controller');
const { verificarCliente, verificarToken } = require('../middlewares/auth');

// Rutas públicas
router.post('/registro', clientesController.register);
router.post('/login', clientesController.login);
router.post('/auth/google', clientesController.googleLogin);
router.post('/auth/facebook', clientesController.facebookLogin);

// Rutas protegidas (requieren token de cliente)
router.get('/perfil', verificarCliente, clientesController.getProfile);
router.put('/perfil', verificarCliente, clientesController.updateProfile);

// Ruta protegida para admins (listar todos los clientes)
router.get('/', verificarToken, clientesController.getAll);

module.exports = router;
