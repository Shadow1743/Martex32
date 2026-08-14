class FooterComponent extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
        <footer class="relative bg-[#070F1E] dark:bg-[#030712] text-white pt-16 sm:pt-20 pb-8 mt-auto overflow-hidden border-t border-white/10 transition-colors">
            <!-- Línea de acento superior -->
            <div class="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-verde-quirurgico to-transparent opacity-60"></div>
            <div class="absolute bottom-0 right-0 w-96 h-96 bg-verde-quirurgico/10 rounded-full blur-[100px] translate-y-1/2 pointer-events-none"></div>

            <div class="relative z-10 max-w-7xl mx-auto px-5 sm:px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 sm:gap-12 text-center sm:text-left">
                <!-- Marca -->
                <div class="sm:col-span-2 lg:col-span-1">
                    <a href="index.html" class="inline-flex items-center gap-3 mb-4 group">
                        <div class="w-10 h-10 rounded-xl bg-verde-quirurgico flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
                            <i class="fas fa-stethoscope text-lg"></i>
                        </div>
                        <div class="flex flex-col text-left">
                            <span class="font-display font-black text-2xl tracking-tight text-white leading-none">MARTEX</span>
                            <span class="text-[10px] font-bold tracking-widest text-emerald-400 uppercase mt-0.5">Sastrería Médica</span>
                        </div>
                    </a>
                    <p class="text-slate-400 text-sm leading-relaxed max-w-sm mx-auto sm:mx-0 font-light">
                        Uniformes médicos y profesionales confeccionados en Usulután, El Salvador. Telas antifluido, corte anatómico y durabilidad comprobada.
                    </p>

                    <div class="mt-6 flex justify-center sm:justify-start gap-3">
                        <a href="https://www.instagram.com/martexsv?igsh=a3Izc2YzZGNucmVl" target="_blank" rel="noopener" class="w-11 h-11 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center text-slate-300 hover:text-emerald-300 hover:scale-105 active:scale-95 transition-all shadow-xs" aria-label="Instagram de Martex">
                            <i class="fab fa-instagram text-lg"></i>
                        </a>
                        <a href="https://wa.me/50360497383" target="_blank" rel="noopener" class="w-11 h-11 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center text-slate-300 hover:text-emerald-300 hover:scale-105 active:scale-95 transition-all shadow-xs" aria-label="WhatsApp de Martex">
                            <i class="fab fa-whatsapp text-lg"></i>
                        </a>
                    </div>
                </div>

                <!-- Enlaces -->
                <div>
                    <h4 class="font-display font-bold text-white mb-5 uppercase tracking-wider text-xs">Navegación</h4>
                    <ul class="space-y-3 text-slate-400 text-sm">
                        <li><a href="index.html" class="hover:text-emerald-300 transition-colors inline-flex items-center gap-2"><i class="fas fa-chevron-right text-[10px] text-emerald-400"></i> Inicio</a></li>
                        <li><a href="catalogo.html" class="hover:text-emerald-300 transition-colors inline-flex items-center gap-2"><i class="fas fa-chevron-right text-[10px] text-emerald-400"></i> Catálogo Completo</a></li>
                        <li><a href="nosotros.html" class="hover:text-emerald-300 transition-colors inline-flex items-center gap-2"><i class="fas fa-chevron-right text-[10px] text-emerald-400"></i> Sobre Nosotros</a></li>
                        <li><a href="mi-cuenta.html" class="hover:text-emerald-300 transition-colors inline-flex items-center gap-2"><i class="fas fa-chevron-right text-[10px] text-emerald-400"></i> Mi Cuenta & Pedidos</a></li>
                    </ul>
                </div>

                <!-- Contacto -->
                <div>
                    <h4 class="font-display font-bold text-white mb-5 uppercase tracking-wider text-xs">Taller y Ventas</h4>
                    <ul class="space-y-3.5 text-slate-400 text-sm">
                        <li class="flex items-start justify-center sm:justify-start gap-3">
                            <i class="fas fa-map-marker-alt text-emerald-400 mt-1 shrink-0"></i>
                            <span class="leading-relaxed">Colonia Los Santos, C. Grimaldi Final,<br>Usulután, El Salvador</span>
                        </li>
                        <li class="flex items-center justify-center sm:justify-start gap-3">
                            <i class="fas fa-phone-alt text-emerald-400 shrink-0"></i>
                            <a href="tel:+50360497383" class="hover:text-white transition-colors">+503 6049-7383</a>
                        </li>
                        <li class="flex items-center justify-center sm:justify-start gap-3">
                            <i class="far fa-envelope text-emerald-400 shrink-0"></i>
                            <a href="mailto:info@martexuniforms.com" class="hover:text-white transition-colors">info@martexuniforms.com</a>
                        </li>
                    </ul>
                </div>

                <!-- Horario -->
                <div>
                    <h4 class="font-display font-bold text-white mb-5 uppercase tracking-wider text-xs">Horario de Atención</h4>
                    <ul class="space-y-3 text-slate-400 text-sm">
                        <li class="flex items-center justify-center sm:justify-start gap-3">
                            <i class="far fa-clock text-emerald-400"></i>
                            <span>Lun - Vie: 8:00 AM - 5:00 PM</span>
                        </li>
                        <li class="flex items-center justify-center sm:justify-start gap-3">
                            <i class="far fa-clock text-emerald-400"></i>
                            <span>Sábado: 8:00 AM - 12:00 PM</span>
                        </li>
                    </ul>
                    <a href="catalogo.html" class="mt-5 inline-flex items-center gap-2 bg-verde-quirurgico hover:bg-verde-quirurgico-dark text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all shadow-sm hover:shadow-md active:scale-95">
                        <span>Ver catálogo</span>
                        <i class="fas fa-arrow-right text-xs"></i>
                    </a>
                </div>
            </div>

            <div class="relative z-10 max-w-7xl mx-auto px-5 sm:px-6">
                <div class="border-t border-white/10 mt-12 pt-7 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
                    <p class="text-xs text-slate-500">&copy; 2026 Martex Uniformes. Todos los derechos reservados.</p>
                    <p class="text-xs text-slate-500">Hecho con orgullo en <span class="text-emerald-400 font-semibold">Usulután, El Salvador</span> 🇸🇻</p>
                </div>
            </div>
        </footer>`;
    }
}

if (!customElements.get('footer-component')) {
    customElements.define('footer-component', FooterComponent);
}
