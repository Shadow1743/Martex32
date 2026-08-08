const express = require('express');
const router = express.Router();
const favoritosController = require('../controllers/favoritos.controller');
const { verificarCliente } = require('../middlewares/auth');

// Todas las rutas requieren autenticación de cliente
router.use(verificarCliente);

router.get('/', favoritosController.getAll);
router.post('/check-batch', favoritosController.checkBatch);
router.post('/:productoId', favoritosController.toggle);
router.get('/:productoId/check', favoritosController.check);

module.exports = router;
