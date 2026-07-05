class FooterComponent extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
        <footer class="relative bg-azul-marino text-white pt-20 pb-10 mt-auto overflow-hidden">
            <!-- Background gradients for premium feel -->
            <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-verde-quirurgico to-transparent opacity-50"></div>
            <div class="absolute bottom-0 right-0 w-96 h-96 bg-verde-quirurgico/10 rounded-full blur-[100px] translate-y-1/2"></div>
            
            <div class="relative z-10 max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 text-center md:text-left">
                <!-- Brand Column -->
                <div class="md:col-span-2">
                    <h3 class="font-display text-3xl font-bold text-verde-quirurgico mb-4 flex items-center justify-center md:justify-start gap-2">
                        <i class="fas fa-stethoscope"></i>
                        MARTEX
                    </h3>
                    <p class="text-gray-400 text-sm leading-relaxed max-w-sm mx-auto md:mx-0">
                        Uniformes profesionales premium. Diseñados para resistir jornadas exigentes con estilo, comodidad y la calidad que inspira confianza.
                    </p>
                    
                    <div class="mt-8 flex justify-center md:justify-start gap-4">
                        <a href="https://www.instagram.com/martexsv?igsh=a3Izc2YzZGNucmVl" class="w-12 h-12 rounded-full glass flex items-center justify-center text-white hover:text-verde-quirurgico hover:scale-110 transition-all shadow-sm" aria-label="Instagram">
                            <i class="fab fa-instagram text-xl"></i>
                        </a>
                        <a href="#" class="w-12 h-12 rounded-full glass flex items-center justify-center text-white hover:text-verde-quirurgico hover:scale-110 transition-all shadow-sm" aria-label="WhatsApp">
                            <i class="fab fa-whatsapp text-xl"></i>
                        </a>
                    </div>
                </div>

                <!-- Contact Column -->
                <div>
                    <h4 class="font-display text-lg font-semibold text-white mb-6 uppercase tracking-wider text-sm">Contáctanos</h4>
                    <ul class="space-y-4 text-gray-400 text-sm">
                        <li class="flex items-start justify-center md:justify-start gap-3 group">
                            <i class="fas fa-map-marker-alt text-verde-quirurgico mt-1 group-hover:animate-bounce"></i>
                            <span class="leading-relaxed">Colonia Los Santos, C. Grimaldi Final,<br>Usulután, El Salvador</span>
                        </li>
                        <li class="flex items-center justify-center md:justify-start gap-3 group">
                            <i class="fas fa-phone-alt text-verde-quirurgico group-hover:scale-110 transition-transform"></i>
                            <a href="tel:+50360497383" class="hover:text-white transition-colors">+503 6049-7383</a>
                        </li>
                        <li class="flex items-center justify-center md:justify-start gap-3 group">
                            <i class="far fa-envelope text-verde-quirurgico group-hover:scale-110 transition-transform"></i>
                            <a href="mailto:info@martexuniforms.com" class="hover:text-white transition-colors">info@martexuniforms.com</a>
                        </li> 
                    </ul>
                </div>

                <!-- Links Column -->
                <div>
                    <h4 class="font-display text-lg font-semibold text-white mb-6 uppercase tracking-wider text-sm">Enlaces</h4>
                    <ul class="space-y-3 text-gray-400 text-sm">
                        <li><a href="index.html" class="hover:text-verde-quirurgico transition-colors inline-flex items-center gap-2"><i class="fas fa-chevron-right text-[10px]"></i> Inicio</a></li>
                        <li><a href="catalogo.html" class="hover:text-verde-quirurgico transition-colors inline-flex items-center gap-2"><i class="fas fa-chevron-right text-[10px]"></i> Catálogo</a></li>
                        <li><a href="nosotros.html" class="hover:text-verde-quirurgico transition-colors inline-flex items-center gap-2"><i class="fas fa-chevron-right text-[10px]"></i> Nosotros</a></li>
                        <li><a href="#" class="hover:text-verde-quirurgico transition-colors inline-flex items-center gap-2"><i class="fas fa-chevron-right text-[10px]"></i> Términos y Condiciones</a></li>
                    </ul>
                </div>
            </div>
            
            <div class="relative z-10 border-t border-white/10 mt-16 pt-8 text-center text-xs text-gray-500">
                <p>&copy; 2026 Martex Uniformes. Hecho con orgullo en <span class="text-verde-quirurgico font-semibold">El Salvador</span> 🇸🇻</p>
            </div>
        </footer>`;
    }
}

if (!customElements.get('footer-component')) {
    customElements.define('footer-component', FooterComponent);
}