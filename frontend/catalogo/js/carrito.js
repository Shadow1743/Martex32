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
            <div class="flex gap-4 mb-6 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm relative">
                <img src="${item.imagen || 'https://placehold.co/100x100/0A1128/FFFFFF?text=M'}" class="w-20 h-20 object-cover rounded-xl bg-gray-100">
                <div class="flex-grow">
                    <h4 class="font-display font-bold text-azul-marino text-sm leading-tight pr-6">${item.nombre}</h4>
                    <p class="text-xs text-gray-500 mt-1">Talla: ${item.talla}</p>
                    <p class="text-verde-quirurgico font-bold mt-1">$${item.precio.toFixed(2)}</p>
                    <div class="flex items-center gap-3 mt-3">
                        <div class="flex items-center bg-gray-100 rounded-lg">
                            <button onclick="modificarCantidad(${index}, -1)" class="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-azul-marino transition-colors"><i class="fas fa-minus text-xs"></i></button>
                            <span class="w-6 text-center text-sm font-semibold">${item.cantidad}</span>
                            <button onclick="modificarCantidad(${index}, 1)" class="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-azul-marino transition-colors"><i class="fas fa-plus text-xs"></i></button>
                        </div>
                    </div>
                </div>
                <button onclick="eliminarDelCarrito(${index})" class="absolute top-4 right-4 text-gray-300 hover:text-red-500 transition-colors">
                    <i class="fas fa-trash-alt"></i>
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
    const radios = document.getElementsByName(prefix + id);
    let tallaSel = 'M'; // Default
    if (radios && radios.length > 0) {
        for (const radio of radios) {
            if (radio.checked) {
                tallaSel = radio.value;
                break;
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