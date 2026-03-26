const express = require('express');
const router = express.Router();
const { createCheckoutSession } = require('../controllers/paymentController');

// 🚩 CAMBIO: Cambia '/crear-sesion' por '/create-checkout-session'
router.post('/create-checkout-session', createCheckoutSession);

module.exports = router;