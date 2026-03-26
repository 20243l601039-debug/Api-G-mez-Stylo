const { Router } = require('express');
const router = Router();

// 🚩 Paso 1: Importamos la nueva función 'updateUbicacion' (la crearemos en el siguiente paso)
const { 
    getUsuarios, 
    createUsuario, 
    deleteUsuario, 
    toggleUsuario,
    updateUbicacion // 👈 Añade esto
} = require('../controllers/usuarios.controller');

// Definimos las rutas
router.get('/usuarios', getUsuarios);
router.post('/usuarios', createUsuario);
router.delete('/usuarios/:id', deleteUsuario);
router.put('/usuarios/toggle/:id', toggleUsuario);

// 🚩 Paso 2: Definimos la ruta que Angular está buscando
// Esto habilitará: PUT https://.../api/usuarios/ubicacion
router.put('/usuarios/ubicacion', updateUbicacion); 

module.exports = router;