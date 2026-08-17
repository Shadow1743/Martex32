// Gestión inicial de tema sin parpadeo (FOUC)
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
            <!-- ══════════════════════════════════════════
                 BARRA SUPERIOR (Utility / Anuncios)
            ══════════════════════════════════════════ -->
            <div class="bg-[#0A1428] text-slate-300 text-xs py-2 px-4 sm:px-6 lg:px-8 border-b border-white/10 select-none">
                <div class="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
                    <div class="flex items-center justify-center gap-2 text-xs font-light text-slate-300">
                        <span class="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
                        <span>Sastrería & Taller en <strong>Usulután</strong> · Envíos a los 14 departamentos de El Salvador</span>
                    </div>
                    <div class="flex items-center justify-center gap-4 text-xs">
                        <a href="https://wa.me/50360497383?text=Hola,%20quisiera%20asesoría%20sobre%20uniformes%20médicos%20Martex" target="_blank" rel="noopener noreferrer" class="text-blue-300 hover:text-blue-200 transition-colors flex items-center gap-1.5 font-medium">
                            <i class="fab fa-whatsapp"></i> WhatsApp: +503 6049-7383
                        </a>
                        <span class="hidden md:inline text-slate-600">|</span>
                        <span class="hidden md:inline text-slate-400 font-light"><i class="far fa-clock mr-1 text-slate-500"></i> Lun - Sáb: 8:00 AM - 5:30 PM</span>
                    </div>
                </div>
            </div>

            <!-- ══════════════════════════════════════════
                 NAVBAR PRINCIPAL (Sticky con Glassmorphism)
            ══════════════════════════════════════════ -->
            <header class="sticky top-0 z-50 w-full bg-white/95 dark:bg-[#080E18]/95 backdrop-blur-xl border-b border-slate-200/80 dark:border-white/10 transition-colors duration-200 shadow-xs" id="main-header">
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div class="flex items-center justify-between h-18 sm:h-20 gap-4">
                        
                        <!-- 1. Logo & Identidad de Marca -->
                        <a href="index.html" class="flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-blue-600/40 rounded-xl shrink-0" id="martex-logo" title="Martex · Uniformes Médicos y Más">
                            <span class="text-blue-950 dark:text-blue-400 group-hover:scale-105 transition-transform duration-200 flex items-center" aria-hidden="true">
                                <svg viewBox="0 0 48 48" class="w-10 h-10 sm:w-11 sm:h-11" fill="none">
                                    <mask id="hb-nav"><rect width="48" height="48" fill="#fff"/><polyline points="16,22 24,22 27,15 31,29 34,22 44,22" fill="none" stroke="#000" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/></mask>
                                    <path d="M30 37C30 37 15 28 15 19.5 15 13.5 19.5 10 24 10 27 10 29.2 11.8 30 14 30.8 11.8 33 10 36 10 40.5 10 45 13.5 45 19.5 45 28 30 37 30 37Z" fill="currentColor" mask="url(#hb-nav)"/>
                                    <circle cx="9.5" cy="8.5" r="3.4" fill="currentColor"/>
                                    <path d="M9.5 13.5 11 24M9.5 15.5 3.5 10.5M9.5 15.5 16.5 12M11 24 7 34M11 24 15.5 32.5" stroke="currentColor" stroke-width="2.8" stroke-linecap="round"/>
                                </svg>
                            </span>
                            <div class="flex flex-col">
                                <span class="font-display font-black text-2xl tracking-tight text-slate-900 dark:text-white leading-none">MARTEX</span>
                                <span class="text-[10px] font-bold tracking-widest text-blue-900 dark:text-blue-400 uppercase mt-0.5">Uniformes Médicos y Más</span>
                            </div>
                        </a>
                        
                        <!-- 2. Enlaces de Navegación Desktop (Pill minimalista) -->
                        <nav class="hidden lg:flex items-center gap-1 bg-slate-100/80 dark:bg-white/5 p-1 rounded-2xl border border-slate-200/60 dark:border-white/10">
                            <a href="index.html" class="nav-link px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-150 text-slate-600 dark:text-slate-300 hover:text-blue-950 dark:hover:text-blue-300 hover:bg-white/80 dark:hover:bg-white/10">
                                Inicio
                            </a>
                            <a href="catalogo.html?categoria=Médico" class="nav-link px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-150 text-slate-600 dark:text-slate-300 hover:text-blue-950 dark:hover:text-blue-300 hover:bg-white/80 dark:hover:bg-white/10 flex items-center gap-1.5">
                                <i class="fas fa-user-md text-xs text-blue-800 dark:text-blue-400"></i>
                                Colección Médica
                            </a>
                            <a href="catalogo.html?categoria=Belleza" class="nav-link px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-150 text-slate-600 dark:text-slate-300 hover:text-blue-950 dark:hover:text-blue-300 hover:bg-white/80 dark:hover:bg-white/10 flex items-center gap-1.5">
                                <i class="fas fa-spa text-xs text-slate-500 dark:text-slate-400"></i>
                                Belleza & Spa
                            </a>
                            <a href="nosotros.html" class="nav-link px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-150 text-slate-600 dark:text-slate-300 hover:text-blue-950 dark:hover:text-blue-300 hover:bg-white/80 dark:hover:bg-white/10">
                                Nosotros
                            </a>
                            <a href="nosotros.html#ubicacion" class="nav-link px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-150 text-slate-600 dark:text-slate-300 hover:text-blue-950 dark:hover:text-blue-300 hover:bg-white/80 dark:hover:bg-white/10 flex items-center gap-1">
                                <i class="fas fa-map-marker-alt text-xs text-slate-500 dark:text-slate-400"></i>
                                Ubicación
                            </a>
                        </nav>
                        
                        <!-- 3. Grupo de Acciones / Conversión -->
                        <div class="flex items-center gap-2 sm:gap-2.5 shrink-0">
                            
                            <!-- Botón Cotizar por WhatsApp (Desktop XL) -->
                            <a href="https://wa.me/50360497383?text=Hola,%20quisiera%20cotizar%20uniformes%20médicos%20Martex" target="_blank" rel="noopener noreferrer" class="hidden xl:inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-50 hover:bg-blue-100 text-blue-900 dark:bg-blue-400/10 dark:hover:bg-blue-400/20 dark:text-blue-300 border border-blue-900/20 dark:border-blue-400/25 transition-all duration-150 active:scale-95 shadow-xs" title="Hablar directo con el taller">
                                <i class="fab fa-whatsapp text-sm text-blue-700 dark:text-blue-400"></i>
                                <span>Cotizar por WhatsApp</span>
                            </a>

                            <!-- Toggle Modo Claro / Oscuro -->
                            <button id="theme-toggle" class="w-10 h-10 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-azul-marino dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 active:scale-95 transition-all duration-150 border border-slate-200/60 dark:border-white/10" aria-label="Cambiar modo de color" title="Alternar modo claro / oscuro">
                                <i id="theme-icon" class="fas fa-moon text-sm"></i>
                            </button>
                            
                            <!-- Botón Mi Cuenta & Dropdown -->
                            <div class="relative" id="account-dropdown-container">
                                ${isLoggedIn ? `
                                    <button id="account-btn" class="min-h-[40px] flex items-center gap-2 bg-slate-100 hover:bg-slate-200/80 dark:bg-white/10 dark:hover:bg-white/15 px-3 py-1.5 rounded-xl active:scale-95 transition-all duration-150 text-xs sm:text-sm border border-slate-200/70 dark:border-white/10 text-slate-900 dark:text-white">
                                        <div class="w-6 h-6 rounded-lg bg-blue-950 dark:bg-blue-600 flex items-center justify-center text-[11px] font-bold text-white shadow-xs">${(clienteNombre || 'U').charAt(0).toUpperCase()}</div>
                                        <span class="hidden sm:inline font-semibold max-w-[100px] truncate">${clienteNombre ? clienteNombre.split(' ')[0] : 'Mi Cuenta'}</span>
                                        <i class="fas fa-chevron-down text-[9px] text-slate-400"></i>
                                    </button>
                                    <div id="account-dropdown" class="invisible opacity-0 absolute right-0 top-full mt-2 w-56 bg-white dark:bg-[#0F1A2E] rounded-2xl shadow-xl border border-slate-200/80 dark:border-white/15 py-2 transform scale-95 transition-all duration-150 z-50">
                                        <div class="px-4 py-3 border-b border-slate-100 dark:border-white/10">
                                            <p class="text-sm font-bold text-slate-900 dark:text-white truncate">${clienteNombre || 'Mi Cuenta'}</p>
                                            <p class="text-xs text-blue-800 dark:text-blue-400 font-medium">Cliente Verificado Martex</p>
                                        </div>
                                        <a href="mi-cuenta.html" class="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-blue-950 dark:hover:text-blue-300 transition-colors min-h-[44px]">
                                            <i class="fas fa-user w-4 text-center text-blue-800 dark:text-blue-400"></i> Mi Perfil
                                        </a>
                                        <a href="mi-cuenta.html#pedidos" class="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-blue-950 dark:hover:text-blue-300 transition-colors min-h-[44px]">
                                            <i class="fas fa-box w-4 text-center text-blue-800 dark:text-blue-400"></i> Mis Pedidos
                                        </a>
                                        <a href="mi-cuenta.html#favoritos" class="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-blue-950 dark:hover:text-blue-300 transition-colors min-h-[44px]">
                                            <i class="fas fa-heart w-4 text-center text-blue-800 dark:text-blue-400"></i> Mis Favoritos
                                        </a>
                                        <div class="border-t border-slate-100 dark:border-white/10 mt-1 pt-1">
                                            <button id="client-logout-btn" class="flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors w-full text-left min-h-[44px]">
                                                <i class="fas fa-sign-out-alt w-4 text-center"></i> Cerrar Sesión
                                            </button>
                                        </div>
                                    </div>
                                ` : `
                                    <button id="login-btn" class="min-h-[40px] flex items-center gap-2 bg-slate-100 hover:bg-slate-200/80 dark:bg-white/10 dark:hover:bg-white/15 px-3 sm:px-3.5 py-2 rounded-xl active:scale-95 transition-all duration-150 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white border border-slate-200/70 dark:border-white/10">
                                        <i class="fas fa-user text-xs text-blue-800 dark:text-blue-400"></i>
                                        <span class="hidden sm:inline">Mi Cuenta</span>
                                    </button>
                                `}
                            </div>
                            
                            <!-- Botón Carrito de Compras (CTA Principal) -->
                            <button id="nav-cart-btn" class="group relative min-h-[40px] flex items-center gap-2 bg-blue-950 hover:bg-blue-900 dark:bg-blue-600 dark:hover:bg-blue-500 text-white px-3.5 sm:px-4 py-2 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-95" title="Ver carrito de compras">
                                <i class="fas fa-shopping-bag text-sm"></i>
                                <span class="font-bold text-xs sm:text-sm hidden sm:inline">Carrito</span>
                                <span id="cart-count" class="bg-white text-blue-950 dark:bg-slate-950 dark:text-blue-300 font-extrabold text-[11px] px-1.5 py-0.5 rounded-full border border-blue-400/30 shadow-xs min-w-[20px] text-center">0</span>
                            </button>
                            
                            <!-- Botón Menú Móvil (visible en < lg) -->
                            <button id="mobile-menu-btn" class="lg:hidden w-10 h-10 rounded-xl flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 active:scale-95 transition-colors border border-slate-200/60 dark:border-white/10" aria-label="Abrir menú de navegación">
                                <i class="fas fa-bars text-base"></i>
                            </button>
                        </div>
                    </div>
                </div>

                <!-- ══════════════════════════════════════════
                     DRAWER MÓVIL (Slide-over lateral)
                ══════════════════════════════════════════ -->
                <div id="mobile-menu" class="fixed inset-0 bg-[#0A1428]/70 dark:bg-black/80 backdrop-blur-md z-50 transform translate-x-full transition-transform duration-300 lg:hidden flex justify-end">
                    <div class="w-full max-w-xs bg-white dark:bg-[#080E18] h-full shadow-2xl p-6 flex flex-col justify-between border-l border-slate-200 dark:border-white/10 overflow-y-auto">
                        <div>
                            <!-- Header Móvil con Logo y Cerrar -->
                            <div class="flex items-center justify-between pb-5 border-b border-slate-100 dark:border-white/10">
                                <div class="flex items-center gap-2.5">
                                    <span class="text-blue-950 dark:text-blue-400 flex items-center" aria-hidden="true">
                                        <svg viewBox="0 0 48 48" class="w-9 h-9" fill="none">
                                            <mask id="hb-mob"><rect width="48" height="48" fill="#fff"/><polyline points="16,22 24,22 27,15 31,29 34,22 44,22" fill="none" stroke="#000" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/></mask>
                                            <path d="M30 37C30 37 15 28 15 19.5 15 13.5 19.5 10 24 10 27 10 29.2 11.8 30 14 30.8 11.8 33 10 36 10 40.5 10 45 13.5 45 19.5 45 28 30 37 30 37Z" fill="currentColor" mask="url(#hb-mob)"/>
                                            <circle cx="9.5" cy="8.5" r="3.4" fill="currentColor"/>
                                            <path d="M9.5 13.5 11 24M9.5 15.5 3.5 10.5M9.5 15.5 16.5 12M11 24 7 34M11 24 15.5 32.5" stroke="currentColor" stroke-width="2.8" stroke-linecap="round"/>
                                        </svg>
                                    </span>
                                    <div>
                                        <span class="font-display font-black text-lg text-slate-900 dark:text-white leading-none block">MARTEX</span>
                                        <span class="text-[9px] font-bold text-blue-900 dark:text-blue-400 uppercase tracking-wider">Usulután, El Salvador</span>
                                    </div>
                                </div>
                                <button id="close-mobile-menu" class="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors" aria-label="Cerrar menú">
                                    <i class="fas fa-times text-base"></i>
                                </button>
                            </div>

                            <!-- Enlaces de Navegación Móvil -->
                            <nav class="flex flex-col gap-1.5 mt-5">
                                <a href="index.html" class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-blue-950 dark:hover:text-blue-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                    <i class="fas fa-home w-5 text-blue-800 dark:text-blue-400"></i> Inicio
                                </a>
                                <a href="catalogo.html?categoria=Médico" class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-blue-950 dark:hover:text-blue-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                    <i class="fas fa-user-md w-5 text-blue-800 dark:text-blue-400"></i> Colección Médica
                                </a>
                                <a href="catalogo.html?categoria=Belleza" class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-blue-950 dark:hover:text-blue-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                    <i class="fas fa-spa w-5 text-slate-500 dark:text-slate-400"></i> Belleza & Spa
                                </a>
                                <a href="nosotros.html" class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-blue-950 dark:hover:text-blue-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                    <i class="fas fa-scissors w-5 text-blue-800 dark:text-blue-400"></i> Sobre Nosotros
                                </a>
                                <a href="nosotros.html#ubicacion" class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-blue-950 dark:hover:text-blue-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                    <i class="fas fa-map-marker-alt w-5 text-slate-500 dark:text-slate-400"></i> Ubicación & Taller
                                </a>
                            </nav>

                            <!-- Tarjeta Directa de WhatsApp Móvil -->
                            <div class="mt-6 p-4 rounded-2xl bg-blue-50 dark:bg-blue-400/10 border border-blue-900/15 dark:border-blue-400/20 text-xs">
                                <div class="flex items-center gap-2 text-blue-900 dark:text-blue-300 font-bold mb-1">
                                    <i class="fab fa-whatsapp text-base text-blue-700 dark:text-blue-400"></i>
                                    <span>¿Dudas con tu talla o tela?</span>
                                </div>
                                <p class="text-slate-600 dark:text-slate-300 font-light mb-3">
                                    Escribinos directo y te asesoramos en 2 minutos con cinta métrica.
                                </p>
                                <a href="https://wa.me/50360497383?text=Hola,%20quisiera%20asesoría%20sobre%20uniformes%20médicos%20Martex" target="_blank" rel="noopener noreferrer" class="block text-center py-2 px-3 rounded-xl bg-blue-950 dark:bg-blue-600 text-white font-bold hover:bg-blue-900 dark:hover:bg-blue-500 transition-colors shadow-xs">
                                    Chatear por WhatsApp
                                </a>
                            </div>
                        </div>

                        <!-- Footer del Menú Móvil (Cuenta, Tema y Logout) -->
                        <div class="pt-6 border-t border-slate-100 dark:border-white/10 space-y-3 mt-6">
                            <!-- Toggle Tema Móvil -->
                            <div class="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 mb-2">
                                <span class="text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                                    <i class="fas fa-circle-half-stroke text-blue-600 dark:text-blue-400"></i>
                                    <span>Apariencia</span>
                                </span>
                                <button id="mobile-theme-toggle" class="px-3 py-1.5 rounded-xl bg-white dark:bg-white/10 text-xs font-bold text-slate-800 dark:text-white border border-slate-200 dark:border-white/15 flex items-center gap-1.5 shadow-xs transition-colors">
                                    <i id="mobile-theme-icon" class="fas fa-moon text-xs"></i>
                                    <span id="mobile-theme-text">Modo Oscuro</span>
                                </button>
                            </div>

                            ${isLoggedIn ? `
                                <a href="mi-cuenta.html" class="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white font-semibold text-sm">
                                    <i class="fas fa-user text-blue-800 dark:text-blue-400"></i> Mi Cuenta (${clienteNombre ? clienteNombre.split(' ')[0] : 'Perfil'})
                                </a>
                                <button class="mobile-logout flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 text-sm font-semibold transition-colors">
                                    <i class="fas fa-sign-out-alt"></i> Cerrar Sesión
                                </button>
                            ` : `
                                <button class="mobile-login flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white font-bold text-sm border border-slate-200/80 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/15 transition-all">
                                    <i class="fas fa-user text-blue-800 dark:text-blue-400"></i> Iniciar Sesión / Registrarse
                                </button>
                            `}
                            <div class="text-center text-[11px] text-slate-400 font-light">
                                Confección médica en Usulután · Envíos nacionales 🇸🇻
                            </div>
                        </div>
                    </div>
                </div>
            </header>
        `;

        // Activar visualmente el enlace de la página actual
        const currentPath = window.location.pathname.split("/").pop() || "index.html";
        const currentSearch = window.location.search;
        const fullCurrent = currentPath + currentSearch;

        const links = this.querySelectorAll(".nav-link");
        links.forEach(link => {
            const href = link.getAttribute("href");
            let isActive = false;
            
            if (href === fullCurrent) {
                isActive = true;
            } else if (href === currentPath && !currentSearch) {
                isActive = true;
            } else if (currentPath === "" && href === "index.html") {
                isActive = true;
            }

            if (isActive) {
                link.classList.add("bg-white", "dark:bg-white/15", "text-blue-950", "dark:text-blue-300", "shadow-xs", "font-bold");
                link.classList.remove("text-slate-600", "dark:text-slate-300");
            }
        });

        // Easter egg: 5 clics rápidos en el logo llevan al panel administrativo
        const logo = this.querySelector('#martex-logo');
        if (logo) {
            logo.addEventListener('click', (e) => {
                this.handleSecretClick(e);
            });
        }

        // Lógica de Modo Oscuro
        const toggleBtn = this.querySelector('#theme-toggle');
        const themeIcon = this.querySelector('#theme-icon');
        const mobileThemeToggle = this.querySelector('#mobile-theme-toggle');
        
        const updateThemeUI = (isDark) => {
            if (themeIcon) {
                themeIcon.className = isDark ? 'fas fa-sun text-amber-400 text-sm' : 'fas fa-moon text-slate-600 dark:text-slate-300 text-sm';
            }
            if (toggleBtn) {
                toggleBtn.setAttribute('title', isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro');
            }
            const mobileThemeIcon = this.querySelector('#mobile-theme-icon');
            const mobileThemeText = this.querySelector('#mobile-theme-text');
            if (mobileThemeIcon) {
                mobileThemeIcon.className = isDark ? 'fas fa-sun text-amber-400 text-xs' : 'fas fa-moon text-slate-600 dark:text-slate-300 text-xs';
            }
            if (mobileThemeText) {
                mobileThemeText.textContent = isDark ? 'Modo Claro' : 'Modo Oscuro';
            }
        };

        const toggleTheme = (e) => {
            if (e) e.preventDefault();
            const nowDark = document.documentElement.classList.toggle('dark');
            try {
                localStorage.setItem('theme', nowDark ? 'dark' : 'light');
            } catch(err) {}
            updateThemeUI(nowDark);
            window.dispatchEvent(new CustomEvent('theme-changed', { detail: { isDark: nowDark } }));
        };

        // Estado inicial del tema
        const initialDark = document.documentElement.classList.contains('dark');
        updateThemeUI(initialDark);

        if (toggleBtn) toggleBtn.addEventListener('click', toggleTheme);
        if (mobileThemeToggle) mobileThemeToggle.addEventListener('click', toggleTheme);

        window.addEventListener('theme-changed', (e) => {
            if (e && e.detail && typeof e.detail.isDark === 'boolean') {
                updateThemeUI(e.detail.isDark);
            }
        });

        // Mobile Menu Toggle (Slide-over)
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

        // Botón del carrito (Dispara el slide-over del carrito global)
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