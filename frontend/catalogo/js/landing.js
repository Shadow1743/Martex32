/* ═══════════════════════════════════════════════════════════
   MARTEX · Landing Page — Lógica de interfaz (Vanilla JS)
   - Iconos Lucide
   - Barra de progreso de lectura + botón "volver arriba"
   - Barra sticky de conversión móvil
   - Scroll reveal (IntersectionObserver)
   - Selector de tallas de productos destacados
   - Acordeón FAQ accesible (ARIA + teclado)
   - Carga de productos destacados vía API (con fallback local)
   - Sistema de notificaciones toast
   ═══════════════════════════════════════════════════════════ */

// ── Iconos Lucide ────────────────────────────────────────────
if (window.lucide) lucide.createIcons();

// ── Barra de progreso de lectura ─────────────────────────────
const progressBar = document.getElementById('reading-progress');
window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    if (progressBar) progressBar.style.width = progress + '%';
}, { passive: true });

// ── Visibilidad: scroll-top + barra sticky móvil ─────────────
const scrollBtn = document.getElementById('scroll-top-btn');
const mobileStickyBar = document.getElementById('mobile-sticky-cta');
window.addEventListener('scroll', () => {
    if (scrollBtn) scrollBtn.classList.toggle('visible', window.scrollY > 400);
    if (mobileStickyBar) mobileStickyBar.classList.toggle('visible', window.scrollY > 600);
}, { passive: true });

// ── Scroll reveal (IntersectionObserver) ─────────────────────
const observerOptions = { threshold: 0.12, rootMargin: '0px 0px -40px 0px' };
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

document.querySelectorAll('.reveal-on-scroll, .reveal-left, .reveal-right').forEach(el => observer.observe(el));

// ── Selector de talla (productos destacados) ─────────────────
// Clases del estado seleccionado / no seleccionado (paleta navy)
const TALLA_SELECTED = ['bg-blue-950', 'dark:bg-blue-600', 'text-white', 'border-blue-950', 'dark:border-blue-600', 'shadow-xs'];
const TALLA_UNSELECTED = ['border-slate-200', 'dark:border-slate-700', 'bg-white', 'dark:bg-slate-900', 'text-slate-600', 'dark:text-slate-300'];

function seleccionarTallaHome(btn, prodId, talla) {
    const container = btn.parentElement;
    container.querySelectorAll('.talla-btn').forEach(b => {
        b.classList.remove(...TALLA_SELECTED);
        b.classList.add(...TALLA_UNSELECTED);
    });
    btn.classList.remove(...TALLA_UNSELECTED);
    btn.classList.add(...TALLA_SELECTED);
    const hiddenInput = document.querySelector(`input[name="talla-dest-${prodId}"]`);
    if (hiddenInput) hiddenInput.value = talla;
}

// ── Acordeón FAQ (exclusivo, accesible) ──────────────────────
function toggleFaq(headerElement) {
    const faqItem = headerElement.closest('.faq-item');
    if (!faqItem) return;
    const isActive = faqItem.classList.contains('active');

    document.querySelectorAll('.faq-item').forEach(item => {
        item.classList.remove('active');
        const header = item.querySelector('.faq-header');
        if (header) header.setAttribute('aria-expanded', 'false');
    });

    if (!isActive) {
        faqItem.classList.add('active');
        headerElement.setAttribute('aria-expanded', 'true');
    }
}

// Soporte de teclado para el acordeón (Enter / Espacio)
document.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const header = e.target.closest && e.target.closest('.faq-header');
    if (header) {
        e.preventDefault();
        toggleFaq(header);
    }
});

