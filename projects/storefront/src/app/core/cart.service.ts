import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { Cart } from './models';

const TOKEN_KEY = 'altexa_cart_token';

@Injectable({ providedIn: 'root' })
export class CartService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/cart`;

  /** Estado reactivo del carrito. */
  readonly cart = signal<Cart | null>(null);
  readonly itemCount = computed(() => this.cart()?.itemCount ?? 0);
  readonly total = computed(() => this.cart()?.total ?? 0);

  private get token(): string {
    if (typeof localStorage === 'undefined') return '';
    const existing = localStorage.getItem(TOKEN_KEY);
    if (existing) return existing;
    const generated: string =
      (crypto as any)?.randomUUID?.() ?? `g-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem(TOKEN_KEY, generated);
    return generated;
  }

  private get headers(): HttpHeaders {
    return new HttpHeaders({ 'X-Cart-Token': this.token });
  }

  /** Token del carrito (para que otros servicios, p. ej. pedidos, lo reenvíen). */
  cartToken(): string {
    return this.token;
  }

  load() {
    this.http.get<Cart>(this.base, { headers: this.headers }).subscribe({
      next: (c) => this.cart.set(c),
      error: () => this.cart.set(null),
    });
  }

  add(productId: string, quantity = 1) {
    return this.http
      .post<Cart>(`${this.base}/items`, { productId, quantity }, { headers: this.headers })
      .pipe(tap((c) => this.cart.set(c)));
  }

  updateQuantity(productId: string, quantity: number) {
    return this.http
      .put<Cart>(`${this.base}/items/${productId}`, { quantity }, { headers: this.headers })
      .pipe(tap((c) => this.cart.set(c)));
  }

  remove(productId: string) {
    return this.http
      .delete<Cart>(`${this.base}/items/${productId}`, { headers: this.headers })
      .pipe(tap((c) => this.cart.set(c)));
  }

  clear() {
    return this.http.delete<Cart>(this.base, { headers: this.headers }).pipe(tap((c) => this.cart.set(c)));
  }

  /** Fusiona el carrito de invitado en el del usuario tras iniciar sesión. */
  mergeGuestCart() {
    return this.http
      .post<Cart>(`${this.base}/merge`, {}, { headers: this.headers })
      .pipe(tap((c) => this.cart.set(c)));
  }
}
