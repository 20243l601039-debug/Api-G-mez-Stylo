const pool = require('../db');

// LEER
const getCategorias = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM categorias WHERE activo = true ORDER BY id ASC');
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener categorías' });
    }
};

// CREAR
const createCategoria = async (req, res) => {
    const { nombre, imagen_url } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO categorias (nombre, imagen_url) VALUES ($1, $2) RETURNING *',
            [nombre, imagen_url]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al crear categoría' });
    }
};

// ACTUALIZAR
const updateCategoria = async (req, res) => {
    const { id } = req.params;
    const { nombre, imagen_url } = req.body;
    try {
        const result = await pool.query(
            'UPDATE categorias SET nombre = $1, imagen_url = $2 WHERE id = $3 RETURNING *',
            [nombre, imagen_url, id]
        );
        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar categoría' });
    }
};

// BORRAR (Soft Delete)
const deleteCategoria = async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('UPDATE categorias SET activo = false WHERE id = $1', [id]);
        res.json({ message: 'Categoría eliminada' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al eliminar categoría' });
    }
};

module.exports = { getCategorias, createCategoria, updateCategoria, deleteCategoria };