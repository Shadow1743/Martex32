// favoritos.js — Lógica de favoritos para el catálogo
window.MartexFavoritos = {
    // Toggle favorito con animación
    async toggle(productoId, btnElement) {
        const token = localStorage.getItem('cliente_token');

        if (!token) {
            // Si no está logueado, abrir modal de login
            const modal = document.querySelector('auth-modal');
            if (modal) modal.open('login');
            return;
        }

        try {
            // Animación de click
            if (btnElement) {
                btnElement.classList.add('scale-125');
                setTimeout(() => btnElement.classList.remove('scale-125'), 200);
            }

            const res = await fetch(`${CONFIG.API_URL}/favoritos/${productoId}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.status === 401) {
                localStorage.removeItem('cliente_token');
                localStorage.removeItem('cliente');
                const modal = document.querySelector('auth-modal');
                if (modal) modal.open('login');
                return;
            }

            if (res.ok) {
                const data = await res.json();
                this.updateButton(btnElement, data.isFavorite);
                window.dispatchEvent(new CustomEvent('favoritos_change'));
            }
        } catch (err) {
            console.error('Error toggling favorito:', err);
        }
    },

    // Actualizar apariencia del botón
    updateButton(btn, isFavorite) {
        if (!btn) return;
        const icon = btn.querySelector('i');
        if (isFavorite) {
            icon.className = 'fas fa-heart';
            btn.classList.add('text-red-500');
            btn.classList.remove('text-gray-400');
        } else {
            icon.className = 'far fa-heart';
            btn.classList.remove('text-red-500');
            btn.classList.add('text-gray-400');
        }
    },

    // Batch check: dado un array de productoIds, marca los favoritos
    async checkBatch(productoIds) {
        const token = localStorage.getItem('cliente_token');
        if (!token || !productoIds.length) return [];

        try {
            const res = await fetch(`${CONFIG.API_URL}/favoritos/check-batch`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ productoIds })
            });

            if (res.ok) {
                const data = await res.json();
                return data.favoritos || [];
            }
        } catch (err) {
            console.error('Error checking batch favorites:', err);
        }
        return [];
    },

    // Aplica el estado de favoritos a todos los botones en la página
    async applyToPage() {
        const token = localStorage.getItem('cliente_token');
        if (!token) return;

        const buttons = document.querySelectorAll('[data-fav-id]');
        if (buttons.length === 0) return;

        const ids = [...buttons].map(b => b.dataset.favId);
        const favoritos = await this.checkBatch(ids);

        buttons.forEach(btn => {
            const isFav = favoritos.includes(btn.dataset.favId);
            this.updateButton(btn, isFav);
        });
    }
};
