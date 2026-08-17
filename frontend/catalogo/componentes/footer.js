class FooterComponent extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
        <footer class="relative bg-slate-950 dark:bg-black text-white pt-16 sm:pt-20 pb-8 mt-auto overflow-hidden border-t border-white/10 transition-colors">
            <!-- Línea de acento superior -->
            <div class="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-blue-600 to-transparent opacity-60"></div>
            <div class="absolute bottom-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] translate-y-1/2 pointer-events-none"></div>

            <div class="relative z-10 max-w-7xl mx-auto px-5 sm:px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 sm:gap-12 text-center sm:text-left">
                <!-- Marca -->
                <div class="sm:col-span-2 lg:col-span-1">
                    <a href="index.html" class="inline-flex items-center gap-3 mb-4 group">
                        <span class="text-white group-hover:scale-105 transition-transform flex items-center" aria-hidden="true">
                            <svg viewBox="0 0 48 48" class="w-10 h-10" fill="none">
                                <mask id="hb-foot"><rect width="48" height="48" fill="#fff"/><polyline points="16,22 24,22 27,15 31,29 34,22 44,22" fill="none" stroke="#000" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/></mask>
                                <path d="M30 37C30 37 15 28 15 19.5 15 13.5 19.5 10 24 10 27 10 29.2 11.8 30 14 30.8 11.8 33 10 36 10 40.5 10 45 13.5 45 19.5 45 28 30 37 30 37Z" fill="currentColor" mask="url(#hb-foot)"/>
                                <circle cx="9.5" cy="8.5" r="3.4" fill="currentColor"/>
                                <path d="M9.5 13.5 11 24M9.5 15.5 3.5 10.5M9.5 15.5 16.5 12M11 24 7 34M11 24 15.5 32.5" stroke="currentColor" stroke-width="2.8" stroke-linecap="round"/>
                            </svg>
                        </span>
                        <div class="flex flex-col text-left">
                            <span class="font-display font-black text-2xl tracking-tight text-white leading-none">MARTEX</span>
                            <span class="text-[10px] font-bold tracking-widest text-blue-300 uppercase mt-0.5">Uniformes Médicos y Más</span>
                        </div>
                    </a>
                    <p class="text-slate-400 text-sm leading-relaxed max-w-sm mx-auto sm:mx-0 font-light">
                        Uniformes médicos y profesionales confeccionados en Usulután, El Salvador. Telas antifluido, corte anatómico y durabilidad comprobada.
                    </p>

                    <div class="mt-6 flex justify-center sm:justify-start gap-3">
                        <a href="https://www.instagram.com/martexsv?igsh=a3Izc2YzZGNucmVl" target="_blank" rel="noopener" class="w-11 h-11 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center text-slate-300 hover:text-blue-300 hover:scale-105 active:scale-95 transition-all shadow-xs" aria-label="Instagram de Martex">
                            <i class="fab fa-instagram text-lg"></i>
                        </a>
                        <a href="https://wa.me/50360497383" target="_blank" rel="noopener" class="w-11 h-11 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center text-slate-300 hover:text-blue-300 hover:scale-105 active:scale-95 transition-all shadow-xs" aria-label="WhatsApp de Martex">
                            <i class="fab fa-whatsapp text-lg"></i>
                        </a>
                    </div>
                </div>

                <!-- Enlaces -->
                <div>
                    <h4 class="font-display font-bold text-white mb-5 uppercase tracking-wider text-xs">Navegación</h4>
                    <ul class="space-y-3 text-slate-400 text-sm">
                        <li><a href="index.html" class="hover:text-blue-300 transition-colors inline-flex items-center gap-2"><i class="fas fa-chevron-right text-[10px] text-blue-400"></i> Inicio</a></li>
                        <li><a href="catalogo.html" class="hover:text-blue-300 transition-colors inline-flex items-center gap-2"><i class="fas fa-chevron-right text-[10px] text-blue-400"></i> Catálogo Completo</a></li>
                        <li><a href="nosotros.html" class="hover:text-blue-300 transition-colors inline-flex items-center gap-2"><i class="fas fa-chevron-right text-[10px] text-blue-400"></i> Sobre Nosotros</a></li>
                        <li><a href="mi-cuenta.html" class="hover:text-blue-300 transition-colors inline-flex items-center gap-2"><i class="fas fa-chevron-right text-[10px] text-blue-400"></i> Mi Cuenta & Pedidos</a></li>
                    </ul>
                </div>

                <!-- Contacto -->
                <div>
                    <h4 class="font-display font-bold text-white mb-5 uppercase tracking-wider text-xs">Taller y Ventas</h4>
                    <ul class="space-y-3.5 text-slate-400 text-sm">
                        <li class="flex items-start justify-center sm:justify-start gap-3">
                            <i class="fas fa-map-marker-alt text-blue-400 mt-1 shrink-0"></i>
                            <span class="leading-relaxed">Colonia Los Santos, C. Grimaldi Final,<br>Usulután, El Salvador</span>
                        </li>
                        <li class="flex items-center justify-center sm:justify-start gap-3">
                            <i class="fas fa-phone-alt text-blue-400 shrink-0"></i>
                            <a href="tel:+50360497383" class="hover:text-white transition-colors">+503 6049-7383</a>
                        </li>
                        <li class="flex items-center justify-center sm:justify-start gap-3">
                            <i class="far fa-envelope text-blue-400 shrink-0"></i>
                            <a href="mailto:info@martexuniforms.com" class="hover:text-white transition-colors">info@martexuniforms.com</a>
                        </li>
                    </ul>
                </div>

                <!-- Horario -->
                <div>
                    <h4 class="font-display font-bold text-white mb-5 uppercase tracking-wider text-xs">Horario de Atención</h4>
                    <ul class="space-y-3 text-slate-400 text-sm">
                        <li class="flex items-center justify-center sm:justify-start gap-3">
                            <i class="far fa-clock text-blue-400"></i>
                            <span>Lun - Vie: 8:00 AM - 5:00 PM</span>
                        </li>
                        <li class="flex items-center justify-center sm:justify-start gap-3">
                            <i class="far fa-clock text-blue-400"></i>
                            <span>Sábado: 8:00 AM - 12:00 PM</span>
                        </li>
                    </ul>
                    <a href="catalogo.html" class="mt-5 inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-95">
                        <span>Ver catálogo</span>
                        <i class="fas fa-arrow-right text-xs"></i>
                    </a>
                </div>
            </div>

            <div class="relative z-10 max-w-7xl mx-auto px-5 sm:px-6">
                <div class="border-t border-white/10 mt-12 pt-7 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
                    <p class="text-xs text-slate-500">&copy; 2026 Martex Uniformes. Todos los derechos reservados.</p>
                    <p class="text-xs text-slate-500">Hecho con orgullo en <span class="text-blue-300 font-semibold">Usulután, El Salvador</span> 🇸🇻</p>
                </div>
            </div>
        </footer>`;
    }
}

if (!customElements.get('footer-component')) {
    customElements.define('footer-component', FooterComponent);
}
