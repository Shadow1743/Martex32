// Gestión inicial de tema sin parpadeo
(function() {
    try {
        const savedTheme = localStorage.getItem('theme');
        const systemPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    } catch(e) {}
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
            <header class="sticky top-0 z-50 w-full bg-white/95 dark:bg-[#060D1A]/95 backdrop-blur-md border-b border-slate-200/80 dark:border-white/10 transition-colors duration-200" id="main-header">
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div class="flex items-center justify-between h-20">
                        
                        <!-- Logo & Sastrería Marca -->
                        <a href="index.html" class="flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-verde-quirurgico/40 rounded-xl" id="martex-logo">
                            <div class="w-10 h-10 rounded-xl bg-verde-quirurgico flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
                                <i class="fas fa-stethoscope text-lg"></i>
                            </div>
                            <div class="flex flex-col">
                                <span class="font-display font-black text-2xl tracking-tight text-azul-marino dark:text-white leading-none">MARTEX</span>
                                <span class="text-[10px] font-bold tracking-widest text-verde-quirurgico uppercase mt-0.5">Sastrería Médica</span>
                            </div>
                        </a>
                        
                        <!-- Enlaces de Navegación Desktop -->
                        <nav class="hidden md:flex items-center gap-1 bg-slate-100/70 dark:bg-white/5 p-1 rounded-2xl border border-slate-200/60 dark:border-white/10">
                            <a href="index.html" class="nav-link px-5 py-2 rounded-xl text-sm font-semibold transition-all text-slate-700 dark:text-slate-200 hover:text-verde-quirurgico dark:hover:text-emerald-300 hover:bg-white dark:hover:bg-white/10">Inicio</a>
                            <a href="catalogo.html" class="nav-link px-5 py-2 rounded-xl text-sm font-semibold transition-all text-slate-700 dark:text-slate-200 hover:text-verde-quirurgico dark:hover:text-emerald-300 hover:bg-white dark:hover:bg-white/10">Catálogo</a>
                            <a href="nosotros.html" class="nav-link px-5 py-2 rounded-xl text-sm font-semibold transition-all text-slate-700 dark:text-slate-200 hover:text-verde-quirurgico dark:hover:text-emerald-300 hover:bg-white dark:hover:bg-white/10">Nosotros</a>
                        </nav>
                        
                        <!-- Acciones (Tema, Cuenta, Carrito, Menú Móvil) -->
                        <div class="flex items-center gap-2 sm:gap-3">
                            
                            <!-- Toggle Modo Claro / Oscuro -->
                            <button id="theme-toggle" class="w-11 h-11 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-azul-marino dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 active:scale-95 transition-all duration-150 border border-slate-200/60 dark:border-white/10" aria-label="Cambiar tema de color" title="Alternar modo claro/oscuro">
                                <i id="theme-icon" class="fas fa-moon text-base"></i>
                            </button>
                            
                            <!-- Botón Mi Cuenta & Dropdown -->
                            <div class="relative" id="account-dropdown-container">
                                ${isLoggedIn ? `
                                    <button id="account-btn" class="min-h-[44px] flex items-center gap-2 bg-slate-100 hover:bg-slate-200/80 dark:bg-white/10 dark:hover:bg-white/15 px-3.5 py-2 rounded-xl active:scale-95 transition-all duration-150 text-sm border border-slate-200/70 dark:border-white/10 text-azul-marino dark:text-white">
                                        <div class="w-7 h-7 rounded-lg bg-verde-quirurgico flex items-center justify-center text-xs font-bold text-white shadow-xs">${(clienteNombre || 'U').charAt(0).toUpperCase()}</div>
                                        <span class="hidden sm:inline font-semibold max-w-[90px] truncate">${clienteNombre ? clienteNombre.split(' ')[0] : 'Mi Cuenta'}</span>
                                        <i class="fas fa-chevron-down text-[10px] text-slate-400"></i>
                                    </button>
                                    <div id="account-dropdown" class="invisible opacity-0 absolute right-0 top-full mt-2 w-56 bg-white dark:bg-[#0A1428] rounded-2xl shadow-xl border border-slate-200/80 dark:border-white/15 py-2 transform scale-95 transition-all duration-150 z-50">
                                        <div class="px-4 py-3 border-b border-slate-100 dark:border-white/10">
                                            <p class="text-sm font-bold text-azul-marino dark:text-white truncate">${clienteNombre || 'Mi Cuenta'}</p>
                                            <p class="text-xs text-slate-500 dark:text-slate-400">Cliente Martex</p>
                                        </div>
                                        <a href="mi-cuenta.html" class="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-verde-quirurgico transition-colors min-h-[44px]">
                                            <i class="fas fa-user w-4 text-center text-verde-quirurgico"></i> Mi Perfil
                                        </a>
                                        <a href="mi-cuenta.html#pedidos" class="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-verde-quirurgico transition-colors min-h-[44px]">
                                            <i class="fas fa-box w-4 text-center text-verde-quirurgico"></i> Mis Pedidos
                                        </a>
                                        <a href="mi-cuenta.html#favoritos" class="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-verde-quirurgico transition-colors min-h-[44px]">
                                            <i class="fas fa-heart w-4 text-center text-verde-quirurgico"></i> Mis Favoritos
                                        </a>
                                        <div class="border-t border-slate-100 dark:border-white/10 mt-1 pt-1">
                                            <button id="client-logout-btn" class="flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors w-full text-left min-h-[44px]">
                                                <i class="fas fa-sign-out-alt w-4 text-center"></i> Cerrar Sesión
                                            </button>
                                        </div>
                                    </div>
                                ` : `
                                    <button id="login-btn" class="min-h-[44px] flex items-center gap-2 bg-slate-100 hover:bg-slate-200/80 dark:bg-white/10 dark:hover:bg-white/15 px-4 py-2.5 rounded-xl active:scale-95 transition-all duration-150 text-sm font-semibold text-azul-marino dark:text-white border border-slate-200/70 dark:border-white/10">
                                        <i class="fas fa-user text-xs text-verde-quirurgico"></i>
                                        <span class="hidden sm:inline">Mi Cuenta</span>
                                    </button>
                                `}
                            </div>
                            
                            <!-- Botón Carrito de Compras (CTA Primario) -->
                            <button id="nav-cart-btn" class="group relative min-h-[44px] flex items-center gap-2 bg-verde-quirurgico hover:bg-verde-quirurgico-dark text-white px-4 sm:px-5 py-2.5 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md active:scale-95">
                                <i class="fas fa-shopping-cart text-sm"></i>
                                <span class="font-semibold text-sm hidden sm:inline">Carrito</span>
                                <span id="cart-count" class="bg-white dark:bg-azul-marino text-verde-quirurgico dark:text-emerald-300 font-extrabold text-xs px-2 py-0.5 rounded-full border border-verde-quirurgico-accent/30 shadow-xs">0</span>
                            </button>
                            
                            <!-- Botón Menú Móvil -->
                            <button id="mobile-menu-btn" class="md:hidden w-11 h-11 rounded-xl flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 active:scale-95 transition-colors border border-slate-200/60 dark:border-white/10" aria-label="Abrir menú de navegación">
                                <i class="fas fa-bars text-lg"></i>
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Drawer Móvil Desplegable -->
                <div id="mobile-menu" class="fixed inset-0 bg-azul-marino/70 dark:bg-black/80 backdrop-blur-sm z-50 transform translate-x-full transition-transform duration-300 md:hidden flex justify-end">
                    <div class="w-full max-w-xs bg-white dark:bg-[#060D1A] h-full shadow-2xl p-6 flex flex-col justify-between border-l border-slate-200 dark:border-white/10">
                        <div>
                            <div class="flex items-center justify-between pb-6 border-b border-slate-100 dark:border-white/10">
                                <div class="flex items-center gap-2">
                                    <div class="w-8 h-8 rounded-lg bg-verde-quirurgico flex items-center justify-center text-white text-sm">
                                        <i class="fas fa-stethoscope"></i>
                                    </div>
                                    <span class="font-display font-extrabold text-lg text-azul-marino dark:text-white">MARTEX</span>
                                </div>
                                <button id="close-mobile-menu" class="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors" aria-label="Cerrar menú">
                                    <i class="fas fa-times text-lg"></i>
                                </button>
                            </div>

                            <nav class="flex flex-col gap-2 mt-6">
                                <a href="index.html" class="flex items-center px-4 py-3 rounded-xl text-base font-semibold text-slate-700 dark:text-slate-200 hover:text-verde-quirurgico dark:hover:text-emerald-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                    <i class="fas fa-home w-6 text-verde-quirurgico"></i> Inicio
                                </a>
                                <a href="catalogo.html" class="flex items-center px-4 py-3 rounded-xl text-base font-semibold text-slate-700 dark:text-slate-200 hover:text-verde-quirurgico dark:hover:text-emerald-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                    <i class="fas fa-tshirt w-6 text-verde-quirurgico"></i> Catálogo de Uniformes
                                </a>
                                <a href="nosotros.html" class="flex items-center px-4 py-3 rounded-xl text-base font-semibold text-slate-700 dark:text-slate-200 hover:text-verde-quirurgico dark:hover:text-emerald-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                    <i class="fas fa-users w-6 text-verde-quirurgico"></i> Sobre Nosotros
                                </a>
                            </nav>
                        </div>

                        <div class="pt-6 border-t border-slate-100 dark:border-white/10 space-y-3">
                            ${isLoggedIn ? `
                                <a href="mi-cuenta.html" class="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-slate-100 dark:bg-white/10 text-azul-marino dark:text-white font-semibold text-sm">
                                    <i class="fas fa-user text-verde-quirurgico"></i> Mi Cuenta (${clienteNombre ? clienteNombre.split(' ')[0] : 'Perfil'})
                                </a>
                                <button class="mobile-logout flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 text-sm font-semibold transition-colors">
                                    <i class="fas fa-sign-out-alt"></i> Cerrar Sesión
                                </button>
                            ` : `
                                <button class="mobile-login flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-verde-quirurgico hover:bg-verde-quirurgico-dark text-white font-semibold text-sm shadow-sm transition-all">
                                    <i class="fas fa-user"></i> Iniciar Sesión / Registrarse
                                </button>
                            `}
                            <div class="text-center text-xs text-slate-400 pt-2">
                                Taller en Usulután · Envíos nacionales
                            </div>
                        </div>
                    </div>
                </div>
            </header>
        `;

        // Activar visualmente el enlace de la página actual
        const currentPath = window.location.pathname.split("/").pop() || "index.html";
        const links = this.querySelectorAll(".nav-link");
        links.forEach(link => {
            const href = link.getAttribute("href");
            if (href === currentPath || (currentPath === "" && href === "index.html")) {
                link.classList.add("bg-white", "dark:bg-white/15", "text-verde-quirurgico", "dark:text-white", "shadow-xs");
                link.classList.remove("text-slate-700", "dark:text-slate-200");
            }
        });

        // Easter egg
        const logo = this.querySelector('#martex-logo');
        if (logo) logo.addEventListener('click', (e) => {
            // Permitir navegación normal con un clic, pero si se hace spam redirige al panel
            this.handleSecretClick(e);
        });

        // Lógica de Modo Oscuro Robusta
        const toggleBtn = this.querySelector('#theme-toggle');
        const themeIcon = this.querySelector('#theme-icon');
        
        const updateThemeUI = (isDark) => {
            if (themeIcon) {
                themeIcon.className = isDark ? 'fas fa-sun text-amber-400' : 'fas fa-moon text-slate-600';
            }
            if (toggleBtn) {
                toggleBtn.setAttribute('title', isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro');
            }
        };

        // Estado inicial
        const initialDark = document.documentElement.classList.contains('dark');
        updateThemeUI(initialDark);

        if (toggleBtn) {
            toggleBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const nowDark = document.documentElement.classList.toggle('dark');
                try {
                    localStorage.setItem('theme', nowDark ? 'dark' : 'light');
                } catch(err) {}
                updateThemeUI(nowDark);
                window.dispatchEvent(new CustomEvent('theme-changed', { detail: { isDark: nowDark } }));
            });
        }

        // Mobile Menu Toggle
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

        if (mobileMenuBtn) mobileMenuBtn.addEventListener('click', openMobileMenu);
        if (closeMobileMenuBtn) closeMobileMenuBtn.addEventListener('click', closeMobileMenu);
        if (mobileMenu) {
            mobileMenu.addEventListener('click', (e) => {
                if (e.target === mobileMenu) closeMobileMenu();
            });
            mobileMenu.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', closeMobileMenu);
            });
        }

        // Botón del carrito
        const navCartBtn = this.querySelector('#nav-cart-btn');
        if (navCartBtn) {
            navCartBtn.addEventListener('click', (e) => {
                e.preventDefault();
                if (typeof window.toggleCart === 'function') {
                    window.toggleCart();
                }
            });
        }

        // Actualizar contador del carrito
        const updateCartCount = () => {
            const countEl = this.querySelector('#cart-count');
            if (countEl) {
                try {
                    const carrito = JSON.parse(localStorage.getItem('martex_carrito')) || [];
                    const totalItems = carrito.reduce((sum, item) => sum + (parseInt(item.cantidad) || 1), 0);
                    countEl.innerText = totalItems;
                } catch(e) {
                    countEl.innerText = '0';
                }
            }
        };
        
        window.addEventListener('carrito_actualizado', updateCartCount);
        updateCartCount();

        // Botón de login
        const loginBtn = this.querySelector('#login-btn');
        if (loginBtn) {
            loginBtn.addEventListener('click', () => {
                const modal = document.querySelector('auth-modal');
                if (modal) modal.open('login');
            });
        }

        const mobileLoginBtn = this.querySelector('.mobile-login');
        if (mobileLoginBtn) {
            mobileLoginBtn.addEventListener('click', () => {
                closeMobileMenu();
                const modal = document.querySelector('auth-modal');
                if (modal) modal.open('login');
            });
        }

        // Account dropdown
        const accountBtn = this.querySelector('#account-btn');
        const accountDropdown = this.querySelector('#account-dropdown');
        if (accountBtn && accountDropdown) {
            accountBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const isVisible = !accountDropdown.classList.contains('invisible');
                if (isVisible) {
                    accountDropdown.classList.add('invisible', 'opacity-0', 'scale-95');
                } else {
                    accountDropdown.classList.remove('invisible', 'opacity-0', 'scale-95');
                }
            });

            document.addEventListener('click', (e) => {
                if (!accountBtn.contains(e.target) && !accountDropdown.contains(e.target)) {
                    accountDropdown.classList.add('invisible', 'opacity-0', 'scale-95');
                }
            });
        }

        // Logout
        const logoutBtn = this.querySelector('#client-logout-btn');
        if (logoutBtn) logoutBtn.addEventListener('click', () => this.clientLogout());
        const mobileLogoutBtn = this.querySelector('.mobile-logout');
        if (mobileLogoutBtn) mobileLogoutBtn.addEventListener('click', () => this.clientLogout());

        window.addEventListener('cliente_auth_change', () => {
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

    handleSecretClick(e) { 
        this.clickCount++;
        clearTimeout(this.clickTimeout);
        if (this.clickCount >= 5) {
            e.preventDefault();
            this.clickCount = 0; 
            window.location.href = '../sistema/login.html'; 
        } else {
            this.clickTimeout = setTimeout(() => {
                this.clickCount = 0;
            }, 2500);
        }
    } 
}

if (!customElements.get('main-navbar')) {
    customElements.define('main-navbar', MainNavbar);
}