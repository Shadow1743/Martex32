// notificaciones.js - Sistema global de alertas para nuevos pedidos
(function() {
    const token = localStorage.getItem('token');
    if (!token) return;

    // Localiza el badge de la campana soportando el markup nuevo (#notification-badge)
    // y el legado (.header-icon-btn .badge) de vistas aún no refactorizadas.
    function getBadge() {
        return document.getElementById('notification-badge') ||
               document.querySelector('.header-icon-btn .badge');
    }

    // Función para reproducir un sonido sutil (sin depender de archivos externos)
    function playNotificationSound() {
        // Prevenir que múltiples pestañas suenen al mismo tiempo
        const lastAlert = localStorage.getItem('martex_last_alert_time');
        const now = Date.now();
        if (lastAlert && (now - parseInt(lastAlert)) < 3000) {
            return; // Otra pestaña ya reprodujo el sonido recientemente
        }
        localStorage.setItem('martex_last_alert_time', now.toString());

        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            
            // Un tono suave tipo "ding"
            osc.type = 'sine';
            osc.frequency.setValueAtTime(880, ctx.currentTime); // Nota La (A5)
            osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.1);
            
            gain.gain.setValueAtTime(0, ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
            
            osc.connect(gain);
            gain.connect(ctx.destination);
            
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.5);
        } catch(e) {
            console.log("Web Audio API no soportada en este navegador.");
        }
    }

    async function checkNewOrders() {
        try {
            const res = await fetch(CONFIG.API_URL + '/pedidos', { 
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (res.ok) {
                const pedidos = await res.json();
                if (pedidos.length === 0) return;
                
                const latestId = Math.max(...pedidos.map(p => p.id));
                const savedId = localStorage.getItem('martex_last_order_id');
                
                if (savedId !== null) {
                    const lastIdNum = parseInt(savedId);
                    if (latestId > lastIdNum) {
                        const countNew = pedidos.filter(p => p.id > lastIdNum).length;
                        
                        // 1. Reproducir sonido
                        playNotificationSound();
                        
                        // 2. Mostrar Toast
                        if (typeof showToast === 'function') {
                            showToast(`¡Han ingresado ${countNew} pedido(s) nuevo(s) de la tienda!`, 'info', 6000);
                        }
                        
                        // 3. Actualizar la campana (badge rojo y animación)
                        const badge = getBadge();
                        if (badge) badge.classList.remove('hidden');
                        
                        const bell = document.getElementById('notification-bell');
                        if (bell) {
                            bell.classList.add('animate-bounce');
                            setTimeout(() => bell.classList.remove('animate-bounce'), 3000);
                        }

                        // 4. Despachar evento para que otras páginas se actualicen en tiempo real
                        window.dispatchEvent(new CustomEvent('martex_new_order'));
                    }
                }
                
                // Guardar el ID más reciente
                localStorage.setItem('martex_last_order_id', latestId);
            }
        } catch (e) {
            // Falla silenciosa si no hay conexión
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        // Carga inicial silenciosa para establecer el último ID
        if (!localStorage.getItem('martex_last_order_id')) {
            fetch(CONFIG.API_URL + '/pedidos', { 
                headers: { 'Authorization': `Bearer ${token}` }
            }).then(r => r.json()).then(pedidos => {
                if (pedidos.length > 0) {
                    const latestId = Math.max(...pedidos.map(p => p.id));
                    localStorage.setItem('martex_last_order_id', latestId);
                } else {
                    localStorage.setItem('martex_last_order_id', '0');
                }
            }).catch(e => {});
        }

        // Consultar cada 10 segundos
        setInterval(checkNewOrders, 10000);
        
        // Manejar click en la campana
        const bell = document.getElementById('notification-bell');
        if (bell) {
            bell.addEventListener('click', () => {
                const badge = getBadge();
                if (badge) badge.classList.add('hidden');
                
                // Ir a la vista de pedidos si no estamos allí
                if (!window.location.href.includes('pedidos.html')) {
                    window.location.href = 'pedidos.html';
                }
            });
        }
    });
})();
