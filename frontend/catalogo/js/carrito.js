// Lógica del Carrito de Compras (Local Storage)

let carrito = JSON.parse(localStorage.getItem('martex_carrito')) || [];

function actualizarCarritoUI() {
    const itemsContainer = document.getElementById('cart-items');
    const totalEl = document.getElementById('cart-total');
    
    if (!itemsContainer || !totalEl) return;

    if (carrito.length === 0) {
        itemsContainer.innerHTML = `
            <div class="text-center text-gray-400 py-10 h-full flex flex-col items-center justify-center">
                <i class="fas fa-shopping-basket text-5xl mb-4 opacity-50"></i>
                <p class="text-lg">Tu carrito está vacío</p>
                <button onclick="toggleCart()" class="mt-6 text-verde-quirurgico hover:underline font-medium">Seguir comprando</button>
            </div>`;
        totalEl.innerText = "$0.00";
        return;
    }

    let html = '';
    let total = 0;

    carrito.forEach((item, index) => {
        total += item.precio * item.cantidad;
        html += `
            <div class="flex gap-4 mb-4 bg-white dark:bg-[#0A1428] p-4 rounded-2xl border border-slate-100 dark:border-white/10 shadow-xs relative transition-colors">
                <img src="${item.imagen || 'imagenes/conjunto de uniforme médico.jpeg'}" alt="${item.nombre}" class="w-20 h-20 object-cover rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-100 dark:border-white/5 shrink-0">
                <div class="flex-grow pr-6">
                    <h4 class="font-display font-bold text-azul-marino dark:text-white text-sm leading-snug">${item.nombre}</h4>
                    <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">Talla: <span class="font-bold text-verde-quirurgico dark:text-emerald-400">${item.talla}</span></p>
                    <p class="text-verde-quirurgico dark:text-emerald-400 font-extrabold text-sm mt-1">$${item.precio.toFixed(2)}</p>
                    <div class="flex items-center gap-3 mt-3">
                        <div class="flex items-center bg-slate-100 dark:bg-white/10 rounded-xl p-0.5 border border-slate-200/50 dark:border-white/10">
                            <button onclick="modificarCantidad(${index}, -1)" class="w-7 h-7 flex items-center justify-center text-slate-500 dark:text-slate-300 hover:text-azul-marino dark:hover:text-white transition-colors" aria-label="Disminuir cantidad"><i class="fas fa-minus text-[10px]"></i></button>
                            <span class="w-6 text-center text-xs font-bold text-azul-marino dark:text-white">${item.cantidad}</span>
                            <button onclick="modificarCantidad(${index}, 1)" class="w-7 h-7 flex items-center justify-center text-slate-500 dark:text-slate-300 hover:text-azul-marino dark:hover:text-white transition-colors" aria-label="Aumentar cantidad"><i class="fas fa-plus text-[10px]"></i></button>
                        </div>
                    </div>
                </div>
                <button onclick="eliminarDelCarrito(${index})" class="absolute top-4 right-4 w-7 h-7 rounded-lg flex items-center justify-center text-slate-300 dark:text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors" aria-label="Eliminar producto">
                    <i class="fas fa-trash-alt text-xs"></i>
                </button>
            </div>
        `;
    });

    itemsContainer.innerHTML = html;
    totalEl.innerText = "$" + total.toFixed(2);
}

function agregarAlCarrito(id, nombre, precio, imagen, talla = 'M') {
    const existente = carrito.find(item => item.id == id && item.talla == talla);
    if (existente) {
        existente.cantidad += 1;
    } else {
        carrito.push({ id, nombre, precio: parseFloat(precio), imagen, talla, cantidad: 1 });
    }
    
    guardarCarrito();
    toggleCart(true); // Abrir el panel
}

function agregarAlCarritoConTalla(id, nombre, precio, imagen, prefix = 'talla-dest-', redirect = false) {
    let tallaSel = 'M'; // Default
    // Primero intentar con input hidden (nuevo enfoque mobile-friendly)
    const hiddenInput = document.querySelector(`input[type="hidden"][name="${prefix}${id}"]`);
    if (hiddenInput) {
        tallaSel = hiddenInput.value;
    } else {
        // Fallback: radio buttons (enfoque anterior)
        const radios = document.getElementsByName(prefix + id);
        if (radios && radios.length > 0) {
            for (const radio of radios) {
                if (radio.checked) {
                    tallaSel = radio.value;
                    break;
                }
            }
        }
    }
    agregarAlCarrito(id, nombre, precio, imagen, tallaSel);
    if (redirect) {
        window.location.href = 'checkout.html';
    }
}

function modificarCantidad(index, delta) {
    if (carrito[index]) {
        carrito[index].cantidad += delta;
        if (carrito[index].cantidad <= 0) {
            carrito.splice(index, 1);
        }
        guardarCarrito();
    }
}

function eliminarDelCarrito(index) {
    carrito.splice(index, 1);
    guardarCarrito();
}

function guardarCarrito() {
    localStorage.setItem('martex_carrito', JSON.stringify(carrito));
    actualizarCarritoUI();
    // Dispatch event para que el navbar actualice su contador si lo tiene
    window.dispatchEvent(new Event('carrito_actualizado'));
}

function toggleCart(forceOpen = false) {
    const panel = document.getElementById('cart-panel');
    const overlay = document.getElementById('cart-overlay');
    const content = document.getElementById('cart-content');
    
    if (!panel) return;

    const isClosed = panel.classList.contains('invisible');
    
    if (isClosed || forceOpen) {
        panel.classList.remove('invisible');
        setTimeout(() => {
            overlay.classList.remove('opacity-0');
            content.classList.remove('translate-x-full');
        }, 10);
        actualizarCarritoUI();
    } else {
        overlay.classList.add('opacity-0');
        content.classList.add('translate-x-full');
        setTimeout(() => {
            panel.classList.add('invisible');
        }, 300); // duración de la transición
    }
}

// Inicializar al cargar
document.addEventListener('DOMContentLoaded', actualizarCarritoUI);