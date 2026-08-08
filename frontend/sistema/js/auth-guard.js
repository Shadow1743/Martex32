// auth-guard.js
document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");
    
    if (!token) {
        window.location.href = "login.html";
        return;
    }

    try {
        // Basic JWT validation (check expiration if payload exists)
        const payload = JSON.parse(atob(token.split('.')[1]));
        const now = Math.floor(Date.now() / 1000);
        
        if (payload.exp && payload.exp < now) {
            console.warn("Token expirado. Redirigiendo a login.");
            localStorage.removeItem("token");
            localStorage.removeItem("usuario");
            window.location.href = "login.html";
        }
    } catch (e) {
        console.error("Token inválido", e);
        localStorage.removeItem("token");
        window.location.href = "login.html";
    }
});
