const express = require('express');
const router = express.Router();
const { getProductos, createProducto, updateProducto, deleteProducto } = require('../controllers/productosController');

router.get('/', getProductos);
router.post('/', createProducto);
router.put('/:id', updateProducto);  // <--- NUEVA
router.delete('/:id', deleteProducto); // <--- NUEVA

module.exports = router;