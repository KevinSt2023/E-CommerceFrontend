export const environment = {
  production: false,
  apiUrl: 'http://localhost:5080/api',
  // Pon en true cuando configures las claves de Stripe (sandbox/producción).
  // Con false, el checkout con "Tarjeta" registra el pedido (pendiente) y va a la confirmación.
  stripeEnabled: false,
  // Pega aquí tu Client ID de Google OAuth (xxxxx.apps.googleusercontent.com).
  // Mientras esté vacío, el botón "Continuar con Google" no se muestra.
  googleClientId: '121610698477-mi3nkv25e3m5ea04jf44igfrp5dhei2c.apps.googleusercontent.com',
};
