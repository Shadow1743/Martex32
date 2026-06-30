// Configuración inicial y carga de datos al cargar el DOM
document.addEventListener('DOMContentLoaded', () => {
    cargarPedidos();
    configurarEventos();
});

let pedidosData = [];

function getAuthHeaders() {
    const token = localStorage.getItem('token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
}

// Cargar pedidos desde la API
async function cargarPedidos() {
    try {
        const res = await fetch(CONFIG.API_URL + '/pedidos', {
            headers: getAuthHeaders()
        });
        if (!res.ok) throw new Error('Error al obtener los pedidos');
        
        const data = await res.json();
        
        // Formatear los datos para que coincidan con la vista
        pedidosData = data.map(p => {
            const fechaObj = new Date(p.creado_en);
            const fechaStr = fechaObj.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
            
            let resumen = 'Sin productos';
            if (p.items && p.items.length > 0 && p.items[0].producto_id !== null) {
                resumen = p.items.map(i => `${i.producto_nombre} ×${i.cantidad}`).join(', ');
            }

            return {
                id: p.id,
                fecha: fechaStr,
                cliente: {
                    nombre: p.cliente_nombre,
                    dui: p.dui || 'N/A',
                    telefono: p.cliente_telefono,
                    direccion: p.direccion
                },
                resumenProductos: resumen,
                total: parseFloat(p.total),
                estado: p.estado
            };
        });

        renderizarDashboard();
    } catch (err) {
        console.error(err);
        const tbody = document.getElementById('tabla-pedidos');
        if (tbody) tbody.innerHTML = `<tr><td colspan="6" class="text-center text-red-500 py-4">Error al cargar pedidos.</td></tr>`;
    }
}

// Renderizado Principal de la Tabla
function renderizarDashboard(filtroEstado = 'todos', terminoBusqueda = '') {
    const tbody = document.getElementById('tabla-pedidos');
    if (!tbody) return;
    
    tbody.innerHTML = '';

    // Actualizar contadores superiores dinámicamente
    const countPendientes = document.getElementById('count-pendientes');
    const countProceso = document.getElementById('count-proceso');
    const countListos = document.getElementById('count-listos');

    if (countPendientes) countPendientes.textContent = pedidosData.filter(p => p.estado === 'Nuevo' || p.estado === 'Pendiente').length;
    if (countProceso) countProceso.textContent = pedidosData.filter(p => p.estado === 'Procesando' || p.estado === 'En proceso').length;
    if (countListos) countListos.textContent = pedidosData.filter(p => p.estado === 'Entregado' || p.estado === 'Listo' || p.estado === 'Enviado').length;

    // Filtrar datos según estado y término de búsqueda
    let pedidosFiltrados = pedidosData;
    
    if (filtroEstado !== 'todos') {
        pedidosFiltrados = pedidosFiltrados.filter(p => {
            // Mapear filtros a posibles estados
            if(filtroEstado === 'Pendiente') return p.estado === 'Nuevo' || p.estado === 'Pendiente';
            if(filtroEstado === 'En proceso') return p.estado === 'Procesando' || p.estado === 'En proceso';
            if(filtroEstado === 'Listo') return p.estado === 'Enviado' || p.estado === 'Listo';
            if(filtroEstado === 'Entregado') return p.estado === 'Entregado';
            return p.estado === filtroEstado;
        });
    }
    
    if (terminoBusqueda) {
        const busqueda = terminoBusqueda.toLowerCase();
        pedidosFiltrados = pedidosFiltrados.filter(p => 
            p.id.toString().includes(busqueda) || 
            (p.cliente.nombre && p.cliente.nombre.toLowerCase().includes(busqueda))
        );
    }

    if (pedidosFiltrados.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center text-medical-muted py-4">No se encontraron pedidos.</td></tr>`;
        return;
    }

    // Dibujar las filas de la tabla
    pedidosFiltrados.forEach(pedido => {
        const tr = document.createElement('tr');
        tr.className = 'border-b border-medical-border/50 hover:bg-medical-bg/50 transition-colors';
        
        // Normalizar estados
        const esPendiente = pedido.estado === 'Nuevo' || pedido.estado === 'Pendiente';
        const esProceso = pedido.estado === 'Procesando' || pedido.estado === 'En proceso';
        const esListo = pedido.estado === 'Enviado' || pedido.estado === 'Listo';
        const esEntregado = pedido.estado === 'Entregado';

        let clasesEstiloSelect = 'bg-transparent text-medical-muted';
        if (esPendiente) clasesEstiloSelect = 'bg-transparent text-amber-600';
        if (esProceso) clasesEstiloSelect = 'bg-transparent text-blue-600';
        if (esListo) clasesEstiloSelect = 'bg-transparent text-medical-primary';
        if (esEntregado) clasesEstiloSelect = 'bg-transparent text-green-600';

        tr.innerHTML = `
            <td class="py-4 px-2">
                <div class="font-bold text-medical-dark">#${pedido.id}</div>
                <div class="text-xs text-medical-muted">${pedido.fecha}</div>
            </td>
            <td class="py-4 px-2 font-medium text-medical-dark">${pedido.cliente.nombre}</td>
            <td class="py-4 px-2 text-medical-muted max-w-xs truncate" title="${pedido.resumenProductos}">${pedido.resumenProductos}</td>
            <td class="py-4 px-2 font-bold text-medical-dark">$${pedido.total.toFixed(2)}</td>
            <td class="py-4 px-2 font-medium">
                <select 
                    onchange="cambiarEstadoPedido('${pedido.id}', this.value)" 
                    class="${clasesEstiloSelect} border border-transparent hover:border-medical-border rounded px-1 py-0.5 text-xs font-semibold focus:outline-none focus:bg-white focus:ring-1 focus:ring-medical-primary cursor-pointer transition-colors"
                >
                    <option value="Nuevo" class="text-amber-600" ${esPendiente ? 'selected' : ''}>Nuevo / Pendiente</option>
                    <option value="Procesando" class="text-blue-600" ${esProceso ? 'selected' : ''}>En proceso</option>
                    <option value="Enviado" class="text-medical-primary" ${esListo ? 'selected' : ''}>Enviado / Listo</option>
                    <option value="Entregado" class="text-green-600" ${esEntregado ? 'selected' : ''}>Entregado</option>
                </select>
            </td>
            <td class="py-4 px-2 text-center">
                <button onclick="verDetalles('${pedido.id}')" class="w-8 h-8 rounded bg-medical-card hover:bg-medical-bg border border-medical-border text-medical-muted hover:text-medical-dark transition-colors flex items-center justify-center mx-auto">
                    <i class="fa-solid fa-eye"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Configuración de eventos de los Filtros y Buscador
function configurarEventos() {
    const buscador = document.getElementById('buscador');
    if (buscador) {
        buscador.addEventListener('input', (e) => {
            const botonActivo = document.querySelector('#filtros-estado button.text-medical-primary');
            const estadoActivo = botonActivo ? botonActivo.dataset.filter : 'todos';
            renderizarDashboard(estadoActivo, e.target.value);
        });
    }

    const botones = document.querySelectorAll('#filtros-estado button');
    botones.forEach(btn => {
        btn.addEventListener('click', (e) => {
            botones.forEach(b => {
                b.classList.remove('font-bold', 'text-medical-primary');
                b.classList.add('text-medical-muted');
            });
            e.target.classList.remove('text-medical-muted');
            e.target.classList.add('font-bold', 'text-medical-primary');
            
            const busquedaActual = buscador ? buscador.value : '';
            renderizarDashboard(e.target.dataset.filter, busquedaActual);
        });
    });

    // Eventos para cerrar el modal
    const btnCerrar = document.getElementById('btn-cerrar-modal');
    if (btnCerrar) {
        btnCerrar.addEventListener('click', () => {
            document.getElementById('modal-detalle').classList.add('hidden');
        });
    }
    
    const modalDetalle = document.getElementById('modal-detalle');
    if (modalDetalle) {
        modalDetalle.addEventListener('click', (e) => {
            if (e.target.id === 'modal-detalle') {
                e.target.classList.add('hidden');
            }
        });
    }
}

// Función para cambiar el estado de los pedidos en el backend
window.cambiarEstadoPedido = async function(idPedido, nuevoEstado) {
    try {
        const res = await fetch(CONFIG.API_URL + '/pedidos/' + idPedido + '/estado', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeaders()
            },
            body: JSON.stringify({ estado: nuevoEstado })
        });

        if (!res.ok) throw new Error("Error al actualizar el estado");

        // Recargar los pedidos para reflejar el cambio y sincronizar con DB
        await cargarPedidos();
        
    } catch (err) {
        console.error(err);
        alert("Hubo un error al actualizar el pedido: " + err.message);
    }
};

// Mostrar modal con detalles completos del pedido
window.verDetalles = function(idPedido) {
    const pedido = pedidosData.find(p => p.id.toString() === idPedido.toString());

    if (!pedido) {
        console.error("No se encontró el pedido:", idPedido);
        return;
    }

    document.getElementById('modal-orden-id').textContent = '#' + pedido.id;
    document.getElementById('modal-cliente').textContent = pedido.cliente.nombre;
    document.getElementById('modal-dui').textContent = pedido.cliente.dui;
    document.getElementById('modal-telefono').textContent = pedido.cliente.telefono;
    document.getElementById('modal-direccion').textContent = pedido.cliente.direccion;
    document.getElementById('modal-productos').textContent = pedido.resumenProductos;
    document.getElementById('modal-total').textContent = '$' + pedido.total.toFixed(2);
    
    document.getElementById('modal-detalle').classList.remove('hidden');
};