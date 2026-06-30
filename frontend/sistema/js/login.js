document.addEventListener('DOMContentLoaded', () => {
    const formLogin = document.getElementById('login-form'); 
    const emailInput = document.getElementById('email');     
    const passwordInput = document.getElementById('password');
    const errorMensaje = document.getElementById('alert-error'); 
    
    // Helper to show error message (supports the new icon+span structure)
    function showError(msg) {
        const span = errorMensaje.querySelector('span');
        if (span) {
            span.textContent = msg;
        } else {
            errorMensaje.textContent = msg;
        }
        errorMensaje.classList.remove('hidden');
    }

    formLogin.addEventListener('submit', async (e) => { 
        e.preventDefault();
        
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        // Ocultar mensaje de error previo
        errorMensaje.classList.add('hidden'); 

        // Validar campos vacíos 
        if (!email || !password) {
            showError("Por favor, completa todos los campos.");
            return;
        }

        try {
            const btnSubmit = formLogin.querySelector('button[type="submit"]');
            btnSubmit.disabled = true;
            btnSubmit.innerHTML = '<i class="fas fa-spinner fa-spin"></i> VERIFICANDO...';

            const res = await fetch(CONFIG.API_URL + '/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            if (res.ok) {
                const data = await res.json();
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                window.location.href = "index.html"; 
            } else {
                const errorData = await res.json();
                showError(errorData.message || "Usuario o contraseña incorrectos.");
                passwordInput.value = '';
                passwordInput.focus();
            }
        } catch (err) {
            console.error("Error en login:", err);
            showError("Error de red. Intenta nuevamente.");
        } finally {
            const btnSubmit = formLogin.querySelector('button[type="submit"]');
            btnSubmit.disabled = false;
            btnSubmit.innerHTML = '<span>Iniciar Sesión</span> <i class="fas fa-arrow-right text-xs"></i>';
        }
    });
});