// Guardar los datos en el panel principal
document.addEventListener("DOMContentLoaded", () => { 

    // 1. Recolectar los datos del pedido
    let pedidos = JSON.parse(localStorage.getItem('pedidos_martex'));
    if (!pedidos || pedidos.length === 0) {
        pedidos = [
            { id: 'ORD-048', fecha: '20 may', cliente: { nombre: 'Alessandro Ramirez' }, resumenProductos: 'Filipina Quirúrgica ×2', total: 74.97, estado: 'Pendiente' },
            { id: 'ORD-047', fecha: '9 may', cliente: { nombre: 'Mario Martinez' }, resumenProductos: 'Túnica Estética ×1', total: 29.99, estado: 'En proceso' },
            { id: 'ORD-046', fecha: '3 may', cliente: { nombre: 'Asdrubal Alianza' }, resumenProductos: 'Conjunto Dental Pro ×1', total: 34.50, estado: 'Listo' },
            { id: 'ORD-045', fecha: '1 may', cliente: { nombre: 'Génesis Guardado' }, resumenProductos: 'Bata Médica Premium ×1', total: 45.00, estado: 'Entregado' }
        ];
        localStorage.setItem('pedidos_martex', JSON.stringify(pedidos));
    }

    // 2. Recolectar los datos de productos (sincronizado con el Catálogo)
    let productos = JSON.parse(localStorage.getItem('martex_productos'));
    if (!productos || productos.length === 0) {
        productos = [
            { id: 1, nombre: 'Scrub Enfermera Básico', categoria: 'Médico', precio: 20.99 },
            { id: 2, nombre: 'Camisa Scrub Azul Marino', categoria: 'Médico', precio: 18.99 },
            { id: 3, nombre: 'Camisa Scrub Gris NiaaHinn', categoria: 'Médico', precio: 22.50 },
            { id: 4, nombre: 'Camisa Scrub Verde Esmeralda', categoria: 'Médico', precio: 24.00 },
            { id: 5, nombre: 'Conjunto Bata Médica', categoria: 'Médico / Estética', precio: 45.00 }
        ];
        localStorage.setItem('martex_productos', JSON.stringify(productos));
    }

    // 3. Recolectar y asegurar datos de Medidas (sincronizado con Historial)
    let medidas = JSON.parse(localStorage.getItem('martex_medidas'));
    if (!medidas || medidas.length === 0) {
        medidas = [
            { cliente: "Monica Rodriguez", busto: 88, cintura: 72, cadera: 94, hombros: 38, talla: "M", fecha: "2026-05-13" },
            { cliente: "Karen Pleitez", busto: 82, cintura: 66, cadera: 88, hombros: 36, talla: "S", fecha: "2026-05-12" },
            { cliente: "Aide López", busto: 96, cintura: 80, cadera: 102, hombros: 40, talla: "L", fecha: "2026-05-10" }
        ];
        localStorage.setItem('martex_medidas', JSON.stringify(medidas));
    }

    // Procesamiento de datos para KPIs
    let ingresosTotales = 0;
    let conteoEstados = { 'Pendiente': 0, 'En proceso': 0, 'Listo': 0, 'Entregado': 0 };
    let pedidosActivos = 0;

    pedidos.forEach(p => {
        ingresosTotales += parseFloat(p.total);
        if (conteoEstados[p.estado] !== undefined) {
            conteoEstados[p.estado]++;
        }
        if (p.estado === 'Pendiente' || p.estado === 'En proceso' || p.estado === 'Listo') {
            pedidosActivos++;
        }
    });

    // KPIs Principales en el DOM
    if (document.getElementById("kpi-ingresos")) {
        document.getElementById("kpi-ingresos").textContent = `$${ingresosTotales.toFixed(2)}`;
    }
    if (document.getElementById("kpi-pedidos")) {
        document.getElementById("kpi-pedidos").textContent = pedidosActivos;
    }
    if (document.getElementById("kpi-medidas")) {
        document.getElementById("kpi-medidas").textContent = medidas.length;
    }
    if (document.getElementById("kpi-productos")) {
        document.getElementById("kpi-productos").textContent = productos.length;
    }

    // Renderizar gráfico de barras de estados
    const containerGrafico = document.getElementById("container-grafico-estados");
    if (containerGrafico) {
        containerGrafico.innerHTML = "";
        
        const coloresBarras = {
            'Pendiente': 'bg-amber-500',
            'En proceso': 'bg-blue-500',
            'Listo': 'bg-medical-primary',
            'Entregado': 'bg-gray-400'
        };

        Object.keys(conteoEstados).forEach(estado => {
            const cantidad = conteoEstados[estado];
            const porcentaje = pedidos.length > 0 ? (cantidad / pedidos.length) * 100 : 0;

            containerGrafico.innerHTML += `
                <div class="space-y-1">
                    <div class="flex justify-between text-[11px]">
                        <span class="text-medical-muted">${estado}</span>
                        <span class="font-bold text-medical-dark">${cantidad} u. (${porcentaje.toFixed(0)}%)</span>
                    </div>
                    <div class="w-full bg-medical-border h-2 rounded-full overflow-hidden">
                        <div class="${coloresBarras[estado]} h-full transition-all duration-500" style="width: ${porcentaje}%"></div>
                    </div>
                </div>
            `;
        });
    }

    // Tabla de pedidos recientes
    const tablaRecientes = document.getElementById("tabla-recientes");
    if (tablaRecientes) {
        tablaRecientes.innerHTML = "";
        
        pedidos.slice(0, 4).forEach(p => {
            tablaRecientes.innerHTML += `
                <tr class="hover:bg-medical-bg/50 transition-colors">
                    <td class="py-3 font-mono font-bold text-medical-primary">${p.id}</td>
                    <td class="py-3 font-medium text-medical-dark">${p.cliente.nombre}</td>
                    <td class="py-3 text-medical-muted truncate max-w-[150px]">${p.resumenProductos}</td>
                    <td class="py-3 text-right font-bold text-medical-dark">$${parseFloat(p.total).toFixed(2)}</td>
                </tr>
            `;
        });
    }

    // Lista de Medidas recientes
    const listaMedidas = document.getElementById("lista-medidas-recientes");
    if (listaMedidas) {
        listaMedidas.innerHTML = "";
        
        medidas.slice(0, 3).forEach(m => {
            const fechaMostrada = m.fecha.includes("-") ? m.fecha.split("-").reverse().join("/") : m.fecha;

            listaMedidas.innerHTML += `
                <div class="py-2.5 flex justify-between items-center hover:bg-medical-bg/50 px-2 rounded transition-colors">
                    <div>
                        <p class="font-medium text-medical-dark">${m.cliente}</p>
                        <p class="text-[10px] text-medical-muted">Talla estándar calculada: <span class="text-medical-primary font-mono font-bold">${m.talla}</span></p>
                    </div>
                    <span class="text-[10px] text-medical-muted bg-medical-bg/80 px-2 py-1 rounded border border-medical-border/60">${fechaMostrada}</span>
                </div>
            `;
        });
    }

    // Recuento de Productos por Categoría
    const recuentoCategorias = {};
    productos.forEach(p => {
        recuentoCategorias[p.categoria] = (recuentoCategorias[p.categoria] || 0) + 1;
    });

    const listaCategorias = document.getElementById("lista-categorias-recuento");
    if (listaCategorias) {
        listaCategorias.innerHTML = "";
        
        Object.keys(recuentoCategorias).forEach(cat => {
            listaCategorias.innerHTML += `
                <div class="bg-medical-bg/60 border border-medical-border p-3 rounded flex flex-col justify-between">
                    <span class="text-medical-muted text-[10px] uppercase font-bold tracking-wider">${cat}</span>
                    <span class="text-lg font-bold text-medical-dark mt-1">${recuentoCategorias[cat]} <span class="text-[11px] font-normal text-medical-muted">Modelos</span></span>
                </div>
            `;
        });
    }
});