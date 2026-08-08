const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');

// Ruta protegida por middleware en server.js
router.get('/stats', dashboardController.getStats);

module.exports = router;
