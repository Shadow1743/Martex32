// toast.js - Sistema de notificaciones elegante con Tailwind CSS
window.showToast = function(message, type = 'success', duration = 3000) {
    // Buscar o crear el contenedor de Toasts
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'fixed top-4 right-4 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none';
        document.body.appendChild(container);
    }

    // Crear el elemento del toast
    const toast = document.createElement('div');
    toast.className = 'pointer-events-auto transform translate-x-full opacity-0 transition-all duration-300 ease-out bg-white p-4 rounded-xl shadow-xl border flex items-center gap-3';
    
    // Configurar colores e íconos por tipo
    let iconClass = 'fas fa-check-circle text-teal-600';
    let borderColor = 'border-teal-100';
    
    if (type === 'error') {
        iconClass = 'fas fa-exclamation-circle text-red-500';
        borderColor = 'border-red-100';
    } else if (type === 'warning') {
        iconClass = 'fas fa-exclamation-triangle text-amber-500';
        borderColor = 'border-amber-100';
    } else if (type === 'info') {
        iconClass = 'fas fa-info-circle text-blue-500';
        borderColor = 'border-blue-100';
    }

    toast.classList.add(borderColor);

    toast.innerHTML = `
        <div class="text-lg shrink-0">
            <i class="${iconClass}"></i>
        </div>
        <div class="flex-grow text-sm font-medium text-gray-700 leading-tight">
            ${message}
        </div>
        <button class="text-gray-300 hover:text-gray-500 transition-colors focus:outline-none shrink-0">
            <i class="fas fa-times"></i>
        </button>
    `;

    // Añadir al contenedor
    container.appendChild(toast);

    // Animación de entrada
    setTimeout(() => {
        toast.classList.remove('translate-x-full', 'opacity-0');
    }, 50);

    // Auto-eliminar
    const timer = setTimeout(() => {
        closeToast(toast);
    }, duration);

    // Cerrar al hacer clic en el botón de cerrar
    const closeBtn = toast.querySelector('button');
    closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        clearTimeout(timer);
        closeToast(toast);
    });
};

function closeToast(toast) {
    toast.classList.add('translate-x-full', 'opacity-0');
    setTimeout(() => {
        toast.remove();
    }, 300);
}
