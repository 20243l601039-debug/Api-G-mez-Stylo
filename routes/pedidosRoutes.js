const express = require('express');
const router = express.Router(); // <--- ESTO FALTABA
const { crearPedido, getPedidos, updateEstadoPedido } = require('../controllers/pedidosController');

// Definición de rutas
router.post('/', crearPedido);          // Crear compra
router.get('/', getPedidos);            // Ver historial (Admin)
router.put('/:id', updateEstadoPedido); // Actualizar estado (Admin)

module.exports = router;