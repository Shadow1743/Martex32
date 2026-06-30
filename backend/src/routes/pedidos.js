const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const pedidosController = require('../controllers/pedidos.controller');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../../uploads/'));
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

router.get('/', pedidosController.getAll);
router.post('/', upload.single('comprobante'), pedidosController.create);
router.put('/:id/estado', pedidosController.updateStatus);

module.exports = router;

