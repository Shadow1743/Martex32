// Auth Modal Web Component — Login/Registro para clientes en la landing page
class AuthModal extends HTMLElement {
    connectedCallback() {
        this.isOpen = false;
        this.activeTab = 'login';

        this.innerHTML = `
            <div id="auth-modal-backdrop" class="fixed inset-0 z-[60] invisible opacity-0 transition-all duration-300">
                <div class="absolute inset-0 bg-azul-marino/70 dark:bg-black/80 backdrop-blur-sm" id="auth-modal-overlay"></div>
                
                <div class="flex items-center justify-center min-h-screen p-4">
                    <div id="auth-modal-card" class="relative w-full max-w-md bg-white dark:bg-[#0A1428] rounded-3xl shadow-2xl border border-slate-100 dark:border-white/10 transform scale-95 transition-all duration-300 overflow-hidden z-10">
                        
                        <!-- Header con tabs -->
                        <div class="bg-gradient-to-r from-azul-marino to-azul-pantera p-6 pb-0 relative overflow-hidden">
                            <div class="absolute inset-0 overflow-hidden pointer-events-none">
                                <div class="absolute top-0 right-0 w-32 h-32 bg-verde-quirurgico/15 rounded-full blur-2xl"></div>
                                <div class="absolute bottom-0 left-0 w-24 h-24 bg-azul-pantera-light/20 rounded-full blur-xl"></div>
                            </div>
                            
                            <div class="relative z-10">
                                <div class="flex justify-between items-center mb-4">
                                    <div class="flex items-center gap-2">
                                        <div class="w-8 h-8 rounded-lg bg-verde-quirurgico flex items-center justify-center text-white text-sm">
                                            <i class="fas fa-stethoscope"></i>
                                        </div>
                                        <h2 class="text-white text-xl font-display font-extrabold tracking-tight">MARTEX</h2>
                                    </div>
                                    <button id="auth-modal-close" class="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition-all" aria-label="Cerrar modal">
                                        <i class="fas fa-times text-sm"></i>
                                    </button>
                                </div>
                                
                                <!-- Tabs -->
                                <div class="flex gap-1 bg-white/10 rounded-t-xl p-1">
                                    <button class="auth-tab active flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all duration-200" data-tab="login">
                                        <i class="fas fa-sign-in-alt mr-1.5"></i> Iniciar Sesión
                                    </button>
                                    <button class="auth-tab flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all duration-200" data-tab="registro">
                                        <i class="fas fa-user-plus mr-1.5"></i> Crear Cuenta
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Contenido -->
                        <div class="p-6">
                            <!-- Alerta de error -->
                            <div id="auth-error" class="hidden bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 px-4 py-3 rounded-xl text-sm text-center font-medium mb-4 items-center justify-center gap-2">
                                <i class="fas fa-exclamation-circle"></i>
                                <span></span>
                            </div>
                            
                            <!-- Alerta de éxito -->
                            <div id="auth-success" class="hidden bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 px-4 py-3 rounded-xl text-sm text-center font-medium mb-4 items-center justify-center gap-2">
                                <i class="fas fa-check-circle"></i>
                                <span></span>
                            </div>
                            
                            <!-- Social Login -->
                            <div class="mb-5 space-y-3">
                                <button type="button" onclick="document.querySelector('auth-modal').handleGoogleAuth()" class="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/15 text-slate-700 dark:text-slate-200 font-bold py-3 px-4 rounded-xl hover:bg-slate-50 dark:hover:bg-white/10 hover:border-slate-300 transition-all shadow-xs flex items-center justify-center gap-3 active:scale-[0.99]">
                                    <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" class="w-5 h-5">
                                    <span>Continuar con Google</span>
                                </button>
                                <button type="button" onclick="document.querySelector('auth-modal').handleFacebookAuth()" class="w-full bg-[#1877F2] border border-[#1877F2] text-white font-bold py-3 px-4 rounded-xl hover:bg-[#166fe5] transition-all shadow-xs flex items-center justify-center gap-3 active:scale-[0.99]">
                                    <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                                    <span>Continuar con Facebook</span>
                                </button>
                            </div>
                            
                            <!-- Divisor -->
                            <div class="relative flex items-center py-3 mb-1">
                                <div class="flex-grow border-t border-slate-200 dark:border-white/10"></div>
                                <span class="flex-shrink-0 mx-4 text-slate-400 dark:text-slate-500 text-xs font-semibold uppercase tracking-wider">o con tu correo</span>
                                <div class="flex-grow border-t border-slate-200 dark:border-white/10"></div>
                            </div>

                            <!-- Form Login -->
                            <form id="auth-login-form" class="space-y-4">
                                <div>
                                    <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Correo Electrónico</label>
                                    <div class="relative">
                                        <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                            <i class="fas fa-envelope text-slate-400 text-sm"></i>
                                        </div>
                                        <input type="email" name="email" required placeholder="tu@correo.com"
                                            class="w-full bg-slate-50 dark:bg-[#060D1A] border border-slate-200 dark:border-white/15 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-900 dark:text-white focus:border-verde-quirurgico focus:ring-2 focus:ring-verde-quirurgico/20 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 hover:border-slate-300">
                                    </div>
                                </div>
                                <div>
                                    <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Contraseña</label>
                                    <div class="relative">
                                        <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                            <i class="fas fa-lock text-slate-400 text-sm"></i>
                                        </div>
                                        <input type="password" name="password" required placeholder="••••••••" minlength="6"
                                            class="w-full bg-slate-50 dark:bg-[#060D1A] border border-slate-200 dark:border-white/15 rounded-xl pl-10 pr-11 py-3 text-sm text-slate-900 dark:text-white focus:border-verde-quirurgico focus:ring-2 focus:ring-verde-quirurgico/20 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 hover:border-slate-300">
                                        <button type="button" class="auth-toggle-pass absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-verde-quirurgico transition-colors" aria-label="Mostrar contraseña">
                                            <i class="fas fa-eye text-sm"></i>
                                        </button>
                                    </div>
                                </div>
                                <button type="submit" class="w-full bg-verde-quirurgico hover:bg-verde-quirurgico-dark text-white font-bold py-3.5 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.98] flex items-center justify-center gap-2 text-sm">
                                    <span>Iniciar Sesión</span>
                                    <i class="fas fa-arrow-right text-xs"></i>
                                </button>
                            </form>
                            
                            <!-- Form Registro -->
                            <form id="auth-registro-form" class="space-y-4 hidden">
                                <div>
                                    <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Nombre Completo</label>
                                    <div class="relative">
                                        <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                            <i class="fas fa-user text-slate-400 text-sm"></i>
                                        </div>
                                        <input type="text" name="nombre" required placeholder="Tu nombre y apellido"
                                            class="w-full bg-slate-50 dark:bg-[#060D1A] border border-slate-200 dark:border-white/15 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-900 dark:text-white focus:border-verde-quirurgico focus:ring-2 focus:ring-verde-quirurgico/20 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 hover:border-slate-300">
                                    </div>
                                </div>
                                <div>
                                    <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Correo Electrónico</label>
                                    <div class="relative">
                                        <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                            <i class="fas fa-envelope text-slate-400 text-sm"></i>
                                        </div>
                                        <input type="email" name="email" required placeholder="tu@correo.com"
                                            class="w-full bg-slate-50 dark:bg-[#060D1A] border border-slate-200 dark:border-white/15 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-900 dark:text-white focus:border-verde-quirurgico focus:ring-2 focus:ring-verde-quirurgico/20 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 hover:border-slate-300">
                                    </div>
                                </div>
                                <div>
                                    <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Teléfono <span class="text-slate-400 font-normal">(Opcional)</span></label>
                                    <div class="relative">
                                        <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                            <i class="fas fa-phone text-slate-400 text-sm"></i>
                                        </div>
                                        <input type="tel" name="telefono" placeholder="+503 7000-0000"
                                            class="w-full bg-slate-50 dark:bg-[#060D1A] border border-slate-200 dark:border-white/15 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-900 dark:text-white focus:border-verde-quirurgico focus:ring-2 focus:ring-verde-quirurgico/20 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 hover:border-slate-300">
                                    </div>
                                </div>
                                <div>
                                    <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Contraseña</label>
                                    <div class="relative">
                                        <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                            <i class="fas fa-lock text-slate-400 text-sm"></i>
                                        </div>
                                        <input type="password" name="password" required placeholder="Mínimo 6 caracteres" minlength="6"
                                            class="w-full bg-slate-50 dark:bg-[#060D1A] border border-slate-200 dark:border-white/15 rounded-xl pl-10 pr-11 py-3 text-sm text-slate-900 dark:text-white focus:border-verde-quirurgico focus:ring-2 focus:ring-verde-quirurgico/20 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 hover:border-slate-300">
                                        <button type="button" class="auth-toggle-pass absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-verde-quirurgico transition-colors" aria-label="Mostrar contraseña">
                                            <i class="fas fa-eye text-sm"></i>
                                        </button>
                                    </div>
                                    <div id="password-strength" class="mt-2 hidden">
                                        <div class="h-1.5 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
                                            <div class="h-full rounded-full transition-all duration-300" id="password-bar" style="width: 0%"></div>
                                        </div>
                                        <p class="text-xs mt-1" id="password-text"></p>
                                    </div>
                                </div>
                                <button type="submit" class="w-full bg-verde-quirurgico hover:bg-verde-quirurgico-dark text-white font-bold py-3.5 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.98] flex items-center justify-center gap-2 text-sm">
                                    <span>Crear Mi Cuenta</span>
                                    <i class="fas fa-user-plus text-xs"></i>
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.setupEvents();
        this.initSocialSDKs();
    }

    initSocialSDKs() {
        // Inicializar Google
        if (window.google) {
            this.initGoogle();
        } else {
            const checkGoogle = setInterval(() => {
                if (window.google) {
                    clearInterval(checkGoogle);
                    this.initGoogle();
                }
            }, 100);
        }

        // Inicializar Facebook
        if (window.FB) {
            this.initFacebook();
        } else {
            window.fbAsyncInit = () => {
                this.initFacebook();
            };
        }
    }

    initGoogle() {
        if (!CONFIG.GOOGLE_CLIENT_ID || CONFIG.GOOGLE_CLIENT_ID.includes('test-client')) return;
        window.google.accounts.id.initialize({
            client_id: CONFIG.GOOGLE_CLIENT_ID,
            callback: (response) => this.processGoogleLogin(response)
        });
    }

    initFacebook() {
        if (!CONFIG.FACEBOOK_APP_ID || CONFIG.FACEBOOK_APP_ID.includes('test-app')) return;
        window.FB.init({
            appId: CONFIG.FACEBOOK_APP_ID,
            cookie: true,
            xfbml: true,
            version: 'v18.0'
        });
    }

    setupEvents() {
        // Close
        this.querySelector('#auth-modal-close').addEventListener('click', () => this.close());
        this.querySelector('#auth-modal-overlay').addEventListener('click', () => this.close());

        // Tabs
        this.querySelectorAll('.auth-tab').forEach(tab => {
            tab.addEventListener('click', () => this.switchTab(tab.dataset.tab));
        });

        // Toggle password visibility
        this.querySelectorAll('.auth-toggle-pass').forEach(btn => {
            btn.addEventListener('click', () => {
                const input = btn.parentElement.querySelector('input');
                const icon = btn.querySelector('i');
                if (input.type === 'password') {
                    input.type = 'text';
                    icon.className = 'fas fa-eye-slash text-sm';
                } else {
                    input.type = 'password';
                    icon.className = 'fas fa-eye text-sm';
                }
            });
        });

        // Password strength indicator
        const regPassInput = this.querySelector('#auth-registro-form input[name="password"]');
        if (regPassInput) {
            regPassInput.addEventListener('input', (e) => this.updatePasswordStrength(e.target.value));
        }

        // Login form
        this.querySelector('#auth-login-form').addEventListener('submit', (e) => this.handleLogin(e));

        // Register form
        this.querySelector('#auth-registro-form').addEventListener('submit', (e) => this.handleRegister(e));

        // ESC key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) this.close();
        });
    }

    open(tab = 'login') {
        this.isOpen = true;
        this.switchTab(tab);
        this.hideAlerts();
        const backdrop = this.querySelector('#auth-modal-backdrop');
        const card = this.querySelector('#auth-modal-card');
        backdrop.classList.remove('invisible', 'opacity-0');
        setTimeout(() => card.classList.remove('scale-95'), 10);
        document.body.style.overflow = 'hidden';
    }

    close() {
        this.isOpen = false;
        const backdrop = this.querySelector('#auth-modal-backdrop');
        const card = this.querySelector('#auth-modal-card');
        card.classList.add('scale-95');
        backdrop.classList.add('opacity-0');
        setTimeout(() => {
            backdrop.classList.add('invisible');
            document.body.style.overflow = '';
        }, 300);
    }

    switchTab(tab) {
        this.activeTab = tab;
        this.hideAlerts();
        
        this.querySelectorAll('.auth-tab').forEach(t => {
            if (t.dataset.tab === tab) {
                t.classList.add('active', 'bg-white/20', 'text-white');
                t.classList.remove('text-white/60');
            } else {
                t.classList.remove('active', 'bg-white/20', 'text-white');
                t.classList.add('text-white/60');
            }
        });

        const loginForm = this.querySelector('#auth-login-form');
        const registroForm = this.querySelector('#auth-registro-form');
        
        if (tab === 'login') {
            loginForm.classList.remove('hidden');
            registroForm.classList.add('hidden');
        } else {
            loginForm.classList.add('hidden');
            registroForm.classList.remove('hidden');
        }
    }

    showError(msg) {
        const el = this.querySelector('#auth-error');
        el.querySelector('span').textContent = msg;
        el.classList.remove('hidden');
        el.classList.add('flex');
        this.querySelector('#auth-success').classList.add('hidden');
    }

    showSuccess(msg) {
        const el = this.querySelector('#auth-success');
        el.querySelector('span').textContent = msg;
        el.classList.remove('hidden');
        el.classList.add('flex');
        this.querySelector('#auth-error').classList.add('hidden');
    }

    hideAlerts() {
        this.querySelector('#auth-error').classList.add('hidden');
        this.querySelector('#auth-error').classList.remove('flex');
        this.querySelector('#auth-success').classList.add('hidden');
        this.querySelector('#auth-success').classList.remove('flex');
    }

    updatePasswordStrength(password) {
        const container = this.querySelector('#password-strength');
        const bar = this.querySelector('#password-bar');
        const text = this.querySelector('#password-text');

        if (!password) {
            container.classList.add('hidden');
            return;
        }
        container.classList.remove('hidden');

        let strength = 0;
        if (password.length >= 6) strength++;
        if (password.length >= 8) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;

        const levels = [
            { width: '20%', color: '#ef4444', text: 'Muy débil', textColor: '#ef4444' },
            { width: '40%', color: '#f97316', text: 'Débil', textColor: '#f97316' },
            { width: '60%', color: '#eab308', text: 'Regular', textColor: '#eab308' },
            { width: '80%', color: '#22c55e', text: 'Fuerte', textColor: '#22c55e' },
            { width: '100%', color: '#008080', text: 'Muy fuerte', textColor: '#008080' }
        ];

        const level = levels[Math.min(strength, 4)];
        bar.style.width = level.width;
        bar.style.backgroundColor = level.color;
        text.textContent = level.text;
        text.style.color = level.textColor;
    }

    setSubmitLoading(form, loading) {
        const btn = form.querySelector('button[type="submit"]');
        const span = btn.querySelector('span');
        const icon = btn.querySelector('i');
        
        if (loading) {
            btn.disabled = true;
            span.textContent = 'Procesando...';
            icon.className = 'fas fa-spinner fa-spin text-xs';
        } else {
            btn.disabled = false;
            if (this.activeTab === 'login') {
                span.textContent = 'Iniciar Sesión';
                icon.className = 'fas fa-arrow-right text-xs';
            } else {
                span.textContent = 'Crear Mi Cuenta';
                icon.className = 'fas fa-user-plus text-xs';
            }
        }
    }

    async handleLogin(e) {
        e.preventDefault();
        this.hideAlerts();
        const form = e.target;
        const data = new FormData(form);

        this.setSubmitLoading(form, true);

        try {
            const res = await fetch(CONFIG.API_URL + '/clientes/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: data.get('email'),
                    password: data.get('password')
                })
            });

            const result = await res.json();

            if (res.ok) {
                localStorage.setItem('cliente_token', result.token);
                localStorage.setItem('cliente', JSON.stringify(result.cliente));
                this.showSuccess('¡Bienvenido de vuelta!');
                setTimeout(() => {
                    this.close();
                    window.dispatchEvent(new CustomEvent('cliente_auth_change'));
                    // Reload si estamos en mi-cuenta
                    if (window.location.pathname.includes('mi-cuenta')) {
                        window.location.reload();
                    }
                }, 800);
            } else {
                this.showError(result.message || 'Credenciales inválidas');
            }
        } catch (err) {
            this.showError('Error de conexión. Intenta nuevamente.');
        } finally {
            this.setSubmitLoading(form, false);
        }
    }

    async handleRegister(e) {
        e.preventDefault();
        this.hideAlerts();
        const form = e.target;
        const data = new FormData(form);

        this.setSubmitLoading(form, true);

        try {
            const res = await fetch(CONFIG.API_URL + '/clientes/registro', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nombre: data.get('nombre'),
                    email: data.get('email'),
                    password: data.get('password'),
                    telefono: data.get('telefono')
                })
            });

            const result = await res.json();

            if (res.ok) {
                localStorage.setItem('cliente_token', result.token);
                localStorage.setItem('cliente', JSON.stringify(result.cliente));
                this.showSuccess('¡Cuenta creada exitosamente! Bienvenido a Martex.');
                setTimeout(() => {
                    this.close();
                    window.dispatchEvent(new CustomEvent('cliente_auth_change'));
                }, 1200);
            } else {
                this.showError(result.message || 'Error al crear la cuenta');
            }
        } catch (err) {
            this.showError('Error de conexión. Intenta nuevamente.');
        } finally {
            this.setSubmitLoading(form, false);
        }
    }

    handleGoogleAuth() {
        this.hideAlerts();
        if (!CONFIG.GOOGLE_CLIENT_ID || CONFIG.GOOGLE_CLIENT_ID.includes('test-client')) {
            // Simulador para desarrollo/demo
            this.showSuccess('Simulando Login con Google...');
            setTimeout(() => this.processGoogleLogin({ credential: 'mock_google_token' }), 800);
            return;
        }
        window.google.accounts.id.prompt((notification) => {
            if (notification.isNotDisplayed() || notification.isSkippedMomentum()) {
                const client = window.google.accounts.oauth2.initTokenClient({
                    client_id: CONFIG.GOOGLE_CLIENT_ID,
                    callback: (response) => {
                        this.showError('Debes habilitar las ventanas emergentes o usar un ID válido.');
                    }
                });
                client.requestAccessToken();
            }
        });
        
        if (window.google && window.google.accounts.oauth2) {
             const client = window.google.accounts.oauth2.initTokenClient({
                 client_id: CONFIG.GOOGLE_CLIENT_ID,
                 scope: 'email profile',
                 callback: (tokenResponse) => {}
             });
        }
    }

    // Callback para Google GSI
    async processGoogleLogin(response) {
        if (!response.credential) return;
        
        try {
            const res = await fetch(CONFIG.API_URL + '/clientes/auth/google', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: response.credential })
            });
            await this.handleSocialResponse(res);
        } catch (err) {
            this.showError('Error conectando con Google.');
        }
    }

    handleFacebookAuth() {
        this.hideAlerts();
        if (!CONFIG.FACEBOOK_APP_ID || CONFIG.FACEBOOK_APP_ID.includes('test-app')) {
            // Simulador para desarrollo/demo
            this.showSuccess('Simulando Login con Facebook...');
            setTimeout(() => this.processFacebookLogin('mock_facebook_token'), 800);
            return;
        }

        if (!window.FB) {
            this.showError('SDK de Facebook no cargado.');
            return;
        }

        window.FB.login((response) => {
            if (response.authResponse) {
                this.processFacebookLogin(response.authResponse.accessToken);
            } else {
                this.showError('Se canceló el inicio de sesión con Facebook.');
            }
        }, {scope: 'public_profile,email'});
    }

    async processFacebookLogin(accessToken) {
        try {
            const res = await fetch(CONFIG.API_URL + '/clientes/auth/facebook', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ accessToken })
            });
            await this.handleSocialResponse(res);
        } catch (err) {
            this.showError('Error conectando con Facebook.');
        }
    }

    async handleSocialResponse(res) {
        const result = await res.json();
        if (res.ok) {
            localStorage.setItem('cliente_token', result.token);
            localStorage.setItem('cliente', JSON.stringify(result.cliente));
            this.showSuccess('¡Inicio de sesión exitoso!');
            setTimeout(() => {
                this.close();
                window.dispatchEvent(new CustomEvent('cliente_auth_change'));
                if (window.location.pathname.includes('mi-cuenta')) {
                    window.location.reload();
                }
            }, 800);
        } else {
            this.showError(result.message || 'Error en inicio de sesión social');
        }
    }
}

if (!customElements.get('auth-modal')) {
    customElements.define('auth-modal', AuthModal);
}
