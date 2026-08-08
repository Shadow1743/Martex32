const nodemailer = require('nodemailer');
const pool = require('../config/db');
require('dotenv').config();

// Crear transporter solo si hay configuración SMTP
let transporter = null;

function getTransporter() {
    if (transporter) return transporter;
    
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
        transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT) || 587,
            secure: parseInt(process.env.SMTP_PORT) === 465,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });
        console.log('📧 Servicio de email configurado correctamente');
        return transporter;
    }
    
    return null;
}

// Registrar notificación en la base de datos
async function registrarNotificacion(email, tipo, asunto, contenido, enviado = false, error = null) {
    try {
        await pool.query(
            'INSERT INTO notificaciones_email (destinatario_email, tipo, asunto, contenido, enviado, error) VALUES ($1, $2, $3, $4, $5, $6)',
            [email, tipo, asunto, contenido, enviado, error]
        );
    } catch (e) {
        console.error('Error registrando notificación:', e.message);
    }
}

// Enviar email con fallback silencioso
async function enviarEmail(to, subject, html, tipo) {
    const transport = getTransporter();
    
    if (!transport) {
        console.log(`📧 Email no enviado (SMTP no configurado): [${tipo}] ${subject} → ${to}`);
        await registrarNotificacion(to, tipo, subject, html, false, 'SMTP no configurado');
        return false;
    }

    try {
        await transport.sendMail({
            from: process.env.SMTP_FROM || '"Martex" <no-reply@martex.com>',
            to,
            subject,
            html
        });
        
        await registrarNotificacion(to, tipo, subject, html, true);
        console.log(`📧 Email enviado: [${tipo}] → ${to}`);
        return true;
    } catch (error) {
        console.error(`📧 Error enviando email [${tipo}]:`, error.message);
        await registrarNotificacion(to, tipo, subject, html, false, error.message);
        return false;
    }
}

// =============================================
// Templates de Email
// =============================================

const baseTemplate = (content) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, sans-serif; background-color: #f4f7fc; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
        .header { background: linear-gradient(135deg, #0A1128, #1B1464); padding: 32px; text-align: center; }
        .header h1 { color: #ffffff; font-size: 28px; margin: 0; letter-spacing: 2px; }
        .header .accent { color: #00B391; }
        .content { padding: 32px; color: #333; line-height: 1.6; }
        .content h2 { color: #0A1128; font-size: 22px; margin-top: 0; }
        .btn { display: inline-block; background: #008080; color: #ffffff !important; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; margin: 16px 0; }
        .footer { padding: 24px 32px; text-align: center; color: #999; font-size: 12px; border-top: 1px solid #eee; }
        .badge { display: inline-block; padding: 6px 16px; border-radius: 20px; font-size: 14px; font-weight: 600; }
        .badge-nuevo { background: #e0f2fe; color: #0284c7; }
        .badge-procesando { background: #fef3c7; color: #d97706; }
        .badge-enviado { background: #d1fae5; color: #059669; }
        .badge-entregado { background: #dcfce7; color: #16a34a; }
        .badge-cancelado { background: #fee2e2; color: #dc2626; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>MAR<span class="accent">TEX</span></h1>
        </div>
        ${content}
        <div class="footer">
            <p>Martex — Uniformes Profesionales Premium</p>
            <p>Col. Los Santos, C. Grimaldi Final, Usulután, El Salvador</p>
            <p>+503 6049-7383</p>
        </div>
    </div>
</body>
</html>
`;

// Email de bienvenida
exports.enviarBienvenida = async (cliente) => {
    const html = baseTemplate(`
        <div class="content">
            <h2>¡Bienvenido a Martex, ${cliente.nombre}! 🎉</h2>
            <p>Tu cuenta ha sido creada exitosamente. Ahora puedes:</p>
            <ul>
                <li>📦 Realizar seguimiento de tus pedidos</li>
                <li>❤️ Guardar tus productos favoritos</li>
                <li>📏 Guardar tus medidas para futuros pedidos</li>
                <li>⭐ Dejar reseñas de los productos que compres</li>
            </ul>
            <p>Gracias por confiar en nosotros para tus uniformes profesionales.</p>
            <p style="margin-top: 24px;">— El equipo de Martex</p>
        </div>
    `);

    return enviarEmail(cliente.email, '¡Bienvenido a Martex! 🩺', html, 'bienvenida');
};

// Email de confirmación de pedido
exports.enviarConfirmacionPedido = async (pedido, email) => {
    if (!email) return false;

    const html = baseTemplate(`
        <div class="content">
            <h2>¡Pedido Confirmado! 📦</h2>
            <p>Hemos recibido tu pedido <strong>#ORD-${String(pedido.id).padStart(3, '0')}</strong> correctamente.</p>
            <div style="background: #f8fafc; padding: 20px; border-radius: 12px; margin: 16px 0;">
                <p style="margin: 4px 0;"><strong>Total:</strong> $${parseFloat(pedido.total).toFixed(2)}</p>
                <p style="margin: 4px 0;"><strong>Método de pago:</strong> ${pedido.metodo_pago}</p>
                <p style="margin: 4px 0;"><strong>Estado:</strong> <span class="badge badge-nuevo">Nuevo</span></p>
            </div>
            <p>Te notificaremos cuando tu pedido cambie de estado.</p>
            <p style="margin-top: 24px;">— El equipo de Martex</p>
        </div>
    `);

    return enviarEmail(email, `Pedido #ORD-${String(pedido.id).padStart(3, '0')} Confirmado ✅`, html, 'confirmacion_pedido');
};

// Email de cambio de estado
exports.enviarCambioEstado = async (pedido, estadoAnterior, nuevoEstado, email) => {
    if (!email) return false;

    const badgeClass = {
        'Nuevo': 'badge-nuevo',
        'Procesando': 'badge-procesando',
        'Enviado': 'badge-enviado',
        'Entregado': 'badge-entregado',
        'Cancelado': 'badge-cancelado'
    };

    const mensajes = {
        'Procesando': '¡Tu pedido está siendo preparado! Nuestro equipo ya está trabajando en él.',
        'Enviado': '¡Tu pedido va en camino! Pronto lo recibirás.',
        'Entregado': '¡Tu pedido ha sido entregado! Esperamos que disfrutes tus productos. No olvides dejarnos una reseña ⭐',
        'Cancelado': 'Tu pedido ha sido cancelado. Si tienes alguna duda, contáctanos.'
    };

    const html = baseTemplate(`
        <div class="content">
            <h2>Actualización de tu Pedido 📋</h2>
            <p>Tu pedido <strong>#ORD-${String(pedido.id).padStart(3, '0')}</strong> ha cambiado de estado:</p>
            <div style="text-align: center; margin: 24px 0;">
                <span class="badge ${badgeClass[estadoAnterior] || 'badge-nuevo'}">${estadoAnterior}</span>
                <span style="margin: 0 12px; color: #999;">→</span>
                <span class="badge ${badgeClass[nuevoEstado] || 'badge-nuevo'}">${nuevoEstado}</span>
            </div>
            <p>${mensajes[nuevoEstado] || 'El estado de tu pedido ha sido actualizado.'}</p>
            <p style="margin-top: 24px;">— El equipo de Martex</p>
        </div>
    `);

    return enviarEmail(email, `Pedido #ORD-${String(pedido.id).padStart(3, '0')} — ${nuevoEstado}`, html, 'cambio_estado');
};
