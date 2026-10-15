export const environment = {
  production: false,
  apiUrl: 'http://localhost:5080/api',
  // Pega aquí tu Client ID de Google OAuth. Vacío = botón oculto.
  googleClientId: '121610698477-mi3nkv25e3m5ea04jf44igfrp5dhei2c.apps.googleusercontent.com',
  // 2FA obligatorio para Admin/Vendedor. Ponlo en true para producción
  // (cumplimiento Ley N° 29733). En false permite entrar con solo correo+contraseña (demo).
  enforce2fa: false,
};
