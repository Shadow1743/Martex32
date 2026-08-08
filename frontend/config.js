// Archivo de configuración global
const hostname = window.location.hostname;
const isLocal = hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.');

const CONFIG = {
    // Si estamos en entorno local, apuntar al backend que corre en el puerto 3000 de esa misma IP. Si no, usar la URL relativa para producción
    API_URL: isLocal ? `http://${hostname}:3000/api` : '/api',
    BASE_URL: isLocal ? `http://${hostname}:3000` : '',
    
    // Credenciales para Login Social (Reemplazar con reales en producción)
    GOOGLE_CLIENT_ID: 'test-client-id.apps.googleusercontent.com',
    FACEBOOK_APP_ID: 'test-app-id'
};
