const twilio = require('twilio');

// Asegúrate de que estas variables estén en tu .env
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

/**
 * Función principal: enviarAlertaStock
 * El nombre DEBE ser este para que el controlador lo encuentre
 */
const enviarAlertaStock = async (nombreProducto, stockRestante) => {
    try {
        // Solo intentará enviar si tienes las credenciales configuradas
        await client.messages.create({
            body: `⚠️ GomezStylo Alerta: El stock de "${nombreProducto}" está bajo (${stockRestante} unidades). Favor de reabastecer inventario.`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: '+522711944184' // Tu número real
        });
        console.log(`✅ SMS enviado para el producto: ${nombreProducto}`);
    } catch (error) {
        // Si Twilio falla (por falta de saldo o error de red), 
        // imprimimos el aviso en consola para que la compra NO se detenga.
        console.log(`📡 [AVISO] El stock de ${nombreProducto} es bajo (${stockRestante}), pero el SMS no se envió (revisa saldo Twilio).`);
    }
};

// Exportamos el nombre exacto que busca el controlador
module.exports = { enviarAlertaStock };