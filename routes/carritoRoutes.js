const express = require('express');
const router = express.Router();
const { addToCart, getCart,deleteFromCart } = require('../controllers/carritoController');

router.get('/:usuario_id', getCart);
router.post('/agregar', addToCart);
router.delete('/:id', deleteFromCart);

module.exports = router;