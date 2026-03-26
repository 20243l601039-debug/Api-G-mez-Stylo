const pool = require('../db'); 

// --- OBTENER TODOS LOS USUARIOS ---
const getUsuarios = async (req, res) => {
  try {
    const response = await pool.query('SELECT * FROM usuarios ORDER BY id ASC');
    res.status(200).json(response.rows);
  } catch (error) {
    console.log("ERROR EN BD:", error);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
};

// --- CREAR UN USUARIO ---
const createUsuario = async (req, res) => {
  const { nombre_completo, email, password, rol, telefono } = req.body;
  try {
    const response = await pool.query(
      'INSERT INTO usuarios (nombre_completo, email, password_hash, rol, telefono) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [nombre_completo, email, password, rol, telefono]
    );
    res.status(201).json({
      message: 'Usuario creado exitosamente',
      body: { user: response.rows[0] }
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Error al crear usuario' });
  }
};

// --- ELIMINAR USUARIO ---
const deleteUsuario = async (req, res) => {
  const id = req.params.id;
  try {
    await pool.query('DELETE FROM usuarios WHERE id = $1', [id]);
    res.json(`Usuario ${id} eliminado correctamente`);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Error al eliminar usuario' });
  }
};

// --- ACTIVAR / DESACTIVAR USUARIO ---
const toggleUsuario = async (req, res) => {
  const id = req.params.id;
  const { activo } = req.body;
  try {
    await pool.query('UPDATE usuarios SET activo = $1 WHERE id = $2', [activo, id]);
    res.json(`Estado del usuario ${id} actualizado a ${activo}`);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Error al actualizar estado' });
  }
};

// --- 👇 NUEVA FUNCIÓN PARA GEOLOCALIZACIÓN 👇 ---
const updateUbicacion = async (req, res) => {
  const { usuario_id, direccion, lat, lng } = req.body;
  
  try {
    // 🚩 IMPORTANTE: Asegúrate de que tu tabla 'usuarios' tenga estas columnas
    const query = `
      UPDATE usuarios 
      SET direccion = $1, 
          latitud = $2, 
          longitud = $3 
      WHERE id = $4
    `;
    
    await pool.query(query, [direccion, lat, lng, usuario_id]);
    
    console.log(`✅ Ubicación actualizada para usuario ${usuario_id}`);
    res.json({ message: 'Ubicación guardada con éxito' });
  } catch (error) {
    console.error("ERROR AL GUARDAR UBICACIÓN:", error);
    res.status(500).json({ error: 'Error al actualizar ubicación en la base de datos' });
  }
};

// 🚩 ACTUALIZADO: Exportamos la nueva función
module.exports = {
  getUsuarios,
  createUsuario,
  deleteUsuario,
  toggleUsuario,
  updateUbicacion // 👈 No olvides esto
};