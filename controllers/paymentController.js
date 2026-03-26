const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const pool = require('../db');

const createCheckoutSession = async (req, res) => {
    const { usuario_id } = req.body;

    try {
        const cartItems = await pool.query(
            `SELECT p.nombre, p.precio, ic.cantidad 
             FROM items_carrito ic 
             JOIN productos p ON ic.producto_id = p.id 
             JOIN carrito c ON ic.carrito_id = c.id 
             WHERE c.usuario_id = $1`,
            [usuario_id]
        );

        if (cartItems.rows.length === 0) {
            return res.status(400).json({ error: 'Carrito vacío' });
        }

        const line_items = cartItems.rows.map(item => ({
            price_data: {
                currency: 'mxn',
                product_data: { name: item.nombre },
                unit_amount: Math.round(item.precio * 100),
            },
            quantity: item.cantidad,
        }));

        // 🚩 CONFIGURACIÓN DE URLS DE RETORNO 🚩
        // Si usas Ngrok, pon tu URL de Ngrok de Angular aquí abajo
        const FRONTEND_URL = 'http://localhost:4200'; 

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items,
            mode: 'payment',
            // 🌟 Al pagar, regresa a tu carrito con la señal ?success=true
            success_url: `${FRONTEND_URL}/carrito?success=true`, 
            cancel_url: `${FRONTEND_URL}/carrito?canceled=true`,
        });

        res.json({ url: session.url, id: session.id });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error creando sesión de pago' });
    }
};

module.exports = { createCheckoutSession };