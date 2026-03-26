const pool = require('../db');
const { enviarAlertaStock } = require('../services/twilioService');

// 1. CREAR PEDIDO (Con resta de stock y Twilio)
const crearPedido = async (req, res) => {
    const { usuario_id, direccion_envio, metodo_pago } = req.body;
    const client = await pool.connect();

    try {
        await client.query('BEGIN');
        console.log(`📦 Procesando pedido para usuario: ${usuario_id}`);

        // Verificar usuario
        const userCheck = await client.query('SELECT id FROM usuarios WHERE id = $1', [usuario_id]);
        if (userCheck.rows.length === 0) {
            await client.query(
                `INSERT INTO usuarios (id, nombre_completo, email, password_hash, rol) 
                 VALUES ($1, 'Usuario Rescate', 'rescate_${Date.now()}@test.com', 'pass123', 'cliente')`,
                [usuario_id]
            );
        }

        // Obtener items del carrito
        const cartItems = await client.query(
            `SELECT ic.producto_id, ic.cantidad, p.nombre, p.precio, p.stock 
             FROM items_carrito ic 
             JOIN productos p ON ic.producto_id = p.id 
             JOIN carrito c ON ic.carrito_id = c.id 
             WHERE c.usuario_id = $1`,
            [usuario_id]
        );

        if (cartItems.rows.length === 0) throw new Error('El carrito está vacío.');

        const total = cartItems.rows.reduce((acc, item) => acc + (Number(item.precio) * item.cantidad), 0);

        // Insertar Pedido
        const pedidoRes = await client.query(
            'INSERT INTO pedidos (usuario_id, total, direccion_envio, metodo_pago, estado) VALUES ($1, $2, $3, $4, $5) RETURNING id',
            [usuario_id, total, direccion_envio || "Dirección App", metodo_pago, 'pagado']
        );
        const pedido_id = pedidoRes.rows[0].id;

        // Mover items y ACTUALIZAR STOCK
        for (const item of cartItems.rows) {
            await client.query(
                'INSERT INTO detalles_pedido (pedido_id, producto_id, cantidad, precio_unitario) VALUES ($1, $2, $3, $4)',
                [pedido_id, item.producto_id, item.cantidad, item.precio]
            );

            const stockRes = await client.query(
                'UPDATE productos SET stock = stock - $1 WHERE id = $2 RETURNING stock, nombre',
                [parseInt(item.cantidad), item.producto_id]
            );

            if (stockRes.rowCount > 0) {
                const prod = stockRes.rows[0];
                console.log(`✅ Stock restado: ${prod.nombre} (Nuevo stock: ${prod.stock})`);
                if (prod.stock < 5) {
                    enviarAlertaStock(prod.nombre, prod.stock).catch(e => console.log("Twilio Error:", e.message));
                }
            }
        }

        // Vaciar carrito
        const carritoRes = await client.query('SELECT id FROM carrito WHERE usuario_id = $1', [usuario_id]);
        if (carritoRes.rows.length > 0) {
             await client.query('DELETE FROM items_carrito WHERE carrito_id = $1', [carritoRes.rows[0].id]);
        }

        await client.query('COMMIT');
        res.status(201).json({ message: 'Pedido creado exitosamente', pedido_id });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error("❌ Error:", error.message);
        res.status(500).json({ error: error.message });
    } finally {
        client.release();
    }
};

// 2. LISTAR PEDIDOS (La que te faltaba)
const getPedidos = async (req, res) => {
    try {
        const query = `
            SELECT p.*, u.nombre_completo 
            FROM pedidos p 
            JOIN usuarios u ON p.usuario_id = u.id 
            ORDER BY p.fecha_pedido DESC
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener pedidos' });
    }
};

// 3. ACTUALIZAR ESTADO (La otra que te faltaba)
const updateEstadoPedido = async (req, res) => {
    const { id } = req.params;
    const { estado } = req.body;
    try {
        await pool.query('UPDATE pedidos SET estado = $1 WHERE id = $2', [estado, id]);
        res.json({ message: 'Estado actualizado' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar estado' });
    }
};

// EXPORTAR TODAS
module.exports = { crearPedido, getPedidos, updateEstadoPedido };