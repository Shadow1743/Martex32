/**
 * Función utilitaria para sanitizar cadenas de texto antes de insertarlas en el DOM mediante innerHTML.
 * Esto previene ataques de Cross-Site Scripting (XSS).
 * @param {string} str - La cadena a sanitizar
 * @returns {string} - La cadena sanitizada
 */
function escapeHTML(str) {
    if (str === null || str === undefined) return '';
    return String(str).replace(/[&<>'"]/g, 
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag] || tag)
    );
}

// Exportar globalmente para ser usada por otros scripts
window.escapeHTML = escapeHTML;
