const pool = require('../config/db');

/**
 * Calcula el cambio porcentual entre dos valores.
 * Si no hay valor anterior, devuelve 100 cuando el actual es positivo, si no 0.
 */
const pctChange = (actual, anterior) => {
    actual = parseFloat(actual) || 0;
    anterior = parseFloat(anterior) || 0;
    if (anterior <= 0) return actual > 0 ? 100 : 0;
    return ((actual - anterior) / anterior) * 100;
};

exports.getStats = async (req, res) => {
    try {
        // Consultas concurrentes para mayor velocidad
        const [pedidosResult, ingresosResult, productosResult, pendientesResult, clientesResult, topProductosResult, tendenciasResult] = await Promise.all([
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
            `),
            // Métricas del mes en curso vs. mes anterior + promedios (para tarjetas KPI y tendencias)
            pool.query(`
                SELECT
                    COALESCE(SUM(total) FILTER (WHERE date_trunc('month', creado_en) = date_trunc('month', CURRENT_DATE)), 0) AS ingresos_mes_actual,
                    COALESCE(SUM(total) FILTER (WHERE date_trunc('month', creado_en) = date_trunc('month', CURRENT_DATE) - INTERVAL '1 month'), 0) AS ingresos_mes_anterior,
                    COUNT(*) FILTER (WHERE date_trunc('month', creado_en) = date_trunc('month', CURRENT_DATE)) AS pedidos_mes_actual,
                    COUNT(*) FILTER (WHERE date_trunc('month', creado_en) = date_trunc('month', CURRENT_DATE) - INTERVAL '1 month') AS pedidos_mes_anterior,
                    COALESCE(AVG(total) FILTER (WHERE date_trunc('month', creado_en) = date_trunc('month', CURRENT_DATE)), 0) AS ticket_actual,
                    COALESCE(AVG(total) FILTER (WHERE date_trunc('month', creado_en) = date_trunc('month', CURRENT_DATE) - INTERVAL '1 month'), 0) AS ticket_anterior,
                    COALESCE(SUM(total) FILTER (WHERE creado_en::date >= CURRENT_DATE - INTERVAL '6 days'), 0) / 7.0 AS diario_actual,
                    COALESCE(SUM(total) FILTER (WHERE creado_en::date >= CURRENT_DATE - INTERVAL '13 days' AND creado_en::date < CURRENT_DATE - INTERVAL '6 days'), 0) / 7.0 AS diario_anterior
                FROM pedidos
                WHERE estado != 'Cancelado'
            `)
        ]);

        const totalPedidos = parseInt(pedidosResult.rows[0].count) || 0;
        const totalIngresos = parseFloat(ingresosResult.rows[0].sum) || 0;
        const totalProductos = parseInt(productosResult.rows[0].count) || 0;
        const totalPendientes = parseInt(pendientesResult.rows[0].count) || 0;
        const totalClientes = parseInt(clientesResult.rows[0].count) || 0;
        const topProductos = topProductosResult.rows;

        const t = tendenciasResult.rows[0] || {};
        const ingresosMesActual = parseFloat(t.ingresos_mes_actual) || 0;
        const pedidosMesActual = parseInt(t.pedidos_mes_actual) || 0;
        const ticketPromedio = parseFloat(t.ticket_actual) || 0;
        const promedioDiario = parseFloat(t.diario_actual) || 0;

        res.json({
            pedidos: totalPedidos,
            ingresos: totalIngresos,
            productos: totalProductos,
            pendientes: totalPendientes,
            clientes: totalClientes,
            topProductos: topProductos,
            // KPIs de promedios
            ventasMesActual: ingresosMesActual,
            pedidosMesActual: pedidosMesActual,
            ticketPromedio: ticketPromedio,
            promedioDiario: promedioDiario,
            // Variación % respecto al periodo anterior (para indicadores de tendencia)
            tendencias: {
                ventas: pctChange(ingresosMesActual, t.ingresos_mes_anterior),
                pedidos: pctChange(pedidosMesActual, t.pedidos_mes_anterior),
                ticket: pctChange(t.ticket_actual, t.ticket_anterior),
                diario: pctChange(t.diario_actual, t.diario_anterior)
            }
        });
    } catch (error) {
        console.error("Error obteniendo estadísticas:", error);
        res.status(500).json({ error: "Error al obtener las estadísticas del dashboard" });
    }
};

/**
 * Datos agregados para el módulo de analítica gráfica del dashboard.
 * Devuelve series listas para graficar (líneas, dona y barras),
 * incluyendo historial diario, semanal y mensual, y series de promedios.
 */
exports.getCharts = async (req, res) => {
    try {
        const [ventasMensualesResult, ventasDiariasResult, ventasSemanalesResult, promediosMensualesResult, pedidosEstadoResult, categoriasResult] = await Promise.all([
            // Ingresos y volumen de pedidos de los últimos 6 meses (con meses vacíos rellenados en 0)
            pool.query(`
                SELECT TO_CHAR(m.mes, 'YYYY-MM') AS mes,
                       COALESCE(SUM(p.total), 0) AS ingresos,
                       COUNT(p.id) AS pedidos
                FROM generate_series(
                    date_trunc('month', CURRENT_DATE) - INTERVAL '5 months',
                    date_trunc('month', CURRENT_DATE),
                    INTERVAL '1 month'
                ) AS m(mes)
                LEFT JOIN pedidos p
                    ON date_trunc('month', p.creado_en) = m.mes
                   AND p.estado != 'Cancelado'
                GROUP BY m.mes
                ORDER BY m.mes
            `),
            // Ingresos y volumen de los últimos 7 días (con días vacíos rellenados en 0)
            pool.query(`
                SELECT TO_CHAR(d.dia, 'YYYY-MM-DD') AS fecha,
                       COALESCE(SUM(p.total), 0) AS ingresos,
                       COUNT(p.id) AS pedidos
                FROM generate_series(
                    CURRENT_DATE - INTERVAL '6 days',
                    CURRENT_DATE,
                    INTERVAL '1 day'
                ) AS d(dia)
                LEFT JOIN pedidos p
                    ON p.creado_en::date = d.dia::date
                   AND p.estado != 'Cancelado'
                GROUP BY d.dia
                ORDER BY d.dia
            `),
            // Ingresos y volumen de las últimas 8 semanas (inicio de semana, con relleno en 0)
            pool.query(`
                SELECT TO_CHAR(w.semana, 'YYYY-MM-DD') AS semana,
                       COALESCE(SUM(p.total), 0) AS ingresos,
                       COUNT(p.id) AS pedidos
                FROM generate_series(
                    date_trunc('week', CURRENT_DATE) - INTERVAL '7 weeks',
                    date_trunc('week', CURRENT_DATE),
                    INTERVAL '1 week'
                ) AS w(semana)
                LEFT JOIN pedidos p
                    ON date_trunc('week', p.creado_en) = w.semana
                   AND p.estado != 'Cancelado'
                GROUP BY w.semana
                ORDER BY w.semana
            `),
            // Ticket promedio y promedio de venta diaria por mes (últimos 6 meses)
            pool.query(`
                SELECT TO_CHAR(m.mes, 'YYYY-MM') AS mes,
                       COALESCE(AVG(p.total), 0) AS ticket_promedio,
                       COALESCE(SUM(p.total), 0) /
                           CASE WHEN date_trunc('month', CURRENT_DATE) = m.mes
                                THEN EXTRACT(DAY FROM CURRENT_DATE)
                                ELSE EXTRACT(DAY FROM (m.mes + INTERVAL '1 month' - INTERVAL '1 day'))
                           END AS promedio_diario
                FROM generate_series(
                    date_trunc('month', CURRENT_DATE) - INTERVAL '5 months',
                    date_trunc('month', CURRENT_DATE),
                    INTERVAL '1 month'
                ) AS m(mes)
                LEFT JOIN pedidos p
                    ON date_trunc('month', p.creado_en) = m.mes
                   AND p.estado != 'Cancelado'
                GROUP BY m.mes
                ORDER BY m.mes
            `),
            // Distribución de pedidos por estado (gráfica de dona)
            pool.query(`
                SELECT estado, COUNT(*) AS cantidad
                FROM pedidos
                GROUP BY estado
                ORDER BY cantidad DESC
            `),
            // Ingresos por categoría de producto (gráfica de barras)
            pool.query(`
                SELECT COALESCE(pr.categoria, 'Sin categoría') AS categoria,
                       SUM(pi.cantidad * pi.precio_unitario) AS ingresos,
                       SUM(pi.cantidad) AS unidades
                FROM pedido_items pi
                JOIN productos pr ON pi.producto_id = pr.id
                JOIN pedidos pe ON pi.pedido_id = pe.id
                WHERE pe.estado != 'Cancelado'
                GROUP BY pr.categoria
                ORDER BY ingresos DESC
                LIMIT 6
            `)
        ]);

        res.json({
            ventasMensuales: ventasMensualesResult.rows.map(r => ({
                mes: r.mes,
                ingresos: parseFloat(r.ingresos) || 0,
                pedidos: parseInt(r.pedidos) || 0
            })),
            ventasDiarias: ventasDiariasResult.rows.map(r => ({
                fecha: r.fecha,
                ingresos: parseFloat(r.ingresos) || 0,
                pedidos: parseInt(r.pedidos) || 0
            })),
            ventasSemanales: ventasSemanalesResult.rows.map(r => ({
                semana: r.semana,
                ingresos: parseFloat(r.ingresos) || 0,
                pedidos: parseInt(r.pedidos) || 0
            })),
            promediosMensuales: promediosMensualesResult.rows.map(r => ({
                mes: r.mes,
                ticketPromedio: parseFloat(r.ticket_promedio) || 0,
                promedioDiario: parseFloat(r.promedio_diario) || 0
            })),
            pedidosPorEstado: pedidosEstadoResult.rows.map(r => ({
                estado: r.estado,
                cantidad: parseInt(r.cantidad) || 0
            })),
            ventasPorCategoria: categoriasResult.rows.map(r => ({
                categoria: r.categoria,
                ingresos: parseFloat(r.ingresos) || 0,
                unidades: parseInt(r.unidades) || 0
            }))
        });
    } catch (error) {
        console.error("Error obteniendo datos de gráficas:", error);
        res.status(500).json({ error: "Error al obtener los datos de analítica" });
    }
};
