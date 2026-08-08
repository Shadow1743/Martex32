const pool = require('../config/db');

exports.getStats = async (req, res) => {
    try {
        // Consultas concurrentes para mayor velocidad
        const [pedidosResult, ingresosResult, productosResult, pendientesResult, clientesResult, topProductosResult] = await Promise.all([
            pool.query('SELECT COUNT(*) FROM pedidos'),
            pool.query('SELECT SUM(total) FROM pedidos WHERE estado != $1', ['Cancelado']),
            pool.query('SELECT COUNT(*) FROM productos'),
            pool.query("SELECT COUNT(*) FROM pedidos WHERE estado IN ('Nuevo', 'Procesando')"),
            pool.query('SELECT COUNT(*) FROM clientes'),
            pool.query(`
                SELECT pr.nombre, pr.imagen_url, SUM(pi.cantidad) as total_vendido, COUNT(DISTINCT ped.id) as num_pedidos
                FROM pedido_items pi
                JOIN productos pr ON pi.producto_id = pr.id
                JOIN pedidos ped ON pi.pedido_id = ped.id
                WHERE ped.estado != 'Cancelado'
                GROUP BY pr.id, pr.nombre, pr.imagen_url
                ORDER BY total_vendido DESC
                LIMIT 5
            `)
        ]);

        const totalPedidos = parseInt(pedidosResult.rows[0].count) || 0;
        const totalIngresos = parseFloat(ingresosResult.rows[0].sum) || 0;
        const totalProductos = parseInt(productosResult.rows[0].count) || 0;
        const totalPendientes = parseInt(pendientesResult.rows[0].count) || 0;
        const totalClientes = parseInt(clientesResult.rows[0].count) || 0;
        const topProductos = topProductosResult.rows;

        res.json({
            pedidos: totalPedidos,
            ingresos: totalIngresos,
            productos: totalProductos,
            pendientes: totalPendientes,
            clientes: totalClientes,
            topProductos: topProductos
        });
    } catch (error) {
        console.error("Error obteniendo estadísticas:", error);
        res.status(500).json({ error: "Error al obtener las estadísticas del dashboard" });
    }
};
