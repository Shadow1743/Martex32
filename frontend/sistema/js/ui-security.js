/**
 * ui-security.js — Kit de seguridad visual para la interfaz Martex
 * ----------------------------------------------------------------
 * Centraliza los patrones de seguridad del lado del cliente:
 *
 *  1. Validación de formularios en tiempo real con estados visuales
 *     (válido / inválido) e indicadores de campos obligatorios.
 *  2. Control de acceso basado en roles (RBAC) en la interfaz:
 *     oculta acciones/elementos según el rol del usuario autenticado.
 *  3. Enmascaramiento de datos sensibles (teléfono, email, DUI)
 *     con opción de revelado controlado.
 *  4. Guardia de sesión por inactividad con advertencia visual
 *     y cierre de sesión automático.
 *  5. Botón de visibilidad de contraseña (helper reutilizable).
 *
 * NOTA: Estas medidas son de UX y complementan —nunca sustituyen—
 * la validación y autorización del backend (JWT + middleware).
 *
 * Expone: window.MartexUI
 */
(function () {
    'use strict';

    /* Iconos SVG inline (estilo Lucide) para no depender de librerías externas */
    const ALERT_ICON_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-3.5 w-3.5 shrink-0" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>';
    const CLOCK_ICON_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-6 w-6" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>';
    const REFRESH_ICON_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4" aria-hidden="true"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>';

    /* Clases Tailwind para estados de validación (se aplican/retiran dinámicamente) */
    const VALID_CLASSES = ['!border-emerald-500'];
    const INVALID_CLASSES = ['!border-red-500'];

    /* =========================================================
       1. VALIDACIÓN DE FORMULARIOS EN TIEMPO REAL
       ========================================================= */

    /** Validadores reutilizables. Devuelven true si el valor es válido. */
    const validators = {
        required: v => String(v).trim().length > 0,
        email: v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(v).trim()),
        phone: v => /^[0-9+\-\s()]{7,20}$/.test(String(v).trim()),
        dui: v => /^\d{8}-?\d$/.test(String(v).trim()),
        number: v => v !== '' && !isNaN(Number(v)),
        positive: v => Number(v) > 0,
        minLength: n => v => String(v).length >= n,
        maxLength: n => v => String(v).length <= n
    };

    /**
     * Marca visualmente el estado de un campo y muestra/oculta su mensaje de error.
     * @param {HTMLElement} input - Campo a evaluar
     * @param {'valid'|'invalid'|'neutral'} state
     * @param {string} [message] - Mensaje de error a mostrar cuando state='invalid'
     */
    function setFieldState(input, state, message) {
        input.classList.remove(...VALID_CLASSES, ...INVALID_CLASSES);
        const group = input.closest('.form-field') || input.parentElement;
        let msgEl = group.querySelector('.field-error-msg');

        if (state === 'invalid') {
            input.classList.add(...INVALID_CLASSES);
            input.setAttribute('aria-invalid', 'true');
            if (!msgEl) {
                msgEl = document.createElement('p');
                msgEl.setAttribute('role', 'alert');
                group.appendChild(msgEl);
            }
            msgEl.className = 'field-error-msg mt-1.5 flex items-center gap-1.5 text-xs font-medium text-red-500 dark:text-red-400';
            const text = window.escapeHTML ? escapeHTML(message || 'Campo inválido') : (message || 'Campo inválido');
            msgEl.innerHTML = `${ALERT_ICON_SVG}<span>${text}</span>`;
        } else {
            input.removeAttribute('aria-invalid');
            if (state === 'valid') input.classList.add(...VALID_CLASSES);
            if (msgEl) msgEl.remove();
        }
    }

    /**
     * Adjunta validación en tiempo real a un campo.
     * @param {HTMLElement} input
     * @param {Array<{check: Function, message: string}>} rules - Se evalúan en orden; la primera que falle define el mensaje.
     * @param {Object} [opts] - { validateOn: 'input'|'blur', required: boolean }
     * @returns {Function} validate() - Fuerza la validación y devuelve boolean.
     */
    function attachValidation(input, rules, opts = {}) {
        if (!input) return () => true;
        const required = opts.required !== false && rules.some(r => r.check === validators.required);

        if (required) {
            const label = document.querySelector(`label[for="${input.id}"]`);
            // Indicador visual de campo obligatorio (asterisco) con clases Tailwind
            if (label && !label.querySelector('[data-required-star]')) {
                const star = document.createElement('span');
                star.setAttribute('data-required-star', '');
                star.setAttribute('aria-hidden', 'true');
                star.className = 'ml-0.5 font-bold text-red-500 dark:text-red-400';
                star.textContent = '*';
                label.appendChild(star);
            }
            input.setAttribute('aria-required', 'true');
        }

        const validate = (showNeutral = false) => {
            const value = input.value;
            // Campo opcional vacío: estado neutro
            if (!required && String(value).trim() === '') {
                setFieldState(input, 'neutral');
                return true;
            }
            for (const rule of rules) {
                if (!rule.check(value)) {
                    setFieldState(input, 'invalid', rule.message);
                    return false;
                }
            }
            setFieldState(input, showNeutral ? 'neutral' : 'valid');
            return true;
        };

        const event = opts.validateOn || 'input';
        input.addEventListener(event, () => validate());
        input.addEventListener('blur', () => {
            // No marcar como inválido un campo obligatorio intacto al salir sin escribir
            if (required && String(input.value).trim() === '' && !input.dataset.touched) return;
            validate();
        });
        input.addEventListener('input', () => { input.dataset.touched = '1'; }, { once: true });

        return validate;
    }

    /**
     * Valida un formulario completo antes de enviarlo.
     * @param {HTMLFormElement} form
     * @param {Array<Function>} validateFns - Funciones devueltas por attachValidation
     * @returns {boolean} true si todo el formulario es válido.
     */
    function validateForm(form, validateFns) {
        const results = validateFns.map(fn => fn());
        const firstInvalid = form.querySelector('.input-invalid');
        if (firstInvalid) firstInvalid.focus();
        return results.every(Boolean);
    }

    /* =========================================================
       2. CONTROL DE ACCESO BASADO EN ROLES (RBAC VISUAL)
       ========================================================= */

    /** Obtiene el rol del usuario autenticado (del objeto user o del payload JWT). */
    function getUserRole() {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            if (user && user.rol) return String(user.rol).toLowerCase();
        } catch (e) { /* continuar con JWT */ }
        try {
            const token = localStorage.getItem('token');
            if (token) {
                const payload = JSON.parse(atob(token.split('.')[1]));
                if (payload.rol) return String(payload.rol).toLowerCase();
            }
        } catch (e) { /* sin rol disponible */ }
        return null;
    }

    /**
     * Oculta los elementos con atributo data-roles="rol1,rol2" cuando el rol
     * actual no está incluido. Los elementos sin el atributo no se tocan.
     * Uso: <button data-roles="admin">Eliminar</button>
     */
    function applyRoleVisibility(root = document) {
        const role = getUserRole();
        root.querySelectorAll('[data-roles]').forEach(el => {
            const allowed = el.dataset.roles.split(',').map(r => r.trim().toLowerCase());
            const visible = !!(role && allowed.includes(role));
            // Atributo hidden (semántico, autocontenido) + clase Tailwind por si hay estilos de display
            el.hidden = !visible;
            el.classList.toggle('hidden', !visible);
            el.classList.toggle('rbac-hidden', !visible);
            el.setAttribute('aria-hidden', visible ? 'false' : 'true');
            if (!visible) el.setAttribute('disabled', '');
            else el.removeAttribute('disabled');
        });
    }

    /* =========================================================
       3. ENMASCARAMIENTO DE DATOS SENSIBLES
       ========================================================= */

    /** Enmascara una cadena dejando visibles solo los últimos n caracteres. */
    function mask(value, visibleEnd = 4, maskChar = '•') {
        const str = String(value || '');
        if (str.length <= visibleEnd) return maskChar.repeat(str.length);
        return maskChar.repeat(str.length - visibleEnd) + str.slice(-visibleEnd);
    }

    /** Enmascara un teléfono: 7555-1234 -> ••••-1234 (conserva formato y últimos 4 dígitos) */
    function maskPhone(phone) {
        const str = String(phone || '');
        let digitsSeen = 0;
        return str.split('').reverse().map(ch => {
            if (/\d/.test(ch)) {
                digitsSeen++;
                return digitsSeen > 4 ? '•' : ch;
            }
            return ch;
        }).reverse().join('');
    }

    /** Enmascara un email: usuario@mail.com -> u••••o@mail.com */
    function maskEmail(email) {
        const [local, domain] = String(email || '').split('@');
        if (!domain) return mask(email, 2);
        if (local.length <= 2) return maskChar2(local) + '@' + domain;
        return local[0] + '•'.repeat(local.length - 2) + local[local.length - 1] + '@' + domain;
    }
    function maskChar2(s) { return '•'.repeat(Math.max(s.length, 1)); }

    /**
     * Convierte un elemento en un dato enmascarado con botón de revelado.
     * Solo usuarios con rol permitido pueden revelar.
     * Uso: maskElement(spanEl, telefono, 'phone', ['admin'])
     */
    function maskElement(el, rawValue, type = 'phone', allowedRoles = ['admin']) {
        if (!el || rawValue === null || rawValue === undefined) return;
        const maskers = { phone: maskPhone, email: maskEmail, generic: v => mask(v) };
        const masked = (maskers[type] || maskers.generic)(rawValue);
        const canReveal = allowedRoles.includes(getUserRole());

        el.classList.add('masked-data');
        el.dataset.masked = masked;
        el.dataset.revealed = 'false';
        el.textContent = masked;

        if (canReveal) {
            el.setAttribute('role', 'button');
            el.setAttribute('tabindex', '0');
            el.title = 'Clic para mostrar/ocultar';
            const REVEAL_CLASSES = ['font-semibold', 'text-verde-quirurgico', 'dark:text-verde-quirurgico-vibrant'];
            const toggle = () => {
                const revealed = el.dataset.revealed === 'true';
                el.textContent = revealed ? el.dataset.masked : String(rawValue);
                el.dataset.revealed = revealed ? 'false' : 'true';
                el.classList.toggle('is-revealed', !revealed);
                el.classList.toggle('opacity-80', revealed);
                REVEAL_CLASSES.forEach(c => el.classList.toggle(c, !revealed));
            };
            el.addEventListener('click', toggle);
            el.addEventListener('keydown', e => {
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
            });
        }
    }

    /* =========================================================
       4. GUARDIA DE SESIÓN POR INACTIVIDAD
       ========================================================= */

    let idleTimer = null;
    let warnTimer = null;
    let countdownInterval = null;

    /**
     * Vigila la inactividad del usuario. Muestra una advertencia visual con
     * cuenta regresiva antes de cerrar la sesión automáticamente.
     * @param {Object} opts
     *   - idleMinutes: minutos de inactividad antes de advertir (def. 15)
     *   - warnSeconds: segundos de cuenta regresiva antes del cierre (def. 60)
     *   - onLogout: callback de cierre de sesión
     */
    function initSessionGuard(opts = {}) {
        const idleMinutes = opts.idleMinutes || 15;
        const warnSeconds = opts.warnSeconds || 60;
        const onLogout = opts.onLogout || defaultLogout;
        const idleMs = idleMinutes * 60 * 1000;

        const resetTimers = () => {
            clearTimeout(idleTimer);
            clearTimeout(warnTimer);
            clearInterval(countdownInterval);
            hideWarningModal();
            idleTimer = setTimeout(showWarning, idleMs);
        };

        const showWarning = () => {
            showWarningModal(warnSeconds, () => {
                clearInterval(countdownInterval);
                onLogout('inactividad');
            });
            // Cualquier actividad durante la advertencia renueva la sesión
            warnTimer = setTimeout(() => { /* la cuenta regresiva gobierna */ }, warnSeconds * 1000);
        };

        // Eventos que cuentan como actividad (con throttle para rendimiento)
        let lastReset = 0;
        const activityHandler = () => {
            const now = Date.now();
            if (now - lastReset < 1000) return; // máx. 1 reinicio/segundo
            lastReset = now;
            // Si la advertencia está visible, solo el botón "Seguir aquí" renueva
            if (!document.getElementById('session-warning-modal')) resetTimers();
        };

        ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart'].forEach(evt =>
            window.addEventListener(evt, activityHandler, { passive: true })
        );

        // Exponer renovación manual para el botón del modal
        window.__martexRenewSession = resetTimers;
        resetTimers();
    }

    function defaultLogout(reason) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        sessionStorage.setItem('logout_reason', reason || 'manual');
        window.location.href = 'login.html';
    }

    function showWarningModal(seconds, onExpire) {
        if (document.getElementById('session-warning-modal')) return;

        const overlay = document.createElement('div');
        overlay.id = 'session-warning-modal';
        // Overlay con clases Tailwind (autocontenido, soporta dark:)
        overlay.className = 'fixed inset-0 z-[100] flex items-center justify-center bg-azul-marino/60 p-4 opacity-0 backdrop-blur-sm transition-opacity duration-200';
        overlay.setAttribute('role', 'alertdialog');
        overlay.setAttribute('aria-modal', 'true');
        overlay.setAttribute('aria-labelledby', 'session-warning-title');
        overlay.innerHTML = `
            <div class="w-full max-w-sm rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-2xl transition-all duration-200 dark:border-white/10 dark:bg-azul-marino">
                <div class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-500 dark:bg-amber-400/10 dark:text-amber-400">
                    ${CLOCK_ICON_SVG}
                </div>
                <h2 id="session-warning-title" class="mb-2 text-lg font-bold text-azul-pantera dark:text-white">Tu sesión está por expirar</h2>
                <p class="mb-6 text-sm text-gray-500 dark:text-gray-400">Por seguridad, la sesión se cerrará automáticamente en
                   <strong id="session-countdown" class="font-bold text-red-500 dark:text-red-400">${seconds}</strong> segundos por inactividad.</p>
                <div class="flex flex-col gap-3">
                    <button type="button" id="session-stay-btn" class="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-verde-quirurgico to-verde-quirurgico-vibrant px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-verde-quirurgico/25 transition-all hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0">
                        ${REFRESH_ICON_SVG} Seguir aquí
                    </button>
                    <button type="button" id="session-logout-btn" class="text-xs font-medium text-gray-400 transition-colors hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400">
                        Cerrar sesión ahora
                    </button>
                </div>
            </div>`;
        document.body.appendChild(overlay);
        requestAnimationFrame(() => overlay.classList.remove('opacity-0'));

        let remaining = seconds;
        const countdownEl = overlay.querySelector('#session-countdown');
        clearInterval(countdownInterval);
        countdownInterval = setInterval(() => {
            remaining--;
            if (countdownEl) countdownEl.textContent = remaining;
            if (remaining <= 0) {
                clearInterval(countdownInterval);
                onExpire();
            }
        }, 1000);

        overlay.querySelector('#session-stay-btn').addEventListener('click', () => {
            if (typeof window.__martexRenewSession === 'function') window.__martexRenewSession();
        });
        overlay.querySelector('#session-logout-btn').addEventListener('click', () => {
            clearInterval(countdownInterval);
            defaultLogout('manual');
        });
    }

    function hideWarningModal() {
        const modal = document.getElementById('session-warning-modal');
        if (modal) {
            modal.classList.add('opacity-0');
            setTimeout(() => modal.remove(), 250);
        }
    }

    /* =========================================================
       5. BOTÓN DE VISIBILIDAD DE CONTRASEÑA (helper)
       ========================================================= */

    /**
     * Conecta un botón ojo con su campo de contraseña.
     * @param {string} inputId - id del input password
     * @param {string} iconId - id del <i> dentro del botón
     */
    function attachPasswordToggle(inputId, iconId) {
        const input = document.getElementById(inputId);
        const icon = document.getElementById(iconId);
        if (!input || !icon) return;
        const btn = icon.closest('button');
        const toggle = () => {
            const show = input.type === 'password';
            input.type = show ? 'text' : 'password';
            icon.className = show ? 'fas fa-eye-slash text-sm' : 'fas fa-eye text-sm';
            if (btn) btn.setAttribute('aria-label', show ? 'Ocultar contraseña' : 'Mostrar contraseña');
            if (btn) btn.setAttribute('aria-pressed', show ? 'true' : 'false');
        };
        if (btn) btn.addEventListener('click', toggle);
    }

    /* ---- API pública ---- */
    window.MartexUI = {
        validators,
        setFieldState,
        attachValidation,
        validateForm,
        getUserRole,
        applyRoleVisibility,
        mask,
        maskPhone,
        maskEmail,
        maskElement,
        initSessionGuard,
        attachPasswordToggle,
        logout: defaultLogout
    };

    // Aplicar RBAC automáticamente al cargar el DOM en las vistas del sistema
    document.addEventListener('DOMContentLoaded', () => applyRoleVisibility());
})();
