import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, catchError, firstValueFrom, of, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  AuthResponse, AuthUser, RegisterPayload, TwoFactorEnableResult, TwoFactorSetup, UserProfile,
} from './models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/auth`;
  private opts = { withCredentials: true as const };

  /** Access token SOLO en memoria (nunca en localStorage). */
  private accessTokenSig = signal<string | null>(null);
  readonly user = signal<AuthUser | null>(null);
  readonly isAuthenticated = computed(() => !!this.accessTokenSig());

  accessToken(): string | null {
    return this.accessTokenSig();
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.base}/login`, { email, password }, this.opts)
      .pipe(tap((r) => this.maybeSetSession(r)));
  }

  register(payload: RegisterPayload): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.base}/register`, payload, this.opts)
      .pipe(tap((r) => this.maybeSetSession(r)));
  }

  /** Inicia sesión con el ID token de Google. */
  googleLogin(idToken: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.base}/google`, { idToken }, this.opts)
      .pipe(tap((r) => this.maybeSetSession(r)));
  }

  /** Completa el login tras ingresar el código 2FA. */
  verifyTwoFactor(twoFactorToken: string, code: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.base}/2fa/verify`, { twoFactorToken, code }, this.opts)
      .pipe(tap((r) => this.maybeSetSession(r)));
  }

  // ---- Gestión de 2FA (usuario autenticado) ----
  setupTwoFactor(): Observable<TwoFactorSetup> {
    return this.http.post<TwoFactorSetup>(`${this.base}/2fa/setup`, {});
  }

  enableTwoFactor(code: string): Observable<TwoFactorEnableResult> {
    return this.http.post<TwoFactorEnableResult>(`${this.base}/2fa/enable`, { code });
  }

  disableTwoFactor(code: string): Observable<unknown> {
    return this.http.post(`${this.base}/2fa/disable`, { code });
  }

  private maybeSetSession(r: AuthResponse) {
    if (!r.requiresTwoFactor && r.accessToken) this.setSession(r);
  }

  /** Renueva el access token usando la cookie HttpOnly (sin body). */
  refresh(): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.base}/refresh`, {}, this.opts)
      .pipe(tap((r) => this.setSession(r)));
  }

  me(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.base}/me`);
  }

  logout(): Observable<unknown> {
    return this.http.post(`${this.base}/logout`, {}, this.opts).pipe(
      tap(() => this.clearSession()),
      catchError(() => {
        this.clearSession();
        return of(null);
      }),
    );
  }

  /** Intento silencioso de restaurar sesión al cargar la app (APP_INITIALIZER). */
  async restoreSession(): Promise<void> {
    // Solo intentamos restaurar si el usuario ya había iniciado sesión antes
    // (evita un 401 innecesario en consola para visitantes anónimos).
    if (typeof localStorage !== 'undefined' && localStorage.getItem('ax_session') !== '1') return;
    try {
      await firstValueFrom(this.refresh());
    } catch {
      this.clearSession();
    }
  }

  private setSession(r: AuthResponse) {
    this.accessTokenSig.set(r.accessToken);
    this.user.set({ userId: r.userId, email: r.email, fullName: r.fullName, role: r.role });
    try { localStorage.setItem('ax_session', '1'); } catch {}
  }

  clearSession() {
    this.accessTokenSig.set(null);
    this.user.set(null);
    try { localStorage.removeItem('ax_session'); } catch {}
  }
}
