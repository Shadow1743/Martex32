const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const productosController = require('../controllers/productos.controller');

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

router.get('/', productosController.getAll);
router.get('/:id', productosController.getById);
router.post('/', upload.single('imagen'), productosController.create);
router.put('/:id', upload.single('imagen'), productosController.update);
router.delete('/:id', productosController.delete);

module.exports = router;
