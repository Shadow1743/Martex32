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

        const isLoggedIn = !!localStorage.getItem('cliente_token');
        let clienteNombre = '';
        try {
            const c = JSON.parse(localStorage.getItem('cliente'));
            if (c) clienteNombre = c.nombre;
        } catch(e) {}

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
                    <div class="flex items-center gap-3">
                        <!-- Toggle de Tema Claro/Oscuro -->
                        <button id="theme-toggle" class="w-10 h-10 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition-all duration-300 text-lg" aria-label="Cambiar Tema">
                            <i id="theme-icon" class="fas fa-moon"></i>
                        </button>
                        
                        <!-- Botón Mi Cuenta -->
                        <div class="relative" id="account-dropdown-container">
                            ${isLoggedIn ? `
                                <button id="account-btn" class="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-3 py-2 rounded-full transition-all duration-300 text-sm">
                                    <div class="w-7 h-7 rounded-full bg-verde-quirurgico flex items-center justify-center text-xs font-bold text-white">${(clienteNombre || 'U').charAt(0).toUpperCase()}</div>
                                    <span class="hidden sm:inline text-white/90 font-medium max-w-[80px] truncate">${clienteNombre ? clienteNombre.split(' ')[0] : 'Mi Cuenta'}</span>
                                    <i class="fas fa-chevron-down text-[10px] text-white/50"></i>
                                </button>
                                <div id="account-dropdown" class="invisible opacity-0 absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 transform scale-95 transition-all duration-200 z-50">
                                    <div class="px-4 py-3 border-b border-gray-100">
                                        <p class="text-sm font-bold text-azul-marino truncate">${clienteNombre || 'Mi Cuenta'}</p>
                                        <p class="text-xs text-gray-400">Cliente Martex</p>
                                    </div>
                                    <a href="mi-cuenta.html" class="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-verde-quirurgico transition-colors">
                                        <i class="fas fa-user w-4 text-center"></i> Mi Perfil
                                    </a>
                                    <a href="mi-cuenta.html#pedidos" class="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-verde-quirurgico transition-colors">
                                        <i class="fas fa-box w-4 text-center"></i> Mis Pedidos
                                    </a>
                                    <a href="mi-cuenta.html#favoritos" class="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-verde-quirurgico transition-colors">
                                        <i class="fas fa-heart w-4 text-center"></i> Mis Favoritos
                                    </a>
                                    <div class="border-t border-gray-100 mt-1 pt-1">
                                        <button id="client-logout-btn" class="flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors w-full text-left">
                                            <i class="fas fa-sign-out-alt w-4 text-center"></i> Cerrar Sesión
                                        </button>
                                    </div>
                                </div>
                            ` : `
                                <button id="login-btn" class="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2.5 rounded-full transition-all duration-300 text-sm font-medium">
                                    <i class="fas fa-user text-xs"></i>
                                    <span class="hidden sm:inline">Mi Cuenta</span>
                                </button>
                            `}
                        </div>
                        
                        <button id="nav-cart-btn" class="group relative flex items-center gap-2 bg-verde-quirurgico hover:bg-verde-quirurgico-dark px-5 py-2.5 rounded-full transition-all duration-300 shadow-glow hover:scale-105">
                            <i class="fas fa-shopping-cart text-sm"></i>
                            <span class="font-semibold text-sm hidden sm:inline">Carrito</span>
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
                    ${isLoggedIn ? `
                        <div class="border-t border-white/10 pt-6 w-48 text-center space-y-4">
                            <a href="mi-cuenta.html" class="block text-lg font-semibold text-verde-quirurgico hover:text-white transition-colors">
                                <i class="fas fa-user mr-2"></i>Mi Cuenta
                            </a>
                            <button class="mobile-logout text-lg font-semibold text-red-400 hover:text-red-300 transition-colors">
                                <i class="fas fa-sign-out-alt mr-2"></i>Cerrar Sesión
                            </button>
                        </div>
                    ` : `
                        <div class="border-t border-white/10 pt-6">
                            <button class="mobile-login text-xl font-bold text-verde-quirurgico hover:text-white transition-colors">
                                <i class="fas fa-user mr-2"></i>Iniciar Sesión
                            </button>
                        </div>
                    `}
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
        
        const openMobileMenu = () => {
            if (mobileMenu) {
                mobileMenu.classList.remove('translate-x-full');
                document.body.classList.add('menu-open');
            }
        };
        const closeMobileMenu = () => {
            if (mobileMenu) {
                mobileMenu.classList.add('translate-x-full');
                document.body.classList.remove('menu-open');
            }
        };

        if (mobileMenuBtn) {
            mobileMenuBtn.addEventListener('click', openMobileMenu);
        }
        if (closeMobileMenuBtn) {
            closeMobileMenuBtn.addEventListener('click', closeMobileMenu);
        }
        // Auto-close mobile menu when a navigation link is clicked
        if (mobileMenu) {
            mobileMenu.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', closeMobileMenu);
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

        // ===== ACCOUNT BUTTON LOGIC =====
        const loginBtn = this.querySelector('#login-btn');
        if (loginBtn) {
            loginBtn.addEventListener('click', () => {
                const modal = document.querySelector('auth-modal');
                if (modal) modal.open('login');
            });
        }

        // Mobile login button
        const mobileLoginBtn = this.querySelector('.mobile-login');
        if (mobileLoginBtn) {
            mobileLoginBtn.addEventListener('click', () => {
                closeMobileMenu();
                const modal = document.querySelector('auth-modal');
                if (modal) modal.open('login');
            });
        }

        // Account dropdown toggle
        const accountBtn = this.querySelector('#account-btn');
        const accountDropdown = this.querySelector('#account-dropdown');
        if (accountBtn && accountDropdown) {
            accountBtn.addEventListener('click', () => {
                const isVisible = !accountDropdown.classList.contains('invisible');
                if (isVisible) {
                    accountDropdown.classList.add('invisible', 'opacity-0', 'scale-95');
                } else {
                    accountDropdown.classList.remove('invisible', 'opacity-0', 'scale-95');
                }
            });

            // Close dropdown on click outside
            document.addEventListener('click', (e) => {
                if (!accountBtn.contains(e.target) && !accountDropdown.contains(e.target)) {
                    accountDropdown.classList.add('invisible', 'opacity-0', 'scale-95');
                }
            });
        }

        // Logout buttons
        const logoutBtn = this.querySelector('#client-logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.clientLogout());
        }
        const mobileLogoutBtn = this.querySelector('.mobile-logout');
        if (mobileLogoutBtn) {
            mobileLogoutBtn.addEventListener('click', () => this.clientLogout());
        }

        // Listen for auth changes
        window.addEventListener('cliente_auth_change', () => {
            // Re-render navbar
            this.innerHTML = '';
            this.connectedCallback();
        });
    } 

    clientLogout() {
        localStorage.removeItem('cliente_token');
        localStorage.removeItem('cliente');
        window.dispatchEvent(new CustomEvent('cliente_auth_change'));
        if (window.location.pathname.includes('mi-cuenta')) {
            window.location.href = 'index.html';
        }
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