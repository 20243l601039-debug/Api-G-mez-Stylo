const pool = require('../db');

const getDashboardStats = async (req, res) => {
    try {
        // 1. Total de Ventas (Suma de pedidos no cancelados)
        const ventasRes = await pool.query("SELECT COALESCE(SUM(total), 0) as total FROM pedidos WHERE estado != 'cancelado'");
        
        // 2. Conteo de Usuarios
        const usuariosRes = await pool.query("SELECT COUNT(*) FROM usuarios WHERE rol = 'cliente'");
        
        // 3. Conteo de Pedidos
        const pedidosRes = await pool.query("SELECT COUNT(*) FROM pedidos");
        
        // 4. Conteo de Productos
        const productosRes = await pool.query("SELECT COUNT(*) FROM productos WHERE activo = true");

        // 5. Alerta de Stock Bajo (Menos de 5 unidades)
        const lowStockRes = await pool.query("SELECT * FROM productos WHERE stock < 5 AND activo = true LIMIT 5");

        // 6. Últimos 5 pedidos recientes
        const recentOrdersRes = await pool.query(`
            SELECT p.id, u.nombre_completo, p.total, p.estado, p.fecha_pedido 
            FROM pedidos p
            JOIN usuarios u ON p.usuario_id = u.id
            ORDER BY p.fecha_pedido DESC 
            LIMIT 5
        `);

        res.json({
            ventas: ventasRes.rows[0].total,
            usuarios: usuariosRes.rows[0].count,
            totalPedidos: pedidosRes.rows[0].count,
            totalProductos: productosRes.rows[0].count,
            lowStock: lowStockRes.rows,
            recentOrders: recentOrdersRes.rows
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error obteniendo estadísticas' });
    }
};

module.exports = { getDashboardStats };