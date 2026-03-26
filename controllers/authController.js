const pool = require('../db');
const bcrypt = require('bcryptjs');

// REGISTRO
const register = async (req, res) => {
    const { nombre, email, password } = req.body;

    try {
        // 1. Verificar si el usuario ya existe
        const userExist = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
        if (userExist.rows.length > 0) {
            return res.status(400).json({ error: 'El correo ya está registrado' });
        }

        // 2. Encriptar contraseña (HASH)
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // 3. Guardar en BD
        const newUser = await pool.query(
            'INSERT INTO usuarios (nombre_completo, email, password_hash, rol) VALUES ($1, $2, $3, $4) RETURNING id, nombre_completo, email',
            [nombre, email, passwordHash, 'cliente']
        );

        res.status(201).json({ message: 'Usuario registrado', user: newUser.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
};

// LOGIN
const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // 1. Buscar usuario
        const userRes = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
        
        if (userRes.rows.length === 0) {
            return res.status(400).json({ error: 'Usuario no encontrado' });
        }

        const user = userRes.rows[0];

        // 2. Comparar contraseña (La que escribe vs El Hash de la BD)
        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) {
            return res.status(400).json({ error: 'Contraseña incorrecta' });
        }

        // 3. Login exitoso (Devolvemos el ID para usarlo en la app)
        res.json({ 
            message: 'Bienvenido', 
            user: { id: user.id, nombre: user.nombre_completo, email: user.email } 
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
};

module.exports = { register, login };