// ── Carga de productos destacados ────────────────────────────
document.addEventListener("DOMContentLoaded", async () => {
    let productos = [];
    const destacadosContainer = document.getElementById("productos-destacados");

    // Skeletons de carga
    if (destacadosContainer) {
        destacadosContainer.innerHTML = Array(3).fill(0).map(() => `
            <div class="bg-white dark:bg-slate-900/60 rounded-3xl overflow-hidden card-premium shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col">
                <div class="h-72 skeleton w-full"></div>
                <div class="p-6 flex flex-col flex-grow">
                    <div class="h-5 skeleton w-3/4 mb-3"></div>
                    <div class="h-4 skeleton w-full mb-2"></div>
                    <div class="h-4 skeleton w-5/6 mb-6"></div>
                    <div class="flex gap-2 mt-auto pt-4 border-t border-slate-100 dark:border-slate-800">
                        <div class="h-10 skeleton flex-1 rounded-xl"></div>
                        <div class="h-10 skeleton flex-1 rounded-xl"></div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    try {
        const apiUrl = (typeof CONFIG !== 'undefined' && CONFIG.API_URL) ? CONFIG.API_URL : '';
        if (apiUrl) {
            const res = await fetch(apiUrl + '/productos');
            if (res.ok) {
                productos = await res.json();
            }
        }
    } catch (err) {
        console.error('Error al cargar productos destacados:', err);
    }

    // Fallback con imágenes locales en caso de catálogo vacío o sin backend activo
    const fallbackProductos = [
        {
            id: 1,
            nombre: "Scrub Médico Ergonómico Usulután",
            descripcion: "Conjunto ergonómico confeccionado en tela 4-Way Stretch antifluido con triple costura reforzada.",
            categoria: "Médico",
            precio_base: 32.00,
            porcentaje_descuento: 0,
            imagen_url: "/catalogo/imagenes/Camisa (scrug) color  verde esmeralda.jpeg"
        },
        {
            id: 2,
            nombre: "Bata Médica Clínica Tradicional",
            descripcion: "Bata profesional de corte entallado con solapa clásica, bolsillos para instrumental y tacto fresco.",
            categoria: "Médico",
            precio_base: 28.00,
            porcentaje_descuento: 10,
            imagen_url: "/catalogo/imagenes/Abrigo médico.jpeg"
        },
        {
            id: 3,
            nombre: "Filipina Quirúrgica Charcoal Flex",
            descripcion: "Prenda de alta resistencia térmica para turnos prolongados, secado ultra-rápido y caída impecable.",
            categoria: "Belleza & Salud",
            precio_base: 26.50,
            porcentaje_descuento: 0,
            imagen_url: "/catalogo/imagenes/Camisa de uniforme color gris.jpeg"
        }
    ];

    const displayList = (productos && productos.length > 0) ? productos.slice(0, 3) : fallbackProductos;

    if (destacadosContainer && displayList.length > 0) {
        destacadosContainer.innerHTML = displayList.map((prod, index) => {
            const desc = prod.porcentaje_descuento || 0;
            const precioBase = parseFloat(prod.precio_base) || 0;
            const precioFinal = precioBase - (precioBase * (desc / 100));

            let imageUrl = prod.imagen_url || '';
            const baseUrl = (typeof CONFIG !== 'undefined' && CONFIG.BASE_URL) ? CONFIG.BASE_URL : '';
            if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('/')) {
                imageUrl = baseUrl ? `${baseUrl}/${imageUrl}` : imageUrl;
            } else if (!imageUrl) {
                imageUrl = 'imagenes/conjunto de uniforme médico.jpeg';
            }
            const hasDiscount = desc > 0;

            return `
            <div class="bg-white dark:bg-slate-900/60 rounded-3xl overflow-hidden card-premium shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col group reveal-on-scroll transition-colors" style="transition-delay:${index * 0.1}s">
                <div class="h-72 bg-slate-100 dark:bg-slate-900 relative overflow-hidden">
                    <img src="${escapeHTML(imageUrl)}" alt="${escapeHTML(prod.nombre)}" class="w-full h-full object-cover object-top img-hover-zoom">

                    <div class="absolute top-4 left-4 right-4 flex justify-between items-start">
                        <span class="bg-white/90 dark:bg-slate-950/80 backdrop-blur-md text-slate-700 dark:text-slate-200 text-xs font-semibold px-3 py-1 rounded-full shadow-xs border border-slate-200/60 dark:border-slate-700">
                            ${escapeHTML(prod.categoria || 'Colección')}
                        </span>
                        <button data-fav-id="${escapeHTML(String(prod.id))}" onclick="event.stopPropagation(); MartexFavoritos.toggle('${escapeHTML(String(prod.id))}', this)" aria-label="Guardar en favoritos" class="w-11 h-11 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors shadow-xs border border-slate-200/60 dark:border-slate-700">
                            <i class="far fa-heart text-sm"></i>
                        </button>
                    </div>

                    ${hasDiscount ? `
                    <div class="absolute bottom-3 left-3 bg-red-500 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-xs">
                        -${desc}% OFF
                    </div>` : ''}
                </div>

                <div class="p-6 flex flex-col flex-grow">
                    <h3 class="font-display font-bold text-lg sm:text-xl text-slate-900 dark:text-white mb-1.5 group-hover:text-blue-900 dark:group-hover:text-blue-300 transition-colors">${escapeHTML(prod.nombre)}</h3>
                    <p class="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mb-4 leading-relaxed line-clamp-2 flex-grow font-light">${escapeHTML(prod.descripcion || '')}</p>

                    <!-- Selector de talla ergonómica -->
                    <div class="mb-5 pt-3 border-t border-slate-100 dark:border-slate-800">
                        <div class="flex justify-between items-center mb-2">
                            <span class="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Talla sugerida</span>
                            <span class="text-[11px] text-blue-800 dark:text-blue-400 font-medium">Confección sastre</span>
                        </div>
                        <div class="flex gap-2">
                            ${['S', 'M', 'L', 'XL'].map(t => `
                            <button type="button" onclick="seleccionarTallaHome(this, '${escapeHTML(String(prod.id))}', '${t}')" class="talla-btn w-11 h-11 rounded-xl border flex items-center justify-center text-xs font-semibold transition-all active:scale-95 ${t === 'M' ? 'bg-blue-950 dark:bg-blue-600 text-white border-blue-950 dark:border-blue-600 shadow-xs' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:border-blue-900/50 dark:hover:border-blue-400/50'}" data-talla="${t}">${t}</button>
                            `).join('')}
                        </div>
                        <input type="hidden" name="talla-dest-${escapeHTML(String(prod.id))}" value="M">
                    </div>

                    <!-- Precio y Botones de Compra -->
                    <div class="flex flex-col pt-4 border-t border-slate-100 dark:border-slate-800 gap-3 mt-auto">
                        <div class="flex items-baseline justify-between">
                            <div>
                                <span class="text-[11px] text-slate-400 dark:text-slate-500 block font-medium">Precio</span>
                                <span class="font-display font-extrabold text-2xl text-blue-950 dark:text-white">$${precioFinal.toFixed(2)}</span>
                            </div>
                            ${hasDiscount ? `<span class="text-xs text-slate-400 dark:text-slate-500 line-through">$${precioBase.toFixed(2)}</span>` : ''}
                        </div>

                        <div class="flex gap-2">
                            <button onclick="agregarAlCarritoConTalla('${escapeHTML(String(prod.id))}', '${escapeHTML(prod.nombre)}', ${precioFinal}, '${escapeHTML(imageUrl)}', 'talla-dest-')" class="flex-1 min-h-[44px] rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 flex items-center justify-center active:scale-95 transition-all duration-200 font-semibold text-xs gap-1.5 shadow-xs" aria-label="Añadir al carrito">
                                <i class="fas fa-cart-plus text-xs text-blue-800 dark:text-blue-400"></i> Al Carrito
                            </button>
                            <button onclick="agregarAlCarritoConTalla('${escapeHTML(String(prod.id))}', '${escapeHTML(prod.nombre)}', ${precioFinal}, '${escapeHTML(imageUrl)}', 'talla-dest-', true)" class="flex-1 min-h-[44px] rounded-xl bg-blue-950 hover:bg-blue-900 dark:bg-blue-600 dark:hover:bg-blue-500 text-white flex items-center justify-center active:scale-95 transition-all duration-200 font-semibold text-xs gap-1.5 shadow-xs" aria-label="Comprar directo">
                                Comprar <i class="fas fa-arrow-right text-[10px]"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `}).join('');

        // Re-observar nuevas tarjetas añadidas
        document.querySelectorAll('#productos-destacados .reveal-on-scroll').forEach(el => observer.observe(el));

        // Sincronizar estado de favoritos
        if (typeof MartexFavoritos !== 'undefined') MartexFavoritos.applyToPage();
        if (window.lucide) lucide.createIcons();
    }
});

// ── Sistema de notificaciones toast ──────────────────────────
function showToast(message, type = 'success', duration = 3500) {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    const icons = { success: 'fa-check-circle', error: 'fa-exclamation-circle', info: 'fa-info-circle' };
    toast.innerHTML = `<i class="fas ${icons[type] || icons.info} toast-icon"></i><span>${message}</span>`;
    container.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('show'));
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 500);
    }, duration);
}

// ── Utilidad anti-XSS para templates ─────────────────────────
function escapeHTML(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
