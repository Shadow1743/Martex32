const express = require('express');
const router = express.Router();
const perfilesMedidasController = require('../controllers/perfiles-medidas.controller');
const { verificarCliente } = require('../middlewares/auth');

// Todas las rutas requieren autenticación de cliente
router.use(verificarCliente);

router.get('/', perfilesMedidasController.getAll);
router.post('/', perfilesMedidasController.create);
router.put('/:id', perfilesMedidasController.update);
router.delete('/:id', perfilesMedidasController.delete);

module.exports = router;
