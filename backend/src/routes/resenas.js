const express = require('express');
const router = express.Router();
const resenasController = require('../controllers/resenas.controller');
const { verificarCliente } = require('../middlewares/auth');

// Rutas públicas
router.get('/promedios', resenasController.getPromedios);
router.get('/:productoId', resenasController.getByProducto);

// Rutas protegidas (requieren auth de cliente)
router.post('/:productoId', verificarCliente, resenasController.create);
router.delete('/:id', verificarCliente, resenasController.delete);

module.exports = router;
