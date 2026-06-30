document.addEventListener("DOMContentLoaded", () => {
    const currentPath = window.location.pathname;
    let activeTab = "";

    // Identificación de la pestaña activa basándose en la URL actual
    if (currentPath.includes("dashboard_pedidos.html")) {
        activeTab = "pedidos";
    } else if (currentPath.includes("Medidas_registrar.html") || currentPath.includes("Medidas_historial.html") || currentPath.includes("medidad_modificar.html")) {
        activeTab = "medidas";
    } else if (currentPath.includes("modulo_catalogo.html")) {
        activeTab = "catalogo";
    } else if (currentPath.includes("index.html") || currentPath.endsWith("/")) {
        activeTab = "inicio";
    }

    const navbarHTML = `
    <button id="hamburger-btn" class="fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-medical md:hidden text-medical-primary border border-medical-border transition-colors hover:bg-medical-bg">
        <i class="fa-solid fa-bars text-lg"></i>
    </button>

    <div id="sidebar-overlay" class="fixed inset-0 bg-black/40 z-30 hidden md:hidden backdrop-blur-xs"></div>

    <aside id="sidebar" class="fixed top-0 left-0 h-full w-64 bg-medical-card border-r border-medical-border shadow-medical z-40 transform -translate-x-full transition-transform duration-300 ease-in-out md:translate-x-0 flex flex-col">
        
        <div class="p-5 border-b border-medical-border flex items-center justify-between shrink-0">
            <div class="flex items-center select-none cursor-pointer" id="martex-logo">
                <h1 class="text-medical-primary text-2xl font-bold tracking-wider uppercase font-sans">Martex</h1>
            </div>
            <button id="close-sidebar" class="md:hidden text-medical-muted hover:text-medical-dark transition-colors">
                <i class="fa-solid fa-xmark text-lg"></i>
            </button>
        </div>

        <nav class="flex-grow p-4 overflow-y-auto">
            <ul class="space-y-1.5 text-xs font-semibold uppercase tracking-wider">
                <li>
                    <a href="index.html" class="flex items-center space-x-3 p-3 rounded-lg transition-colors ${activeTab === 'inicio' ? 'bg-medical-primary/10 text-medical-primary border-r-4 border-medical-primary' : 'text-medical-muted hover:bg-medical-bg hover:text-medical-dark'}">
                        <i class="fa-solid fa-house text-sm w-5 text-center"></i>
                        <span>Inicio</span>
                    </a>
                </li>
                <li>
                    <a href="dashboard_pedidos.html" class="flex items-center space-x-3 p-3 rounded-lg transition-colors ${activeTab === 'pedidos' ? 'bg-medical-primary/10 text-medical-primary border-r-4 border-medical-primary' : 'text-medical-muted hover:bg-medical-bg hover:text-medical-dark'}">
                        <i class="fa-solid fa-cart-shopping text-sm w-5 text-center"></i>
                        <span>Pedidos</span>
                    </a>
                </li>
                <li>
                    <a href="Medidas_historial.html" class="flex items-center space-x-3 p-3 rounded-lg transition-colors ${activeTab === 'medidas_historial' ? 'bg-medical-primary/10 text-medical-primary border-r-4 border-medical-primary' : 'text-medical-muted hover:bg-medical-bg hover:text-medical-dark'}">
                        <i class="fa-solid fa-ruler-combined text-sm w-5 text-center"></i>
                        <span>Medidas</span>
                    </a>
                </li>
                <li>
                    <a href="modulo_catalogo.html" class="flex items-center space-x-3 p-3 rounded-lg transition-colors ${activeTab === 'catalogo' ? 'bg-medical-primary/10 text-medical-primary border-r-4 border-medical-primary' : 'text-medical-muted hover:bg-medical-bg hover:text-medical-dark'}">
                        <i class="fa-solid fa-book text-sm w-5 text-center"></i>
                        <span>Catálogo</span>
                    </a>
                </li>
            </ul>
        </nav>

        <div class="p-4 border-t border-medical-border bg-medical-bg/50 shrink-0">
            <div class="flex items-center justify-between px-1">
                <div class="flex flex-col">
                    <span class="text-[9px] text-medical-muted uppercase font-bold tracking-wider">Usuario</span>
                    <span class="text-xs font-bold text-medical-dark">Empleado</span>
                </div>
                <button onclick="cerrarSesion()" class="p-2 text-medical-muted hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Cerrar Sesión">
                    <i class="fa-solid fa-arrow-right-from-bracket text-sm"></i>
                </button>
            </div>
        </div>
    </aside>
    `;

    const container = document.getElementById("navbar-container");
    if (container) {
        container.innerHTML = navbarHTML;
    }

    // Funcionalidad interactiva de apertura y cierre para móviles
    const sidebar = document.getElementById("sidebar");
    const hamburgerBtn = document.getElementById("hamburger-btn");
    const closeBtn = document.getElementById("close-sidebar");
    const overlay = document.getElementById("sidebar-overlay");

    const toggleSidebar = () => {
        if (sidebar && overlay) {
            sidebar.classList.toggle("-translate-x-full");
            overlay.classList.toggle("hidden");
        }
    };

    if (hamburgerBtn) hamburgerBtn.addEventListener("click", toggleSidebar);
    if (closeBtn) closeBtn.addEventListener("click", toggleSidebar);
    if (overlay) overlay.addEventListener("click", toggleSidebar);

    // Hito de seguridad secreto: Redirección mediante 5 clics en el logotipo
    let clickCount = 0;
    let clickTimeout = null;
    const logoElement = document.getElementById("martex-logo");

    if (logoElement) {
        logoElement.addEventListener("click", () => {
            clearTimeout(clickTimeout);
            clickCount++;
            if (clickCount === 5) {
                clickCount = 0;
                window.location.href = "ProyectoMartex/sistema/login.html";
            } else {
                clickTimeout = setTimeout(() => { clickCount = 0; }, 3000);
            }
        });
    }

    window.cerrarSesion = function() {
        localStorage.removeItem('user');
        alert('Sesión cerrada correctamente.');
        window.location.href = "login.html";
    };
});