import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { AdminApi } from '../../core/admin-api.service';
import { Order, StoreSettings } from '../../core/models';

type Format = 'ticket' | 'a4';

/**
 * Comprobante imprimible (boleta/factura) en dos formatos:
 *  - Ticket 80mm (estilo SophiTech, para impresora térmica de mostrador)
 *  - A4 (documento formal, se guarda como PDF desde el diálogo de impresión)
 * Toma los datos del negocio de la configuración (logo, RUC, dirección) y del pedido.
 */
@Component({
  selector: 'ax-comprobante',
  imports: [DecimalPipe, DatePipe, RouterLink],
  templateUrl: './comprobante.html',
  styleUrl: './comprobante.scss',
})
export class Comprobante {
  private api = inject(AdminApi);
  private route = inject(ActivatedRoute);

  readonly order = signal<Order | null>(null);
  readonly store = signal<StoreSettings | null>(null);
  readonly loading = signal(true);
  readonly format = signal<Format>('ticket');

  readonly isFactura = computed(() => this.order()?.requestedDocument === 'Factura');
  readonly docTitle = computed(() =>
    this.isFactura() ? 'FACTURA ELECTRÓNICA' : 'BOLETA DE VENTA ELECTRÓNICA',
  );
  /** Número fiscal del comprobante, o PROFORMA si aún no se ha emitido (pedido no pagado). */
  readonly docNumber = computed(() => this.order()?.invoice?.fullNumber ?? null);
  readonly isFiscal = computed(() => !!this.order()?.invoice);

  // Desagregado tributario consistente con el backend (precios incluyen IGV).
  readonly igvPercent = computed(() => Math.round((this.store()?.igvRate ?? 0.18) * 100));
  readonly igvAmount = computed(() => this.order()?.taxAmount ?? 0);
  readonly taxable = computed(() => (this.order()?.total ?? 0) - this.igvAmount());

  orderNumber = '';

  constructor() {
    this.orderNumber = this.route.snapshot.paramMap.get('orderNumber')!;
    const fmt = this.route.snapshot.queryParamMap.get('fmt');
    if (fmt === 'a4' || fmt === 'ticket') this.format.set(fmt);
    forkJoin({ order: this.api.order(this.orderNumber), store: this.api.storeInfo() }).subscribe({
      next: ({ order, store }) => { this.order.set(order); this.store.set(store); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  docType(t: string): string {
    return { Dni: 'DNI', Ruc: 'RUC', CarnetExtranjeria: 'C.E.', Passport: 'Pasaporte' }[t] ?? t;
  }
  payLabel(m: string): string {
    return { Stripe: 'Tarjeta', BankTransfer: 'Transferencia', CashOnDelivery: 'Contra entrega', None: '—' }[m] ?? m;
  }

  /** Inyecta el CSS de impresión (tamaño de papel + ocultar el panel admin) y lanza el diálogo. */
  print(fmt: Format) {
    this.format.set(fmt);
    const page = fmt === 'ticket'
      ? '@page { size: 80mm auto; margin: 0; }'
      : '@page { size: A4; margin: 12mm; }';
    const css = `
      ${page}
      @media print {
        body * { visibility: hidden !important; }
        .ax-print-area, .ax-print-area * { visibility: visible !important; }
        .ax-print-area { position: absolute; left: 0; top: 0; width: 100%; margin: 0; box-shadow: none; }
        .no-print { display: none !important; }
      }`;
    let el = document.getElementById('ax-print-style') as HTMLStyleElement | null;
    if (!el) { el = document.createElement('style'); el.id = 'ax-print-style'; document.head.appendChild(el); }
    el.textContent = css;
    setTimeout(() => window.print(), 60);
  }
}
