import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { OrderService } from '../../core/order.service';
import { SettingsService } from '../../core/settings.service';
import { OrderDto } from '../../core/models';

@Component({
  selector: 'ax-order-confirmation',
  imports: [DecimalPipe, DatePipe, RouterLink],
  templateUrl: './order-confirmation.html',
  styleUrl: './order-confirmation.scss',
})
export class OrderConfirmation {
  private route = inject(ActivatedRoute);
  private orders = inject(OrderService);
  readonly settings = inject(SettingsService);

  readonly order = signal<OrderDto | null>(null);
  readonly loading = signal(true);
  readonly notFound = signal(false);
  readonly confirmingPayment = signal(false);

  readonly igvPercent = this.settings.igvPercent;
  readonly igvAmount = computed(() => this.order()?.taxAmount ?? 0);
  readonly taxable = computed(() => (this.order()?.total ?? 0) - this.igvAmount());
  readonly isFactura = computed(() => this.order()?.requestedDocument === 'Factura');
  readonly docTitle = computed(() => (this.isFactura() ? 'FACTURA ELECTRÓNICA' : 'BOLETA DE VENTA ELECTRÓNICA'));

  private orderNumber = '';

  /** Imprime / guarda como PDF el comprobante (A4). Oculta el resto de la página. */
  printComprobante() {
    const css = `
      @page { size: A4; margin: 12mm; }
      @media print {
        body * { visibility: hidden !important; }
        .ax-print-area, .ax-print-area * { visibility: visible !important; }
        .ax-print-area { position: absolute; left: 0; top: 0; width: 100%; }
      }`;
    let el = document.getElementById('ax-print-style') as HTMLStyleElement | null;
    if (!el) { el = document.createElement('style'); el.id = 'ax-print-style'; document.head.appendChild(el); }
    el.textContent = css;
    setTimeout(() => window.print(), 60);
  }

  docType(t: string): string {
    return { Dni: 'DNI', Ruc: 'RUC', CarnetExtranjeria: 'C.E.', Passport: 'Pasaporte' }[t] ?? t;
  }

  constructor() {
    this.orderNumber = this.route.snapshot.paramMap.get('orderNumber')!;
    const redirectStatus = this.route.snapshot.queryParamMap.get('redirect_status');
    this.load(redirectStatus === 'succeeded');
  }

  private load(justPaid: boolean, attempt = 0) {
    this.orders.getByNumber(this.orderNumber).subscribe({
      next: (o) => {
        this.order.set(o);
        this.loading.set(false);
        // Tras volver de Stripe, el webhook puede tardar: reintentamos hasta ver 'Paid'.
        if (justPaid && o.paymentStatus !== 'Paid' && attempt < 8) {
          this.confirmingPayment.set(true);
          setTimeout(() => this.load(true, attempt + 1), 2000);
        } else {
          this.confirmingPayment.set(false);
        }
      },
      error: () => {
        this.notFound.set(true);
        this.loading.set(false);
      },
    });
  }

  statusLabel(s: string): string {
    const map: Record<string, string> = {
      Pending: 'Pendiente de pago', Paid: 'Pagado', Processing: 'En preparación',
      Shipped: 'Enviado', Delivered: 'Entregado', Cancelled: 'Cancelado',
    };
    return map[s] ?? s;
  }
}
