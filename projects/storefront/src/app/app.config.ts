import { ApplicationConfig, provideAppInitializer, provideBrowserGlobalErrorListeners, inject } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { authInterceptor } from './core/auth.interceptor';
import { AuthService } from './core/auth.service';
import { SettingsService } from './core/settings.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withInMemoryScrolling({ scrollPositionRestoration: 'top', anchorScrolling: 'enabled' })),
    provideHttpClient(withFetch(), withInterceptors([authInterceptor])),
    // Restaura la sesión en silencio (cookie HttpOnly) antes de mostrar la app.
    provideAppInitializer(() => inject(AuthService).restoreSession()),
    // Carga las reglas de negocio (envío, IGV, pagos) una sola vez al arrancar.
    provideAppInitializer(() => inject(SettingsService).load()),
  ],
};
