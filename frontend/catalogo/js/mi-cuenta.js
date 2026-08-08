// mi-cuenta.js — Lógica para la página de cuenta del cliente
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('cliente_token');
    const guestState = document.getElementById('guest-state');
    const accountSection = document.getElementById('account-section');

    if (!token) {
        guestState.classList.remove('hidden');
        accountSection.classList.add('hidden');
        document.getElementById('guest-login-btn').addEventListener('click', () => {
            const modal = document.querySelector('auth-modal');
            if (modal) modal.open('login');
        });
        return;
    }

    guestState.classList.add('hidden');
    accountSection.classList.remove('hidden');

    const authHeaders = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

    // ===== TABS =====
    const tabs = document.querySelectorAll('.account-tab');
    const tabContents = document.querySelectorAll('.tab-content');

    function switchTab(tabName) {
        tabs.forEach(t => {
            if (t.dataset.tab === tabName) {
                t.classList.add('active', 'bg-verde-quirurgico', 'text-white', 'shadow-sm');
                t.classList.remove('text-gray-500', 'hover:bg-gray-50');
            } else {
                t.classList.remove('active', 'bg-verde-quirurgico', 'text-white', 'shadow-sm');
                t.classList.add('text-gray-500', 'hover:bg-gray-50');
            }
        });
        tabContents.forEach(tc => {
            if (tc.id === `tab-${tabName}`) {
                tc.classList.remove('hidden');
            } else {
                tc.classList.add('hidden');
            }
        });
    }

    tabs.forEach(t => t.addEventListener('click', () => switchTab(t.dataset.tab)));

    // Check URL hash for tab
    const hash = window.location.hash.replace('#', '');
    if (['perfil', 'pedidos', 'favoritos'].includes(hash)) {
        switchTab(hash);
    } else {
        switchTab('perfil');
    }

    // ===== PERFIL =====
    async function loadProfile() {
        try {
            const res = await fetch(CONFIG.API_URL + '/clientes/perfil', { headers: authHeaders });
            if (res.status === 401) {
                localStorage.removeItem('cliente_token');
                localStorage.removeItem('cliente');
                window.location.reload();
                return;
            }
            if (res.ok) {
                const data = await res.json();
                document.getElementById('profile-name').textContent = data.nombre;
                document.getElementById('profile-email').textContent = data.email;
                document.getElementById('profile-avatar').textContent = (data.nombre || 'U').charAt(0).toUpperCase();
                document.getElementById('input-nombre').value = data.nombre;
                document.getElementById('input-email').value = data.email;
                document.getElementById('input-telefono').value = data.telefono || '';
            }
        } catch (e) {
            console.error('Error cargando perfil:', e);
        }
    }

    document.getElementById('profile-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = e.target.querySelector('button[type="submit"]');
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Guardando...';

        try {
            const res = await fetch(CONFIG.API_URL + '/clientes/perfil', {
                method: 'PUT',
                headers: authHeaders,
                body: JSON.stringify({
                    nombre: document.getElementById('input-nombre').value,
                    telefono: document.getElementById('input-telefono').value
                })
            });
            if (res.ok) {
                const data = await res.json();
                localStorage.setItem('cliente', JSON.stringify(data.cliente));
                document.getElementById('profile-name').textContent = data.cliente.nombre;
                document.getElementById('profile-avatar').textContent = data.cliente.nombre.charAt(0).toUpperCase();
                window.dispatchEvent(new CustomEvent('cliente_auth_change'));
                showNotification('Perfil actualizado correctamente', 'success');
            } else {
                showNotification('Error al actualizar el perfil', 'error');
            }
        } catch (e) {
            showNotification('Error de conexión', 'error');
        } finally {
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-save mr-2"></i> Guardar Cambios';
        }
    });

    // ===== PEDIDOS =====
    async function loadPedidos() {
        const container = document.getElementById('pedidos-lista');
        try {
            const res = await fetch(CONFIG.API_URL + '/pedidos/mis-pedidos', { headers: authHeaders });
            if (res.ok) {
                const pedidos = await res.json();
                if (pedidos.length === 0) {
                    container.innerHTML = `
                        <div class="text-center py-12 text-gray-400">
                            <i class="fas fa-box-open text-4xl mb-4 opacity-50 block"></i>
                            <p class="text-lg font-medium">No tienes pedidos aún</p>
                            <p class="text-sm mt-1">Cuando hagas tu primera compra, aparecerá aquí.</p>
                            <a href="catalogo.html" class="inline-block mt-4 bg-verde-quirurgico hover:bg-verde-quirurgico-dark text-white font-semibold py-2.5 px-6 rounded-xl transition-all text-sm">
                                <i class="fas fa-store mr-2"></i> Ver Catálogo
                            </a>
                        </div>
                    `;
                    return;
                }

                container.innerHTML = pedidos.map(p => {
                    const statusColors = {
                        'Nuevo': 'bg-blue-100 text-blue-700',
                        'Procesando': 'bg-yellow-100 text-yellow-700',
                        'Enviado': 'bg-emerald-100 text-emerald-700',
                        'Entregado': 'bg-green-100 text-green-700',
                        'Cancelado': 'bg-red-100 text-red-700'
                    };
                    const statusIcons = {
                        'Nuevo': 'fa-clock',
                        'Procesando': 'fa-cog fa-spin',
                        'Enviado': 'fa-truck',
                        'Entregado': 'fa-check-circle',
                        'Cancelado': 'fa-times-circle'
                    };

                    const items = (p.items && p.items[0] && p.items[0].id) 
                        ? p.items.map(i => `<span class="text-xs bg-gray-100 px-2 py-1 rounded-lg">${escapeHTML(i.producto_nombre || 'Producto')} x${i.cantidad}</span>`).join(' ')
                        : '<span class="text-xs text-gray-400">Sin detalle</span>';

                    return `
                        <div class="border border-gray-100 rounded-2xl p-5 hover:shadow-md transition-all">
                            <div class="flex flex-col sm:flex-row justify-between items-start gap-4">
                                <div class="flex-1">
                                    <div class="flex items-center gap-3 mb-2">
                                        <span class="font-bold text-azul-marino">#ORD-${String(p.id).padStart(3, '0')}</span>
                                        <span class="px-3 py-1 rounded-full text-xs font-semibold ${statusColors[p.estado] || 'bg-gray-100 text-gray-600'}">
                                            <i class="fas ${statusIcons[p.estado] || 'fa-circle'} mr-1"></i> ${escapeHTML(p.estado)}
                                        </span>
                                    </div>
                                    <p class="text-xs text-gray-400 mb-3">
                                        <i class="fas fa-calendar mr-1"></i> ${new Date(p.creado_en).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
                                    </p>
                                    <div class="flex flex-wrap gap-1.5">${items}</div>
                                </div>
                                <div class="text-right shrink-0">
                                    <span class="text-xs text-gray-400 block">${escapeHTML(p.metodo_pago)}</span>
                                    <span class="font-display font-bold text-xl text-verde-quirurgico">$${parseFloat(p.total).toFixed(2)}</span>
                                </div>
                            </div>
                            
                            <!-- Timeline de estado -->
                            <div class="mt-4 pt-4 border-t border-gray-50">
                                <div class="flex items-center gap-1 overflow-x-auto">
                                    ${['Nuevo', 'Procesando', 'Enviado', 'Entregado'].map((estado, idx) => {
                                        const states = ['Nuevo', 'Procesando', 'Enviado', 'Entregado'];
                                        const currentIdx = states.indexOf(p.estado);
                                        const isActive = idx <= currentIdx && p.estado !== 'Cancelado';
                                        const isCancelled = p.estado === 'Cancelado';
                                        return `
                                            <div class="flex items-center gap-1 ${idx > 0 ? 'flex-1' : ''}">
                                                ${idx > 0 ? `<div class="h-0.5 flex-1 rounded ${isActive ? 'bg-verde-quirurgico' : 'bg-gray-200'} ${isCancelled ? 'bg-red-200' : ''}"></div>` : ''}
                                                <div class="w-2.5 h-2.5 rounded-full shrink-0 ${isActive ? 'bg-verde-quirurgico' : 'bg-gray-200'} ${isCancelled ? 'bg-red-300' : ''}"></div>
                                            </div>
                                        `;
                                    }).join('')}
                                </div>
                                <div class="flex justify-between mt-1">
                                    <span class="text-[10px] text-gray-400">Nuevo</span>
                                    <span class="text-[10px] text-gray-400">Procesando</span>
                                    <span class="text-[10px] text-gray-400">Enviado</span>
                                    <span class="text-[10px] text-gray-400">Entregado</span>
                                </div>
                            </div>
                        </div>
                    `;
                }).join('');
            }
        } catch (e) {
            container.innerHTML = '<div class="text-center py-12 text-red-400"><i class="fas fa-exclamation-triangle text-2xl mb-3 block"></i><p>Error al cargar pedidos</p></div>';
        }
    }

    // ===== FAVORITOS =====
    async function loadFavoritos() {
        const container = document.getElementById('favoritos-grid');
        try {
            const res = await fetch(CONFIG.API_URL + '/favoritos', { headers: authHeaders });
            if (res.ok) {
                const favoritos = await res.json();
                if (favoritos.length === 0) {
                    container.innerHTML = `
                        <div class="text-center py-12 text-gray-400 col-span-full">
                            <i class="fas fa-heart text-4xl mb-4 opacity-30 block"></i>
                            <p class="text-lg font-medium">No tienes favoritos</p>
                            <p class="text-sm mt-1">Explora el catálogo y agrega productos a tu lista.</p>
                            <a href="catalogo.html" class="inline-block mt-4 bg-verde-quirurgico hover:bg-verde-quirurgico-dark text-white font-semibold py-2.5 px-6 rounded-xl transition-all text-sm">
                                <i class="fas fa-store mr-2"></i> Ver Catálogo
                            </a>
                        </div>
                    `;
                    return;
                }

                container.innerHTML = favoritos.map(f => {
                    const precioFinal = f.precio_base - (f.precio_base * ((f.porcentaje_descuento || 0) / 100));
                    const imageUrl = f.imagen_url ? `${CONFIG.BASE_URL}${f.imagen_url}` : 'https://placehold.co/400x300/0A1128/FFFFFF?text=Martex';
                    return `
                        <div class="border border-gray-100 rounded-2xl overflow-hidden hover:shadow-md transition-all group">
                            <div class="h-48 bg-gray-100 relative overflow-hidden">
                                <img src="${escapeHTML(imageUrl)}" alt="${escapeHTML(f.nombre)}" class="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500">
                                <button onclick="removeFavorito('${escapeHTML(f.producto_id)}')" class="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 flex items-center justify-center text-red-500 hover:bg-red-50 transition-all shadow-sm">
                                    <i class="fas fa-heart"></i>
                                </button>
                            </div>
                            <div class="p-4">
                                <span class="text-xs bg-gray-100 px-2 py-0.5 rounded-full text-gray-500 font-medium">${escapeHTML(f.categoria || '')}</span>
                                <h4 class="font-display font-bold text-azul-marino mt-2 group-hover:text-verde-quirurgico transition-colors">${escapeHTML(f.nombre)}</h4>
                                <p class="font-display font-bold text-verde-quirurgico text-lg mt-1">$${precioFinal.toFixed(2)}</p>
                            </div>
                        </div>
                    `;
                }).join('');
            }
        } catch (e) {
            container.innerHTML = '<div class="text-center py-12 text-red-400 col-span-full"><i class="fas fa-exclamation-triangle text-2xl mb-3 block"></i><p>Error al cargar favoritos</p></div>';
        }
    }

    window.removeFavorito = async (productoId) => {
        try {
            const res = await fetch(`${CONFIG.API_URL}/favoritos/${productoId}`, {
                method: 'POST',
                headers: authHeaders
            });
            if (res.ok) {
                loadFavoritos();
                showNotification('Producto removido de favoritos', 'info');
            }
        } catch (e) {
            console.error('Error removiendo favorito:', e);
        }
    };


    // ===== NOTIFICATION HELPER =====
    function showNotification(msg, type = 'info') {
        // Create temporary toast
        const toast = document.createElement('div');
        const colors = {
            success: 'bg-green-500',
            error: 'bg-red-500',
            info: 'bg-blue-500'
        };
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            info: 'fa-info-circle'
        };
        toast.className = `fixed bottom-6 right-6 ${colors[type] || colors.info} text-white px-5 py-3 rounded-xl shadow-lg z-[100] flex items-center gap-2 text-sm font-medium transform translate-y-4 opacity-0 transition-all duration-300`;
        toast.innerHTML = `<i class="fas ${icons[type] || icons.info}"></i> ${msg}`;
        document.body.appendChild(toast);
        
        requestAnimationFrame(() => {
            toast.classList.remove('translate-y-4', 'opacity-0');
        });
        
        setTimeout(() => {
            toast.classList.add('translate-y-4', 'opacity-0');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // ===== LOAD ALL DATA =====
    loadProfile();
    loadPedidos();
    loadFavoritos();
});
