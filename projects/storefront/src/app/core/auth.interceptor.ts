import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

const AUTH_ENDPOINTS = ['/auth/login', '/auth/register', '/auth/refresh', '/auth/logout', '/auth/2fa/verify'];

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const isApi = req.url.startsWith(environment.apiUrl);
  const isAuthEndpoint = AUTH_ENDPOINTS.some((e) => req.url.includes(e));

  let request = req;
  const token = auth.accessToken();
  if (isApi && token && !isAuthEndpoint) {
    request = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }

  return next(request).pipe(
    catchError((err) => {
      const canRetry = err.status === 401 && isApi && !isAuthEndpoint && !req.headers.has('X-Retry');
      if (!canRetry) return throwError(() => err);

      // Access token expirado: intentamos renovarlo con la cookie y reintentamos una vez.
      return auth.refresh().pipe(
        switchMap(() => {
          const retried = req.clone({
            setHeaders: { Authorization: `Bearer ${auth.accessToken()}`, 'X-Retry': '1' },
          });
          return next(retried);
        }),
        catchError((refreshErr) => {
          auth.clearSession();
          return throwError(() => refreshErr);
        }),
      );
    }),
  );
};
