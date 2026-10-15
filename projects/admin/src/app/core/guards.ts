import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

/** Requiere sesión y rol Admin/Staff para entrar al panel. */
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.isAuthenticated() && auth.isStaff()) return true;
  return router.createUrlTree(['/login']);
};

/** 2FA obligatorio para Admin/Vendedor: fuerza la configuración si no lo tienen. */
export const twoFactorGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!environment.enforce2fa) return true; // demo: no se exige 2FA
  if (auth.isStaff() && !auth.twoFactorEnabled()) return router.createUrlTree(['/activar-2fa']);
  return true;
};

/** Solo administradores (gestión de usuarios, configuración). */
export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.isAdmin()) return true;
  return router.createUrlTree(['/']);
};
