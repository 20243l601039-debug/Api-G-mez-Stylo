const pool = require('../db');

// AGREGAR AL CARRITO
const addToCart = async (req, res) => {
    const { usuario_id, producto_id, cantidad } = req.body;
    try {
        let carritoRes = await pool.query('SELECT id FROM carrito WHERE usuario_id = $1', [usuario_id]);
        let carrito_id;

        if (carritoRes.rows.length === 0) {
            const newCarrito = await pool.query('INSERT INTO carrito (usuario_id) VALUES ($1) RETURNING id', [usuario_id]);
            carrito_id = newCarrito.rows[0].id;
        } else {
            carrito_id = carritoRes.rows[0].id;
        }

        const itemExistente = await pool.query(
            'SELECT * FROM items_carrito WHERE carrito_id = $1 AND producto_id = $2',
            [carrito_id, producto_id]
        );

        if (itemExistente.rows.length > 0) {
            await pool.query(
                'UPDATE items_carrito SET cantidad = cantidad + $1 WHERE carrito_id = $2 AND producto_id = $3',
                [cantidad, carrito_id, producto_id]
            );
        } else {
            await pool.query(
                'INSERT INTO items_carrito (carrito_id, producto_id, cantidad) VALUES ($1, $2, $3)',
                [carrito_id, producto_id, cantidad]
            );
        }
        res.json({ message: 'Producto agregado al carrito' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al agregar al carrito' });
    }
};

// OBTENER CARRITO
const getCart = async (req, res) => {
    const { usuario_id } = req.params;
    try {
        const query = `
            SELECT 
                ic.id AS item_id, 
                p.id AS producto_id, 
                p.nombre, 
                p.precio, 
                p.imagen_url, 
                ic.cantidad, 
                (p.precio * ic.cantidad) AS subtotal
            FROM items_carrito ic
            JOIN carrito c ON ic.carrito_id = c.id
            JOIN productos p ON ic.producto_id = p.id
            WHERE c.usuario_id = $1
        `;
        const result = await pool.query(query, [usuario_id]);
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error obteniendo carrito' });
    }
};

// ELIMINAR DEL CARRITO
const deleteFromCart = async (req, res) => {
    const { id } = req.params; 
    try {
        await pool.query('DELETE FROM items_carrito WHERE id = $1', [id]);
        res.json({ message: 'Producto eliminado del carrito' });
    } catch (error) {
        console.error("Error al borrar de la DB:", error);
        res.status(500).json({ error: 'No se pudo eliminar el item' });
    }
};

module.exports = { 
    addToCart, 
    getCart, 
    deleteFromCart 
};