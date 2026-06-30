const express = require('express');
const router = express.Router();
const medidasController = require('../controllers/medidas.controller');

router.get('/', medidasController.getAll);
router.post('/', medidasController.create);
router.put('/:id', medidasController.update);
router.delete('/:id', medidasController.delete);

module.exports = router;
