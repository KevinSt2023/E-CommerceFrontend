import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, catchError, of, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { PublicSettings } from './models';

/** Valores por defecto (coinciden con el seed) por si la API no responde al arrancar. */
const DEFAULTS: PublicSettings = {
  storeName: 'ALTEXA',
  currency: 'PEN',
  igvRate: 0.18,
  freeShippingThreshold: 300,
  defaultShippingCost: 15,
  payCardEnabled: true,
  payTransferEnabled: true,
  payCashOnDeliveryEnabled: true,
};

/**
 * Fuente única de las reglas de negocio en la tienda: envío gratis, IGV, métodos de pago,
 * contacto. Se carga una sola vez al arrancar la app (APP_INITIALIZER) para que todo
 * (cabecera, carrito, checkout) calcule EXACTAMENTE lo mismo que el backend.
 */
@Injectable({ providedIn: 'root' })
export class SettingsService {
  private http = inject(HttpClient);
  private _settings = signal<PublicSettings>(DEFAULTS);

  readonly settings = this._settings.asReadonly();
  readonly freeShippingThreshold = computed(() => this._settings().freeShippingThreshold);
  readonly defaultShippingCost = computed(() => this._settings().defaultShippingCost);
  readonly igvPercent = computed(() => Math.round(this._settings().igvRate * 100));

  /** Costo de envío con la misma regla que usa el backend al crear el pedido. */
  shippingFor(subtotal: number): number {
    const s = this._settings();
    return subtotal > 0 && subtotal < s.freeShippingThreshold ? s.defaultShippingCost : 0;
  }

  load(): Observable<PublicSettings> {
    return this.http.get<PublicSettings>(`${environment.apiUrl}/settings`).pipe(
      tap((s) => this._settings.set({ ...DEFAULTS, ...s })),
      catchError(() => of(this._settings())),
    );
  }
}
