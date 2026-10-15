import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, firstValueFrom, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthResponse, AuthUser, TwoFactorEnableResult, TwoFactorSetup, UserProfile } from './models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/auth`;
  private opts = { withCredentials: true as const };

  private accessTokenSig = signal<string | null>(null);
  readonly user = signal<AuthUser | null>(null);
  readonly twoFactorEnabled = signal(false);

  readonly isAuthenticated = computed(() => !!this.accessTokenSig());
  readonly role = computed(() => this.user()?.role ?? null);
  readonly isStaff = computed(() => ['Admin', 'Staff'].includes(this.role() ?? ''));
  readonly isAdmin = computed(() => this.role() === 'Admin');

  accessToken() { return this.accessTokenSig(); }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.base}/login`, { email, password }, this.opts)
      .pipe(tap((r) => { if (!r.requiresTwoFactor && r.accessToken) this.setToken(r); }));
  }

  verifyTwoFactor(twoFactorToken: string, code: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.base}/2fa/verify`, { twoFactorToken, code }, this.opts)
      .pipe(tap((r) => this.setToken(r)));
  }

  googleLogin(idToken: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.base}/google`, { idToken }, this.opts)
      .pipe(tap((r) => this.setToken(r)));
  }

  refresh(): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.base}/refresh`, {}, this.opts)
      .pipe(tap((r) => this.setToken(r)));
  }

  me(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.base}/me`)
      .pipe(tap((p) => this.twoFactorEnabled.set(p.twoFactorEnabled)));
  }

  logout(): Observable<unknown> {
    return this.http.post(`${this.base}/logout`, {}, this.opts).pipe(tap(() => this.clear()));
  }

  setupTwoFactor(): Observable<TwoFactorSetup> {
    return this.http.post<TwoFactorSetup>(`${this.base}/2fa/setup`, {});
  }
  enableTwoFactor(code: string): Observable<TwoFactorEnableResult> {
    return this.http.post<TwoFactorEnableResult>(`${this.base}/2fa/enable`, { code });
  }

  /** Carga el perfil (incluye twoFactorEnabled). */
  loadProfile(): Promise<void> {
    return firstValueFrom(this.me()).then(() => undefined).catch(() => undefined);
  }

  async restoreSession(): Promise<void> {
    if (typeof localStorage !== 'undefined' && localStorage.getItem('ax_session') !== '1') return;
    try {
      await firstValueFrom(this.refresh());
      await this.loadProfile();
    } catch {
      this.clear();
    }
  }

  private setToken(r: AuthResponse) {
    this.accessTokenSig.set(r.accessToken);
    this.user.set({ userId: r.userId, email: r.email, fullName: r.fullName, role: r.role });
    try { localStorage.setItem('ax_session', '1'); } catch {}
  }

  clear() {
    this.accessTokenSig.set(null);
    this.user.set(null);
    this.twoFactorEnabled.set(false);
    try { localStorage.removeItem('ax_session'); } catch {}
  }
}
