// Inicializar el modo oscuro lo antes posible para evitar parpadeos
(function() {
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
})();

class MainNavbar extends HTMLElement {
    connectedCallback() {
        this.clickCount = 0;
        this.clickTimeout = null;

        this.innerHTML = `
            <div class="fixed w-full top-4 z-50 px-4 transition-all duration-300" id="navbar-container">
                <nav class="max-w-6xl mx-auto glass-dark text-white rounded-full px-6 py-3 shadow-glass border border-white/10 transition-all duration-300 flex justify-between items-center">
                    
                    <!-- Logo -->
                    <h1 class="font-display text-2xl font-bold text-verde-quirurgico cursor-pointer select-none tracking-tight flex items-center gap-2" id="martex-logo">
                        <i class="fas fa-stethoscope text-xl"></i>
                        MARTEX
                    </h1>
                    
                    <!-- Enlaces Desktop -->
                    <div class="hidden md:flex items-center space-x-1 font-medium text-sm">
                        <a href="index.html" class="nav-link px-4 py-2 rounded-full text-white/90 hover:text-white hover:bg-white/10 transition-all">Inicio</a>
                        <a href="nosotros.html" class="nav-link px-4 py-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-all">Nosotros</a>
                        <a href="catalogo.html" class="nav-link px-4 py-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-all">Catálogo</a>
                    </div>
                    
                    <!-- Acciones -->
                    <div class="flex items-center gap-4">
                        <!-- Toggle de Tema Claro/Oscuro -->
                        <button id="theme-toggle" class="w-10 h-10 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition-all duration-300 text-lg" aria-label="Cambiar Tema">
                            <i id="theme-icon" class="fas fa-moon"></i>
                        </button>
                        
                        <button id="nav-cart-btn" class="group relative flex items-center gap-2 bg-verde-quirurgico hover:bg-verde-quirurgico-dark px-5 py-2.5 rounded-full transition-all duration-300 shadow-glow hover:scale-105">
                            <i class="fas fa-shopping-cart text-sm"></i>
                            <span class="font-semibold text-sm">Carrito</span>
                            <span id="cart-count" class="absolute -top-2 -right-2 bg-white text-azul-marino w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 border-verde-quirurgico">0</span>
                        </button>
                        
                        <!-- Mobile Menu Button -->
                        <button id="mobile-menu-btn" class="md:hidden text-white/80 hover:text-white p-2">
                            <i class="fas fa-bars text-xl"></i>
                        </button>
                    </div>
                </nav>

                <!-- Mobile Menu Overlay -->
                <div id="mobile-menu" class="fixed inset-0 bg-azul-marino/95 backdrop-blur-md z-40 transform translate-x-full transition-transform duration-300 md:hidden flex flex-col justify-center items-center space-y-8">
                    <button id="close-mobile-menu" class="absolute top-6 right-6 text-white text-3xl hover:text-verde-quirurgico transition-colors">
                        <i class="fas fa-times"></i>
                    </button>
                    <a href="index.html" class="text-2xl font-bold text-white hover:text-verde-quirurgico transition-colors">Inicio</a>
                    <a href="nosotros.html" class="text-2xl font-bold text-white hover:text-verde-quirurgico transition-colors">Nosotros</a>
                    <a href="catalogo.html" class="text-2xl font-bold text-white hover:text-verde-quirurgico transition-colors">Catálogo</a>
                </div>
            </div>
        `;

        // Activar visualmente el enlace de la página actual
        const currentPath = window.location.pathname.split("/").pop() || "index.html";
        const links = this.querySelectorAll(".nav-link");
        links.forEach(link => {
            if (link.getAttribute("href") === currentPath) {
                link.classList.add("bg-white/10", "text-white");
                link.classList.remove("text-white/70");
            }
        });

        // Efecto scroll para el navbar
        window.addEventListener('scroll', () => {
            const container = this.querySelector('#navbar-container');
            if (window.scrollY > 20) {
                container.classList.add('top-0', 'px-0');
                container.classList.remove('top-4', 'px-4');
                container.querySelector('nav').classList.remove('rounded-full');
            } else {
                container.classList.remove('top-0', 'px-0');
                container.classList.add('top-4', 'px-4');
                container.querySelector('nav').classList.add('rounded-full');
            }
        });

        // Easter egg
        this.querySelector('#martex-logo').addEventListener('click', () => this.handleSecretClick());

        // Lógica de Modo Oscuro
        const toggleBtn = this.querySelector('#theme-toggle');
        const themeIcon = this.querySelector('#theme-icon');
        
        const updateIcon = (isDarkTheme) => {
            if (themeIcon) {
                if (isDarkTheme) {
                    themeIcon.className = 'fas fa-sun';
                } else {
                    themeIcon.className = 'fas fa-moon';
                }
            }
        };

        // Detectar estado inicial en carga del componente
        updateIcon(document.documentElement.classList.contains('dark'));

        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                const currentIsDark = document.documentElement.classList.contains('dark');
                if (currentIsDark) {
                    document.documentElement.classList.remove('dark');
                    localStorage.setItem('theme', 'light');
                    updateIcon(false);
                } else {
                    document.documentElement.classList.add('dark');
                    localStorage.setItem('theme', 'dark');
                    updateIcon(true);
                }
            });
        }

        // Mobile Menu Toggle Logic
        const mobileMenuBtn = this.querySelector('#mobile-menu-btn');
        const closeMobileMenuBtn = this.querySelector('#close-mobile-menu');
        const mobileMenu = this.querySelector('#mobile-menu');
        
        if (mobileMenuBtn && mobileMenu) {
            mobileMenuBtn.addEventListener('click', () => {
                mobileMenu.classList.remove('translate-x-full');
            });
        }
        if (closeMobileMenuBtn && mobileMenu) {
            closeMobileMenuBtn.addEventListener('click', () => {
                mobileMenu.classList.add('translate-x-full');
            });
        }

        // Event listener para el botón del carrito
        const navCartBtn = this.querySelector('#nav-cart-btn');
        if (navCartBtn) {
            navCartBtn.addEventListener('click', (e) => {
                e.preventDefault();
                if (typeof window.toggleCart === 'function') {
                    window.toggleCart();
                } else {
                    console.error('toggleCart function is not defined.');
                }
            });
        }

        // Logica para actualizar badge de carrito
        const updateCartCount = () => {
            const countEl = this.querySelector('#cart-count');
            if (countEl) {
                const carrito = JSON.parse(localStorage.getItem('martex_carrito')) || [];
                const totalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0);
                countEl.innerText = totalItems;
            }
        };
        
        window.addEventListener('carrito_actualizado', updateCartCount);
        // Llamar inicialmente para setear valor on-load
        setTimeout(updateCartCount, 50);
    } 

    handleSecretClick() { 
        clearTimeout(this.clickTimeout);
        this.clickCount++;

        if (this.clickCount === 5) {
            this.clickCount = 0; 
            window.location.href = '../sistema/login.html'; 
        } else {
            this.clickTimeout = setTimeout(() => {
                this.clickCount = 0;
            }, 3000);
        }
    } 
}
 
if (!customElements.get('main-navbar')) {
    customElements.define('main-navbar', MainNavbar);
}