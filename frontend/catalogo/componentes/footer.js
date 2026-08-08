class FooterComponent extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
        <footer class="relative bg-azul-marino text-white pt-16 sm:pt-20 pb-8 mt-auto overflow-hidden">
            <!-- Línea de acento superior -->
            <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-verde-quirurgico to-transparent opacity-50"></div>
            <div class="absolute bottom-0 right-0 w-96 h-96 bg-verde-quirurgico/10 rounded-full blur-[100px] translate-y-1/2"></div>

            <div class="relative z-10 max-w-7xl mx-auto px-5 sm:px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 sm:gap-12 text-center sm:text-left">
                <!-- Marca -->
                <div class="sm:col-span-2 lg:col-span-1">
                    <h3 class="font-display text-2xl sm:text-3xl font-bold text-verde-quirurgico mb-4 flex items-center justify-center sm:justify-start gap-2">
                        <i class="fas fa-stethoscope"></i>
                        MARTEX
                    </h3>
                    <p class="text-gray-400 text-sm leading-relaxed max-w-sm mx-auto sm:mx-0">
                        Uniformes profesionales hechos en Usulután, El Salvador. Comodidad, estilo y durabilidad para acompañarte en cada jornada.
                    </p>

                    <div class="mt-7 flex justify-center sm:justify-start gap-3">
                        <a href="https://www.instagram.com/martexsv?igsh=a3Izc2YzZGNucmVl" target="_blank" rel="noopener" class="w-11 h-11 rounded-xl glass flex items-center justify-center text-white hover:text-verde-quirurgico hover:scale-110 transition-all shadow-sm" aria-label="Instagram">
                            <i class="fab fa-instagram text-lg"></i>
                        </a>
                        <a href="https://wa.me/50360497383" target="_blank" rel="noopener" class="w-11 h-11 rounded-xl glass flex items-center justify-center text-white hover:text-verde-quirurgico hover:scale-110 transition-all shadow-sm" aria-label="WhatsApp">
                            <i class="fab fa-whatsapp text-lg"></i>
                        </a>
                    </div>
                </div>

                <!-- Enlaces -->
                <div>
                    <h4 class="font-display font-semibold text-white mb-5 uppercase tracking-wider text-sm">Enlaces</h4>
                    <ul class="space-y-3 text-gray-400 text-sm">
                        <li><a href="index.html" class="hover:text-verde-quirurgico transition-colors inline-flex items-center gap-2"><i class="fas fa-chevron-right text-[10px]"></i> Inicio</a></li>
                        <li><a href="catalogo.html" class="hover:text-verde-quirurgico transition-colors inline-flex items-center gap-2"><i class="fas fa-chevron-right text-[10px]"></i> Catálogo</a></li>
                        <li><a href="nosotros.html" class="hover:text-verde-quirurgico transition-colors inline-flex items-center gap-2"><i class="fas fa-chevron-right text-[10px]"></i> Nosotros</a></li>
                        <li><a href="mi-cuenta.html" class="hover:text-verde-quirurgico transition-colors inline-flex items-center gap-2"><i class="fas fa-chevron-right text-[10px]"></i> Mi Cuenta</a></li>
                    </ul>
                </div>

                <!-- Contacto -->
                <div>
                    <h4 class="font-display font-semibold text-white mb-5 uppercase tracking-wider text-sm">Contacto</h4>
                    <ul class="space-y-4 text-gray-400 text-sm">
                        <li class="flex items-start justify-center sm:justify-start gap-3">
                            <i class="fas fa-map-marker-alt text-verde-quirurgico mt-1"></i>
                            <span class="leading-relaxed">Colonia Los Santos, C. Grimaldi Final,<br>Usulután, El Salvador</span>
                        </li>
                        <li class="flex items-center justify-center sm:justify-start gap-3">
                            <i class="fas fa-phone-alt text-verde-quirurgico"></i>
                            <a href="tel:+50360497383" class="hover:text-white transition-colors">+503 6049-7383</a>
                        </li>
                        <li class="flex items-center justify-center sm:justify-start gap-3">
                            <i class="far fa-envelope text-verde-quirurgico"></i>
                            <a href="mailto:info@martexuniforms.com" class="hover:text-white transition-colors">info@martexuniforms.com</a>
                        </li>
                    </ul>
                </div>

                <!-- Horario -->
                <div>
                    <h4 class="font-display font-semibold text-white mb-5 uppercase tracking-wider text-sm">Horario</h4>
                    <ul class="space-y-3 text-gray-400 text-sm">
                        <li class="flex items-center justify-center sm:justify-start gap-3">
                            <i class="far fa-clock text-verde-quirurgico"></i>
                            <span>Lun - Vie: 8:00 AM - 5:00 PM</span>
                        </li>
                        <li class="flex items-center justify-center sm:justify-start gap-3">
                            <i class="far fa-clock text-verde-quirurgico"></i>
                            <span>Sábado: 8:00 AM - 12:00 PM</span>
                        </li>
                    </ul>
                    <a href="catalogo.html" class="mt-6 inline-flex items-center gap-2 bg-verde-quirurgico hover:bg-verde-quirurgico-dark text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all shadow-md hover:shadow-lg">
                        Mirá el catálogo
                        <i class="fas fa-arrow-right text-xs"></i>
                    </a>
                </div>
            </div>

            <div class="relative z-10 max-w-7xl mx-auto px-5 sm:px-6">
                <div class="border-t border-white/10 mt-12 pt-7 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
                    <p class="text-xs text-gray-500">&copy; 2026 Martex Uniformes. Todos los derechos reservados.</p>
                    <p class="text-xs text-gray-500">Hecho con orgullo en <span class="text-verde-quirurgico font-semibold">El Salvador</span> 🇸🇻</p>
                </div>
            </div>
        </footer>`;
    }
}

if (!customElements.get('footer-component')) {
    customElements.define('footer-component', FooterComponent);
}
