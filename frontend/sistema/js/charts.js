/**
 * charts.js — Módulo de analítica gráfica del Dashboard Martex
 * ------------------------------------------------------------
 * Renderiza gráficas interactivas (línea, dona y barras) con Chart.js,
 * respetando estrictamente la paleta de identidad del sistema y
 * adaptándose automáticamente al modo claro/oscuro.
 *
 * Requiere: Chart.js v4 (CDN) cargado antes que este script.
 * Expone: window.initDashboardCharts(authHeaders)
 */
(function () {
    'use strict';

    /* ---- Paleta de identidad Martex (no modificar tonos) ---- */
    const PALETTE = {
        verdeQuirurgico: '#008080',
        verdeVibrante: '#00B391',
        azulPantera: '#0B1560',
        azulMarino: '#0A1128',
        // Colores semánticos ya usados en los status-badge del sistema
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

    let charts = []; // Instancias activas para re-tematizar
    let themeWatcherActive = false;

    /* ---- Utilidades de tema ---- */
    function isDark() {
        return document.documentElement.classList.contains('dark');
    }

    function themeColors() {
        return isDark()
            ? { ticks: '#94a3b8', grid: 'rgba(255,255,255,0.06)', legend: '#cbd5e1', tooltipBg: '#0a1128', tooltipBorder: 'rgba(255,255,255,0.1)' }
            : { ticks: '#94a3b8', grid: 'rgba(11,21,96,0.06)', legend: '#64748b', tooltipBg: '#ffffff', tooltipBorder: '#e8ecf1' };
    }

    function baseTooltip(theme) {
        return {
            backgroundColor: theme.tooltipBg,
            titleColor: isDark() ? '#f1f5f9' : PALETTE.azulPantera,
            bodyColor: theme.legend,
            borderColor: theme.tooltipBorder,
            borderWidth: 1,
            padding: 12,
            cornerRadius: 10,
            titleFont: { family: 'Inter', weight: '700', size: 12 },
            bodyFont: { family: 'Inter', size: 12 },
            displayColors: true,
            boxPadding: 4
        };
    }

    const monthFmt = new Intl.DateTimeFormat('es-ES', { month: 'short' });

    function monthLabel(isoMonth) {
        // isoMonth: "YYYY-MM" -> etiqueta localizada ("ene", "feb"...)
        const [y, m] = isoMonth.split('-').map(Number);
        const label = monthFmt.format(new Date(y, m - 1, 1));
        return label.charAt(0).toUpperCase() + label.slice(1);
    }

    const moneyFmt = new Intl.NumberFormat('es-SV', { style: 'currency', currency: 'USD' });

    /* ---- Estado vacío / error dentro de la tarjeta ---- */
    function showChartState(canvasId, icon, message) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        const container = canvas.closest('.chart-container') || canvas.parentElement;
        container.innerHTML = `
            <div class="chart-empty">
                <i class="fas ${icon}"></i>
                <p>${window.escapeHTML ? escapeHTML(message) : message}</p>
            </div>`;
    }

    /* ---- Gráfica de línea: Ingresos últimos 6 meses ---- */
    function buildLineChart(canvas, data, theme) {
        const ctx = canvas.getContext('2d');
        const gradient = ctx.createLinearGradient(0, 0, 0, 280);
        gradient.addColorStop(0, isDark() ? 'rgba(0,179,145,0.35)' : 'rgba(0,128,128,0.25)');
        gradient.addColorStop(1, 'rgba(0,179,145,0)');

        return new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.map(d => monthLabel(d.mes)),
                datasets: [{
                    label: 'Ingresos',
                    data: data.map(d => d.ingresos),
                    borderColor: PALETTE.verdeVibrante,
                    backgroundColor: gradient,
                    fill: true,
                    tension: 0.4,
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
                        ...baseTooltip(theme),
                        callbacks: {
                            title: items => `${items[0].label}`,
                            label: item => ` Ingresos: ${moneyFmt.format(item.parsed.y)}`,
                            afterLabel: item => ` Pedidos: ${data[item.dataIndex].pedidos}`
                        }
                    }
                },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: { color: theme.ticks, font: { family: 'Inter', size: 11, weight: '600' } },
                        border: { color: theme.grid }
                    },
                    y: {
                        beginAtZero: true,
                        grid: { color: theme.grid },
                        border: { display: false },
                        ticks: {
                            color: theme.ticks,
                            font: { family: 'Inter', size: 11 },
                            callback: v => '$' + (v >= 1000 ? (v / 1000).toFixed(1) + 'k' : v)
                        }
                    }
                }
            }
        });
    }

    /* ---- Gráfica de dona: Pedidos por estado ---- */
    function buildDoughnutChart(canvas, data, theme) {
        return new Chart(canvas.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: data.map(d => d.estado),
                datasets: [{
                    data: data.map(d => d.cantidad),
                    backgroundColor: data.map(d => ESTADO_COLORS[d.estado] || PALETTE.azulPantera),
                    borderColor: isDark() ? PALETTE.azulMarino : '#ffffff',
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
                        labels: {
                            color: theme.legend,
                            font: { family: 'Inter', size: 11, weight: '500' },
                            usePointStyle: true,
                            pointStyle: 'circle',
                            padding: 14
                        }
                    },
                    tooltip: {
                        ...baseTooltip(theme),
                        callbacks: {
                            label: item => {
                                const total = data.reduce((s, d) => s + d.cantidad, 0);
                                const pct = total > 0 ? ((item.parsed / total) * 100).toFixed(1) : 0;
                                return ` ${item.label}: ${item.parsed} (${pct}%)`;
                            }
                        }
                    }
                }
            }
        });
    }

    /* ---- Gráfica de barras: Ingresos por categoría ---- */
    function buildBarChart(canvas, data, theme) {
        const barColors = [
            PALETTE.verdeQuirurgico,
            PALETTE.verdeVibrante,
            PALETTE.azulPantera,
            PALETTE.indigo,
            PALETTE.blue,
            PALETTE.amber
        ];

        return new Chart(canvas.getContext('2d'), {
            type: 'bar',
            data: {
                labels: data.map(d => d.categoria),
                datasets: [{
                    label: 'Ingresos',
                    data: data.map(d => d.ingresos),
                    backgroundColor: data.map((_, i) => barColors[i % barColors.length] + (isDark() ? 'CC' : 'B3')),
                    borderColor: data.map((_, i) => barColors[i % barColors.length]),
                    borderWidth: 1.5,
                    borderRadius: 8,
                    maxBarThickness: 42
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        ...baseTooltip(theme),
                        callbacks: {
                            label: item => ` Ingresos: ${moneyFmt.format(item.parsed.y)}`,
                            afterLabel: item => ` Unidades: ${data[item.dataIndex].unidades}`
                        }
                    }
                },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: { color: theme.ticks, font: { family: 'Inter', size: 11, weight: '600' } },
                        border: { color: theme.grid }
                    },
                    y: {
                        beginAtZero: true,
                        grid: { color: theme.grid },
                        border: { display: false },
                        ticks: {
                            color: theme.ticks,
                            font: { family: 'Inter', size: 11 },
                            callback: v => '$' + (v >= 1000 ? (v / 1000).toFixed(1) + 'k' : v)
                        }
                    }
                }
            }
        });
    }

    /* ---- Re-tematizar gráficas al alternar modo oscuro ---- */
    function watchThemeChanges() {
        if (themeWatcherActive) return; // Evitar observadores duplicados en recargas
        themeWatcherActive = true;
        const observer = new MutationObserver(() => {
            const theme = themeColors();
            charts.forEach(chart => {
                // Actualizar escalas y leyenda sin reconstruir la gráfica
                if (chart.options.scales) {
                    Object.values(chart.options.scales).forEach(scale => {
                        if (scale.ticks) scale.ticks.color = theme.ticks;
                        if (scale.grid && scale.grid.color) scale.grid.color = theme.grid;
                        if (scale.border && scale.border.color) scale.border.color = theme.grid;
                    });
                }
                if (chart.options.plugins.legend && chart.options.plugins.legend.labels) {
                    chart.options.plugins.legend.labels.color = theme.legend;
                }
                const tip = chart.options.plugins.tooltip;
                if (tip) {
                    tip.backgroundColor = theme.tooltipBg;
                    tip.borderColor = theme.tooltipBorder;
                    tip.titleColor = isDark() ? '#f1f5f9' : PALETTE.azulPantera;
                    tip.bodyColor = theme.legend;
                }
                // Bordes de la dona según fondo
                if (chart.config.type === 'doughnut') {
                    chart.data.datasets[0].borderColor = isDark() ? PALETTE.azulMarino : '#ffffff';
                }
                chart.update();
            });
        });
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    }

    /* ---- Punto de entrada público ---- */
    window.initDashboardCharts = async function (authHeaders) {
        if (typeof Chart === 'undefined') {
            console.warn('Chart.js no está cargado. Se omite el módulo de analítica.');
            return;
        }

        const canvasVentas = document.getElementById('chart-ventas');
        const canvasEstados = document.getElementById('chart-estados');
        const canvasCategorias = document.getElementById('chart-categorias');
        if (!canvasVentas && !canvasEstados && !canvasCategorias) return;

        Chart.defaults.font.family = 'Inter';

        try {
            const res = await fetch(CONFIG.API_URL + '/dashboard/charts', { headers: authHeaders });
            if (!res.ok) throw new Error('Respuesta no válida del servidor');
            const data = await res.json();
            const theme = themeColors();

            // Destruir instancias previas (recargas)
            charts.forEach(c => c.destroy());
            charts = [];

            if (canvasVentas) {
                if (data.ventasMensuales && data.ventasMensuales.length > 0) {
                    charts.push(buildLineChart(canvasVentas, data.ventasMensuales, theme));
                } else {
                    showChartState('chart-ventas', 'fa-chart-line', 'Aún no hay ingresos registrados.');
                }
            }

            if (canvasEstados) {
                if (data.pedidosPorEstado && data.pedidosPorEstado.length > 0) {
                    charts.push(buildDoughnutChart(canvasEstados, data.pedidosPorEstado, theme));
                } else {
                    showChartState('chart-estados', 'fa-chart-pie', 'Sin pedidos para graficar.');
                }
            }

            if (canvasCategorias) {
                if (data.ventasPorCategoria && data.ventasPorCategoria.length > 0) {
                    charts.push(buildBarChart(canvasCategorias, data.ventasPorCategoria, theme));
                } else {
                    showChartState('chart-categorias', 'fa-chart-bar', 'Sin ventas por categoría aún.');
                }
            }

            watchThemeChanges();
        } catch (error) {
            console.error('Error cargando analítica:', error);
            ['chart-ventas', 'chart-estados', 'chart-categorias'].forEach(id => {
                if (document.getElementById(id)) {
                    showChartState(id, 'fa-plug-circle-xmark', 'No se pudo cargar la analítica.');
                }
            });
        }
    };
})();
