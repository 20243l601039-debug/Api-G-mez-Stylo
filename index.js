const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// --- CONFIGURACIÓN CORS ---
// Esto permite que tu celular y Ngrok se conecten sin bloqueos
app.use(cors());
app.use(express.json());

// --- IMPORTACIÓN DE RUTAS ---
const dashboardRoutes = require('./routes/dashboardRoutes');
const categoriasRoutes = require('./routes/categoriasRoutes');
const pedidosRoutes = require('./routes/pedidosRoutes');
const productosRoutes = require('./routes/productosRoutes');
const carritoRoutes = require('./routes/carritoRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/usuarios.routes');

// --- REGISTRO DE RUTAS (SIN MIDDLEWARES DE BLOQUEO) ---

// Dashboard y Categorías
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/categorias', categoriasRoutes);

// Productos (Ruta: http://.../api/productos)
app.use('/api/productos', productosRoutes);

// 🛒 CARRITO (Ruta: http://.../api/carrito)
// Nota: Quitamos cualquier 'verifyToken' de aquí para la presentación
app.use('/api/carrito', carritoRoutes);

// Pedidos y Pagos
app.use('/api/pedidos', pedidosRoutes);
app.use('/api/pago', paymentRoutes);

// Autenticación y Usuarios
app.use('/api/auth', authRoutes);
app.use('/api', userRoutes); // Esto habilita /api/usuarios


// --- RUTA DE PRUEBA ---
app.get('/', (req, res) => {
  res.send('API de Gómez Stylo funcionando 🚀');
});

// --- INICIAR SERVIDOR ---
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log('----------------------------------------------------');
  console.log(`✅ Servidor Gómez Stylo corriendo en puerto ${PORT}`);
  console.log(`📡 Local: http://192.168.1.75:${PORT}`);
  console.log(`🌐 Revisa tu terminal de NGROK para la URL pública`);
  console.log('----------------------------------------------------');
});
