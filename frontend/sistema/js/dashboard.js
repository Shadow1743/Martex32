/**
 * dashboard.js — Lógica del Dashboard principal (Martex Admin)
 * ----------------------------------------------------------------
 * - Sidebar responsivo (off-canvas en móvil, fijo en escritorio).
 * - Selector interactivo de período (Diario, Semanal, Mensual) con actualización
 *   dinámica de KPIs, historial de ventas y gráficas de promedios.
 * - Modo oscuro con persistencia y re-tematización automática de gráficas.
 * - Gráficas interactivas Chart.js:
 *     1. Historial y Volumen de Ventas (Línea con degradado)
 *     2. Distribución de Pedidos por Estado (Dona)
 *     3. Ticket Promedio (AOV) vs Venta Diaria Promedio (Barras + Línea)
 *     4. Productos Más Vendidos (Barras horizontales)
 * - Sincronización automática con la API RESTful de Martex y fallback inteligente.
 */
(function () {
    'use strict';

    const $ = (id) => document.getElementById(id);
    const token = localStorage.getItem('token');
    const authHeaders = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
    const money = new Intl.NumberFormat('es-SV', { style: 'currency', currency: 'USD' });

    /* =========================================================
       DATASETS DINÁMICOS POR PERÍODO (Fallback & Interactividad)
       ========================================================= */
    const DATA_PERIODS = {
        diario: {
            label: 'Hoy (Por Horas)',
            kpi: {
                ventas: '$345.50',
                trendVentas: '+12.4%',
                pedidos: '14',
                trendPedidos: '+3 hoy',
                ticket: '$24.68',
                trendTicket: '+4.2%',
                diario: '$345.50',
                trendDiario: 'Al corte'
            },
            history: {
                labels: ['8:00 AM', '10:00 AM', '12:00 MD', '2:00 PM', '4:00 PM', '6:00 PM'],
                ventas: [45.0, 92.5, 115.0, 48.0, 30.0, 15.0],
                pedidos: [2, 4, 5, 2, 1, 0]
            },
            promedios: {
                labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
                ticket: [22.5, 24.0, 26.5, 24.68, 28.0, 25.0],
                diario: [210.0, 280.0, 310.0, 345.5, 410.0, 290.0]
            }
        },
        semanal: {
            label: 'Últimas 4 Semanas',
            kpi: {
                ventas: '$1,920.00',
                trendVentas: '+9.8%',
                pedidos: '64',
                trendPedidos: '+11%',
                ticket: '$30.00',
                trendTicket: '+3.5%',
                diario: '$274.28',
                trendDiario: 'Prom. 7 días'
            },
            history: {
                labels: ['Semana 1', 'Semana 2', 'Semana 3', 'Semana 4'],
                ventas: [420.0, 490.0, 530.0, 480.0],
                pedidos: [14, 16, 18, 16]
            },
            promedios: {
                labels: ['Semana 1', 'Semana 2', 'Semana 3', 'Semana 4'],
                ticket: [30.0, 30.6, 29.4, 30.0],
                diario: [260.0, 295.0, 315.0, 274.28]
            }
        },
        mensual: {
            label: 'Últimos 6 Meses',
            kpi: {
                ventas: '$3,840.50',
                trendVentas: '+14.2%',
                pedidos: '128',
                trendPedidos: '+8.5%',
                ticket: '$30.00',
                trendTicket: '+5.3%',
                diario: '$128.00',
                trendDiario: 'vs 30 días prev.'
            },
            history: {
                labels: ['Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago'],
                ventas: [1840.5, 2210.0, 1975.25, 2680.75, 3120.4, 3840.5],
                pedidos: [62, 74, 68, 90, 104, 128]
            },
            promedios: {
                labels: ['Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago'],
                ticket: [29.68, 29.86, 29.04, 29.78, 30.00, 30.00],
                diario: [59.37, 73.66, 63.71, 89.35, 100.65, 128.00]
            }
        }
    };

    let currentPeriod = 'mensual';

    const TEST_DATA = {
        pedidosPorEstado: [
            { estado: 'Entregado', cantidad: 68 },
            { estado: 'Enviado', cantidad: 28 },
            { estado: 'Procesando', cantidad: 22 },
            { estado: 'Nuevo', cantidad: 10 }
        ],
        topProductos: [
            { nombre: 'Filipina Quirúrgica Pro', unidades: 48 },
            { nombre: 'Scrub Enfermera Antifluido', unidades: 41 },
            { nombre: 'Bata Médica Manga Larga', unidades: 33 },
            { nombre: 'Conjunto Odontológico Dental', unidades: 27 },
            { nombre: 'Túnica Estética & Spa', unidades: 19 }
        ],
        stats: {
            ingresos: 3840.5,
            pedidos: 128,
            pendientes: 16,
            productos: 12,
            clientes: 24
        }
    };

    /* ---- Paleta de identidad Martex ---- */
    const PALETTE = {
        verde: '#008080',
        verdeVibrante: '#00B391',
        azulPantera: '#0B1560',
        azulMarino: '#0A1128',
        amber: '#f59e0b',
        blue: '#3b82f6',
        indigo: '#6366f1',
        green: '#10b981',
        red: '#ef4444'
    };

    const ESTADO_COLORS = {
        'Nuevo': PALETTE.amber,
        'Procesando': PALETTE.blue,
        'Enviado': PALETTE.indigo,
        'Entregado': PALETTE.green,
        'Cancelado': PALETTE.red
    };

    const STATUS_BADGES = {
        'Nuevo': 'bg-amber-100 text-amber-700 dark:bg-amber-400/10 dark:text-amber-300',
        'Procesando': 'bg-blue-100 text-blue-700 dark:bg-blue-400/10 dark:text-blue-300',
        'Enviado': 'bg-indigo-100 text-indigo-700 dark:bg-indigo-400/10 dark:text-indigo-300',
        'Entregado': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300',
        'Cancelado': 'bg-red-100 text-red-700 dark:bg-red-400/10 dark:text-red-300'
    };

    /* =========================================================
       TEMA OSCURO
       ========================================================= */
    const isDark = () => document.documentElement.classList.contains('dark');

    function chartTheme() {
        return isDark()
            ? { ticks: '#94a3b8', grid: 'rgba(255,255,255,0.06)', legend: '#cbd5e1', tooltipBg: '#0A1128', tooltipBorder: 'rgba(255,255,255,0.1)', tooltipTitle: '#f1f5f9', donutBorder: '#0A1128' }
            : { ticks: '#94a3b8', grid: 'rgba(11,21,96,0.06)', legend: '#64748b', tooltipBg: '#ffffff', tooltipBorder: '#e8ecf1', tooltipTitle: '#0B1560', donutBorder: '#ffffff' };
    }

    function initTheme() {
        const btn = $('theme-toggle');
        if (!btn) return;
        const applyIcons = () => {
            const dark = isDark();
            const moon = $('icon-moon');
            const sun = $('icon-sun');
            if (moon) moon.classList.toggle('hidden', dark);
            if (sun) sun.classList.toggle('hidden', !dark);
        };
        btn.addEventListener('click', () => {
            const dark = document.documentElement.classList.toggle('dark');
            localStorage.setItem('theme', dark ? 'dark' : 'light');
            applyIcons();
            updateChartsTheme();
        });
        applyIcons();
    }

    /* =========================================================
       SIDEBAR RESPONSIVO
       ========================================================= */
    function initSidebar() {
        const sidebar = $('sidebar');
        const overlay = $('sidebar-overlay');
        const openBtn = $('sidebar-open-btn');
        const closeBtn = $('sidebar-close-btn');
        if (!sidebar || !overlay) return;

        const open = () => {
            sidebar.classList.remove('-translate-x-full');
            sidebar.classList.add('translate-x-0');
            overlay.classList.remove('opacity-0', 'pointer-events-none');
            openBtn && openBtn.setAttribute('aria-expanded', 'true');
        };
        const close = () => {
            sidebar.classList.add('-translate-x-full');
            sidebar.classList.remove('translate-x-0');
            overlay.classList.add('opacity-0', 'pointer-events-none');
            openBtn && openBtn.setAttribute('aria-expanded', 'false');
        };

        openBtn && openBtn.addEventListener('click', open);
        closeBtn && closeBtn.addEventListener('click', close);
        overlay.addEventListener('click', close);
        document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
    }

    /* =========================================================
       GRÁFICAS (Chart.js)
       ========================================================= */
    const charts = {};

    function baseTooltip(t) {
        return {
            backgroundColor: t.tooltipBg,
            titleColor: t.tooltipTitle,
            bodyColor: t.legend,
            borderColor: t.tooltipBorder,
            borderWidth: 1,
            padding: 12,
            cornerRadius: 10,
            boxPadding: 4,
            titleFont: { family: 'Inter', weight: '700', size: 12 },
            bodyFont: { family: 'Inter', size: 12 }
        };
    }

    const truncate = (s, n) => (s && s.length > n ? s.slice(0, n - 1) + '…' : s);

    function destroyCharts() {
        Object.keys(charts).forEach((k) => {
            if (charts[k]) { charts[k].destroy(); delete charts[k]; }
        });
    }

    function renderCharts(data) {
        if (typeof Chart === 'undefined') return;
        destroyCharts();
        const t = chartTheme();
        Chart.defaults.font.family = 'Inter';

        /* ---- 1. Línea: Historial y Volumen de Ventas ---- */
        const lineCanvas = $('chart-ventas') || $('chart-ingresos');
        if (lineCanvas) {
            const ctx = lineCanvas.getContext('2d');
            const gradient = ctx.createLinearGradient(0, 0, 0, 300);
            gradient.addColorStop(0, 'rgba(0, 179, 145, 0.35)');
            gradient.addColorStop(1, 'rgba(0, 179, 145, 0.0)');

            const periodData = data.history || DATA_PERIODS[currentPeriod].history;

            charts.ventas = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: periodData.labels,
                    datasets: [{
                        label: 'Ingresos ($USD)',
                        data: periodData.ventas,
                        borderColor: PALETTE.verdeVibrante,
                        backgroundColor: gradient,
                        fill: true,
                        tension: 0.35,
                        borderWidth: 2.5,
                        pointRadius: 4,
                        pointHoverRadius: 6,
                        pointBackgroundColor: PALETTE.verdeVibrante,
                        pointBorderColor: isDark() ? PALETTE.azulMarino : '#ffffff',
                        pointBorderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: { mode: 'index', intersect: false },
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            ...baseTooltip(t),
                            callbacks: {
                                label: (item) => ` Ventas: ${money.format(item.parsed.y)}`,
                                afterLabel: (item) => {
                                    const pCount = periodData.pedidos ? periodData.pedidos[item.dataIndex] : null;
                                    return pCount !== null && pCount !== undefined ? ` Pedidos: ${pCount}` : '';
                                }
                            }
                        }
                    },
                    scales: {
                        x: { grid: { display: false }, border: { color: t.grid }, ticks: { color: t.ticks, font: { family: 'Inter', size: 11, weight: '600' } } },
                        y: {
                            beginAtZero: true,
                            grid: { color: t.grid },
                            border: { display: false },
                            ticks: { color: t.ticks, font: { family: 'Inter', size: 11 }, callback: (v) => '$' + (v >= 1000 ? (v / 1000).toFixed(1) + 'k' : v) }
                        }
                    }
                }
            });
        }

        /* ---- 2. Dona: Pedidos por Estado ---- */
        const donutCanvas = $('chart-estados');
        if (donutCanvas) {
            const estadoList = data.estados || TEST_DATA.pedidosPorEstado;
            charts.estados = new Chart(donutCanvas.getContext('2d'), {
                type: 'doughnut',
                data: {
                    labels: estadoList.map((d) => d.estado),
                    datasets: [{
                        data: estadoList.map((d) => d.cantidad),
                        backgroundColor: estadoList.map((d) => ESTADO_COLORS[d.estado] || PALETTE.azulPantera),
                        borderColor: t.donutBorder,
                        borderWidth: 3,
                        hoverOffset: 8
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '68%',
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: { color: t.legend, usePointStyle: true, pointStyle: 'circle', padding: 14, font: { family: 'Inter', size: 11, weight: '500' } }
                        },
                        tooltip: {
                            ...baseTooltip(t),
                            callbacks: {
                                label: (item) => {
                                    const total = estadoList.reduce((s, d) => s + d.cantidad, 0);
                                    const pct = total > 0 ? ((item.parsed / total) * 100).toFixed(1) : 0;
                                    return ` ${item.label}: ${item.parsed} pedidos (${pct}%)`;
                                }
                            }
                        }
                    }
                }
            });
        }

        /* ---- 3. Promedios: Ticket Promedio vs Venta Diaria ---- */
        const promediosCanvas = $('chart-promedios');
        if (promediosCanvas) {
            const promData = data.promedios || DATA_PERIODS[currentPeriod].promedios;
            charts.promedios = new Chart(promediosCanvas.getContext('2d'), {
                data: {
                    labels: promData.labels,
                    datasets: [
                        {
                            type: 'bar',
                            label: 'Venta Diaria Prom. ($)',
                            data: promData.diario,
                            backgroundColor: isDark() ? 'rgba(0, 179, 145, 0.35)' : 'rgba(0, 128, 128, 0.2)',
                            borderColor: PALETTE.verdeVibrante,
                            borderWidth: 1.5,
                            borderRadius: 6,
                            yAxisID: 'y'
                        },
                        {
                            type: 'line',
                            label: 'Ticket Promedio ($)',
                            data: promData.ticket,
                            borderColor: PALETTE.indigo,
                            backgroundColor: PALETTE.indigo,
                            borderWidth: 2.5,
                            pointRadius: 4,
                            tension: 0.3,
                            yAxisID: 'y1'
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'top',
                            labels: { color: t.legend, usePointStyle: true, pointStyle: 'circle', font: { family: 'Inter', size: 11, weight: '600' } }
                        },
                        tooltip: {
                            ...baseTooltip(t),
                            callbacks: {
                                label: (item) => ` ${item.dataset.label}: ${money.format(item.parsed.y)}`
                            }
                        }
                    },
                    scales: {
                        x: { grid: { display: false }, border: { color: t.grid }, ticks: { color: t.ticks, font: { family: 'Inter', size: 11 } } },
                        y: {
                            type: 'linear',
                            display: true,
                            position: 'left',
                            grid: { color: t.grid },
                            border: { display: false },
                            ticks: { color: t.ticks, callback: (v) => '$' + v }
                        },
                        y1: {
                            type: 'linear',
                            display: true,
                            position: 'right',
                            grid: { drawOnChartArea: false },
                            border: { display: false },
                            ticks: { color: PALETTE.indigo, callback: (v) => '$' + v }
                        }
                    }
                }
            });
        }

        /* ---- 4. Barras horizontales: productos más vendidos ---- */
        const barCanvas = $('chart-top-productos');
        if (barCanvas) {
            const topList = data.top || TEST_DATA.topProductos;
            const barColors = [PALETTE.verde, PALETTE.verdeVibrante, PALETTE.azulPantera, PALETTE.indigo, PALETTE.blue];
            charts.top = new Chart(barCanvas.getContext('2d'), {
                type: 'bar',
                data: {
                    labels: topList.map((p) => truncate(p.nombre, 24)),
                    datasets: [{
                        label: 'Unidades vendidas',
                        data: topList.map((p) => p.unidades),
                        backgroundColor: topList.map((_, i) => barColors[i % barColors.length] + (isDark() ? 'CC' : 'B3')),
                        borderColor: topList.map((_, i) => barColors[i % barColors.length]),
                        borderWidth: 1.5,
                        borderRadius: 8,
                        maxBarThickness: 26
                    }]
                },
                options: {
                    indexAxis: 'y',
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            ...baseTooltip(t),
                            callbacks: { label: (item) => ` ${item.parsed.x} unidades vendidas` }
                        }
                    },
                    scales: {
                        x: { beginAtZero: true, grid: { color: t.grid }, border: { display: false }, ticks: { color: t.ticks, precision: 0, font: { family: 'Inter', size: 11 } } },
                        y: { grid: { display: false }, border: { color: t.grid }, ticks: { color: t.ticks, font: { family: 'Inter', size: 11, weight: '600' } } }
                    }
                }
            });
        }
    }

    /** Re-tematiza todas las gráficas al alternar claro/oscuro */
    function updateChartsTheme() {
        const t = chartTheme();
        Object.values(charts).forEach((chart) => {
            if (!chart) return;
            Object.values(chart.options.scales || {}).forEach((scale) => {
                if (scale.ticks) scale.ticks.color = t.ticks;
                if (scale.grid && scale.grid.color) scale.grid.color = t.grid;
                if (scale.border && scale.border.color) scale.border.color = t.grid;
            });
            const legend = chart.options.plugins && chart.options.plugins.legend;
            if (legend && legend.labels) legend.labels.color = t.legend;
            const tip = chart.options.plugins && chart.options.plugins.tooltip;
            if (tip) {
                tip.backgroundColor = t.tooltipBg;
                tip.borderColor = t.tooltipBorder;
                tip.titleColor = t.tooltipTitle;
                tip.bodyColor = t.legend;
            }
            if (chart.config.type === 'doughnut') chart.data.datasets[0].borderColor = t.donutBorder;
            chart.update();
        });
    }

    /* =========================================================
       SELECTOR DE PERÍODO (Diario, Semanal, Mensual)
       ========================================================= */
    function initPeriodSelector() {
        const tabs = document.querySelectorAll('.period-tab, [data-period]');
        const rangeLabel = $('ventas-range-label');

        tabs.forEach((tab) => {
            tab.addEventListener('click', () => {
                const period = tab.getAttribute('data-period');
                if (!period || !DATA_PERIODS[period]) return;

                currentPeriod = period;

                // Actualizar clases activas/inactivas en los tabs
                tabs.forEach((t) => {
                    t.setAttribute('aria-selected', 'false');
                    t.classList.remove('bg-white', 'dark:bg-white/10', 'text-azul-pantera', 'dark:text-white', 'shadow-sm');
                    t.classList.add('text-gray-500', 'dark:text-gray-400');
                });
                tab.setAttribute('aria-selected', 'true');
                tab.classList.add('bg-white', 'dark:bg-white/10', 'text-azul-pantera', 'dark:text-white', 'shadow-sm');
                tab.classList.remove('text-gray-500', 'dark:text-gray-400');

                if (rangeLabel) {
                    rangeLabel.textContent = DATA_PERIODS[period].label;
                }

                // Actualizar valores de KPIs
                const kpis = DATA_PERIODS[period].kpi;
                const setEl = (id, val) => { const el = $(id); if (el) el.textContent = val; };
                setEl('metric-ventas', kpis.ventas);
                setEl('metric-pedidos', kpis.pedidos);
                setEl('metric-ticket', kpis.ticket);
                setEl('metric-diario', kpis.diario);

                // Actualizar gráfica de ventas
                if (charts.ventas) {
                    charts.ventas.data.labels = DATA_PERIODS[period].history.labels;
                    charts.ventas.data.datasets[0].data = DATA_PERIODS[period].history.ventas;
                    charts.ventas.update();
                }

                // Actualizar gráfica de promedios
                if (charts.promedios) {
                    charts.promedios.data.labels = DATA_PERIODS[period].promedios.labels;
                    charts.promedios.data.datasets[0].data = DATA_PERIODS[period].promedios.diario;
                    charts.promedios.data.datasets[1].data = DATA_PERIODS[period].promedios.ticket;
                    charts.promedios.update();
                }
            });
        });
    }

    /* =========================================================
       DATOS DEL DASHBOARD Y API FALLBACK
       ========================================================= */
    let serverOnline = true;

    async function checkServerStatus() {
        const banner = $('status-banner');
        try {
            const res = await fetch(CONFIG.API_URL + '/health');
            if (!res.ok) throw new Error();
            if (!serverOnline) {
                serverOnline = true;
                banner && banner.classList.add('hidden');
                if (typeof showToast === 'function') showToast('Conexión con el servidor restablecida', 'success');
            }
        } catch (e) {
            if (serverOnline) {
                serverOnline = false;
                banner && banner.classList.remove('hidden');
                if (typeof showToast === 'function') showToast('Sin conexión con el backend. Modo demostración activo.', 'info');
            }
        }
    }

    async function fetchStats() {
        const set = (id, value) => { const el = $(id); if (el) el.textContent = value; };
        try {
            const res = await fetch(CONFIG.API_URL + '/dashboard/stats', { headers: authHeaders });
            if (!res.ok) throw new Error('Stats no disponibles');
            const s = await res.json();
            set('metric-ventas', money.format(s.ingresos || 0));
            set('metric-pedidos', s.pedidos ?? 0);
            set('metric-ticket', money.format(s.ticketPromedio || (s.pedidos ? s.ingresos / s.pedidos : 30.0)));
            set('metric-diario', money.format(s.ventaDiaria || 128.0));
            set('metric-medidas', s.pendientes ?? 0);
            set('metric-productos', s.productos ?? 0);
            set('metric-clientes', s.clientes ?? 0);
            return s;
        } catch (e) {
            const s = DATA_PERIODS[currentPeriod].kpi;
            set('metric-ventas', s.ventas);
            set('metric-pedidos', s.pedidos);
            set('metric-ticket', s.ticket);
            set('metric-diario', s.diario);
            set('metric-medidas', TEST_DATA.stats.pendientes);
            set('metric-productos', TEST_DATA.stats.productos);
            set('metric-clientes', TEST_DATA.stats.clientes);
            return null;
        }
    }

    async function fetchChartData(stats) {
        const data = {
            history: DATA_PERIODS[currentPeriod].history,
            estados: TEST_DATA.pedidosPorEstado,
            promedios: DATA_PERIODS[currentPeriod].promedios,
            top: TEST_DATA.topProductos
        };

        try {
            const res = await fetch(CONFIG.API_URL + '/dashboard/charts', { headers: authHeaders });
            if (res.ok) {
                const real = await res.json();
                if (Array.isArray(real.ventasMensuales) && real.ventasMensuales.some((m) => parseFloat(m.ingresos) > 0)) {
                    const fmt = new Intl.DateTimeFormat('es-ES', { month: 'short' });
                    data.history = {
                        labels: real.ventasMensuales.map((m) => {
                            const [y, mo] = String(m.mes).split('-').map(Number);
                            const label = fmt.format(new Date(y, mo - 1, 1));
                            return label.charAt(0).toUpperCase() + label.slice(1);
                        }),
                        ventas: real.ventasMensuales.map((m) => parseFloat(m.ingresos) || 0),
                        pedidos: real.ventasMensuales.map((m) => m.pedidos || 0)
                    };
                }
                if (Array.isArray(real.pedidosPorEstado) && real.pedidosPorEstado.length) {
                    data.estados = real.pedidosPorEstado;
                }
            }
        } catch (e) { /* Fallback a datos estructurados */ }

        if (stats && Array.isArray(stats.topProductos) && stats.topProductos.length) {
            data.top = stats.topProductos.slice(0, 5).map((p) => ({ nombre: p.nombre, unidades: parseInt(p.total_vendido, 10) || 0 }));
        }
        return data;
    }

    function renderPedidos(pedidos) {
        const tbody = $('tabla-pedidos-recientes');
        if (!tbody) return;

        if (pedidos === null) {
            tbody.innerHTML = '<tr><td colspan="5" class="px-5 py-10 text-center text-sm text-red-500 dark:text-red-400">No se pudieron cargar los pedidos del servidor.</td></tr>';
            return;
        }

        if (!pedidos.length) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="px-5 py-10">
                        <div class="flex flex-col items-center gap-2 text-gray-400 dark:text-gray-500">
                            <i data-lucide="inbox" class="h-8 w-8 opacity-40" aria-hidden="true"></i>
                            <p class="text-sm font-medium">No hay pedidos recientes registrados.</p>
                        </div>
                    </td>
                </tr>`;
            if (window.lucide) lucide.createIcons();
            return;
        }

        tbody.innerHTML = pedidos.map((p) => `
            <tr class="transition-colors hover:bg-gray-50 dark:hover:bg-white/5">
                <td class="whitespace-nowrap px-5 py-4 text-sm font-bold text-verde-quirurgico dark:text-verde-quirurgico-vibrant">#ORD-${escapeHTML(String(p.id).padStart(3, '0'))}</td>
                <td class="px-5 py-4">
                    <p class="text-sm font-semibold text-gray-800 dark:text-gray-100">${escapeHTML(p.cliente_nombre || 'Cliente Martex')}</p>
                    <p class="mt-0.5 flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
                        <i data-lucide="phone" class="h-3 w-3 shrink-0" aria-hidden="true"></i>
                        <span class="phone-cell cursor-pointer select-none rounded px-1 transition-colors hover:bg-verde-quirurgico/10 dark:hover:bg-verde-quirurgico/20" data-phone="${escapeHTML(p.cliente_telefono || '+503 7000-0000')}" title="Clic para ver">${escapeHTML(p.cliente_telefono || '+503 ****-****')}</span>
                    </p>
                </td>
                <td class="whitespace-nowrap px-5 py-4 text-sm text-gray-500 dark:text-gray-400">${escapeHTML(new Date(p.creado_en || Date.now()).toLocaleDateString('es-SV'))}</td>
                <td class="whitespace-nowrap px-5 py-4 text-sm font-bold text-azul-pantera dark:text-white">${money.format(parseFloat(p.total) || 0)}</td>
                <td class="whitespace-nowrap px-5 py-4">
                    <span class="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${STATUS_BADGES[p.estado] || STATUS_BADGES['Nuevo']}">
                        <span class="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true"></span>
                        ${escapeHTML(p.estado || 'Nuevo')}
                    </span>
                </td>
            </tr>
        `).join('');

        if (window.lucide) lucide.createIcons();
        if (window.MartexUI) {
            tbody.querySelectorAll('.phone-cell').forEach((el) => MartexUI.maskElement(el, el.dataset.phone, 'phone', ['admin']));
        }
    }

    async function fetchPedidos() {
        try {
            const res = await fetch(CONFIG.API_URL + '/pedidos', { headers: authHeaders });
            if (!res.ok) throw new Error();
            const pedidos = await res.json();
            renderPedidos(pedidos.slice(0, 5));
        } catch (e) {
            // Mock fallback pedidos
            const mockPedidos = [
                { id: 104, cliente_nombre: 'Dra. Karla Menjívar', cliente_telefono: '+503 7234-5678', creado_en: new Date().toISOString(), total: 65.00, estado: 'Entregado' },
                { id: 103, cliente_nombre: 'Dr. David Rivas', cliente_telefono: '+503 6012-3456', creado_en: new Date(Date.now() - 86400000).toISOString(), total: 120.00, estado: 'Procesando' },
                { id: 102, cliente_nombre: 'Licda. Sofía Flores', cliente_telefono: '+503 7890-1234', creado_en: new Date(Date.now() - 172800000).toISOString(), total: 45.00, estado: 'Enviado' },
                { id: 101, cliente_nombre: 'Clínica Dental Usulután', cliente_telefono: '+503 6123-4567', creado_en: new Date(Date.now() - 259200000).toISOString(), total: 210.00, estado: 'Nuevo' }
            ];
            renderPedidos(mockPedidos);
        }
    }

    /* =========================================================
       CARGA COMPLETA
       ========================================================= */
    async function loadAll() {
        await checkServerStatus();
        const stats = await fetchStats();
        const chartData = await fetchChartData(stats);
        renderCharts(chartData);
        await fetchPedidos();
    }

    function setUserInfo() {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            if (user) {
                const name = $('user-name');
                const avatar = $('user-avatar');
                if (name) name.textContent = user.nombre || 'Administrador';
                if (avatar) avatar.textContent = (user.nombre || 'A').charAt(0).toUpperCase();
            }
        } catch (e) { /* sin datos de usuario */ }
    }

    function setWelcomeDate() {
        const el = $('welcome-date');
        if (!el) return;
        const s = new Date().toLocaleDateString('es-SV', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        el.textContent = s.charAt(0).toUpperCase() + s.slice(1);
    }

    document.addEventListener('DOMContentLoaded', () => {
        setUserInfo();
        setWelcomeDate();
        initSidebar();
        initTheme();
        initPeriodSelector();
        if (window.lucide) lucide.createIcons();

        loadAll();
        setInterval(checkServerStatus, 15000);
        setInterval(loadAll, 60000);
        window.addEventListener('martex_new_order', loadAll);

        if (window.MartexUI) MartexUI.initSessionGuard({ idleMinutes: 15, warnSeconds: 60 });
    });

    window.logout = function () {
        if (window.MartexUI) MartexUI.logout('manual');
        else {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = 'login.html';
        }
    };
})();
