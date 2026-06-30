const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

// Rutas públicas
router.post('/login', authController.login);

module.exports = router;
