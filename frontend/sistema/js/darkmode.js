// js/darkmode.js - Gestor de Tema Oscuro para el Sistema Martex
(function() {
    // 1. Aplicar el tema inmediatamente (evita parpadeos)
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }

    // 2. Inyectar botón de cambio de tema al cargar el DOM
    document.addEventListener('DOMContentLoaded', () => {
        const injectToggle = () => {
            const headerActions = document.querySelector('.header-actions');

            if (!headerActions) {
                // Reintentar si el DOM aún no está listo
                setTimeout(injectToggle, 50);
                return;
            }

            // Evitar duplicados
            if (document.getElementById('system-theme-toggle')) return;

            const toggleBtn = document.createElement('button');
            toggleBtn.id = 'system-theme-toggle';
            toggleBtn.className = 'header-icon-btn';
            toggleBtn.title = 'Alternar Modo Oscuro';

            const icon = document.createElement('i');
            icon.className = document.documentElement.classList.contains('dark') ? 'fas fa-sun text-yellow-500' : 'fas fa-moon';
            toggleBtn.appendChild(icon);

            // Insertar al inicio de las acciones del header (antes de la campana)
            headerActions.insertBefore(toggleBtn, headerActions.firstChild);

            toggleBtn.addEventListener('click', () => {
                const isDark = document.documentElement.classList.contains('dark');
                if (isDark) {
                    document.documentElement.classList.remove('dark');
                    localStorage.setItem('theme', 'light');
                    icon.className = 'fas fa-moon';
                } else {
                    document.documentElement.classList.add('dark');
                    localStorage.setItem('theme', 'dark');
                    icon.className = 'fas fa-sun text-yellow-500';
                }
            });
        };

        injectToggle();
    });
})();
