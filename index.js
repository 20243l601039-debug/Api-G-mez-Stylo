const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// --- CONFIGURACIÓN CORS ---
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

// --- REGISTRO DE RUTAS ---
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/categorias', categoriasRoutes);
app.use('/api/productos', productosRoutes);
app.use('/api/carrito', carritoRoutes);
app.use('/api/pedidos', pedidosRoutes);
app.use('/api/pago', paymentRoutes);
app.use('/api/auth', authRoutes);
app.use('/api', userRoutes); 

// --- RUTA DE PRUEBA (Para saber si el server vive) ---
app.get('/', (req, res) => {
  res.send('✅ API de Gómez Stylo funcionando en la nube 🚀');
});

// --- INICIAR SERVIDOR ---
// Render asigna el puerto automáticamente mediante process.env.PORT
const PORT = process.env.PORT || 10000;

app.listen(PORT, '0.0.0.0', () => {
  console.log('----------------------------------------------------');
  console.log(`✅ Servidor Gómez Stylo corriendo en puerto ${PORT}`);
  console.log(`🌐 URL de Render activa`);
  console.log('----------------------------------------------------');
});
