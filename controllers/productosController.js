const pool = require('../db');
// 1. IMPORTACIÓN ÚNICA (Solo aquí arriba)
const { enviarAlertaStock } = require('../services/twilioService');

// LEER (Con filtro opcional)
const getProductos = async (req, res) => {
    try {
        const { categoria_id } = req.query;
        let query = 'SELECT * FROM productos WHERE activo = true';
        let params = [];

        if (categoria_id) {
            query += ' AND categoria_id = $1';
            params.push(categoria_id);
        }
        query += ' ORDER BY id DESC';

        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener productos' });
    }
};

// CREAR
const createProducto = async (req, res) => {
    const { nombre, descripcion, precio, stock, categoria_id, imagen_url } = req.body;
    try {
        const query = `INSERT INTO productos (nombre, descripcion, precio, stock, categoria_id, imagen_url) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`;
        const result = await pool.query(query, [nombre, descripcion, precio, stock, categoria_id, imagen_url]);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al crear' });
    }
};

// EDITAR (Actualizado con lógica de stock)
const updateProducto = async (req, res) => {
    const { id } = req.params;
    const { nombre, descripcion, precio, stock, categoria_id, imagen_url } = req.body;
    try {
        const query = `
            UPDATE productos 
            SET nombre=$1, descripcion=$2, precio=$3, stock=$4, categoria_id=$5, imagen_url=$6 
            WHERE id=$7 RETURNING *`;
        
        const result = await pool.query(query, [nombre, descripcion, precio, stock, categoria_id, imagen_url, id]);
        const productoActualizado = result.rows[0];

        // Usamos la función que ya importamos arriba
        if (productoActualizado.stock < 5) {
            console.log(`⚠️ Alerta de stock bajo para: ${productoActualizado.nombre}`);
            enviarAlertaStock(productoActualizado.nombre, productoActualizado.stock).catch(e => 
                console.error("Error Twilio:", e.message)
            );
        }

        res.json(productoActualizado);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar' });
    }
};

// BORRAR (Soft Delete)
const deleteProducto = async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('UPDATE productos SET activo = false WHERE id = $1', [id]);
        res.json({ message: 'Producto eliminado' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al eliminar' });
    }
};

module.exports = { getProductos, createProducto, updateProducto, deleteProducto };