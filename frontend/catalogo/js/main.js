// Lógica compartida para actualizar el contador del carrito en todas las páginas
function actualizarContador() {
    const carrito = JSON.parse(localStorage.getItem('martex-carrito')) || [];
    const countElement = document.getElementById('cart-count');
    if (countElement) {
        countElement.innerText = carrito.length;
    }
}

document.addEventListener('DOMContentLoaded', actualizarContador);