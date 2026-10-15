import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AdminApi } from '../../core/admin-api.service';
import { Order } from '../../core/models';

@Component({
  selector: 'ax-order-detail',
  imports: [DecimalPipe, DatePipe, FormsModule, RouterLink],
  templateUrl: './order-detail.html',
  styleUrl: './order-detail.scss',
})
export class OrderDetail {
  private api = inject(AdminApi);
  private route = inject(ActivatedRoute);

  readonly order = signal<Order | null>(null);
  readonly loading = signal(true);
  readonly busy = signal(false);
  readonly msg = signal<string | null>(null);

  private orderNumber = '';
  payMethod = 'Stripe';
  cancelReason = '';

  readonly canConfirmPay = computed(() => {
    const o = this.order();
    return o && o.paymentStatus !== 'Paid' && o.status !== 'Cancelled';
  });
  readonly canAdvance = computed(() => {
    const o = this.order();
    return o && o.paymentStatus === 'Paid' && !['Delivered', 'Cancelled', 'Refunded'].includes(o.status);
  });
  readonly canCancel = computed(() => {
    const o = this.order();
    return o && o.status === 'Pending';
  });

  constructor() {
    this.orderNumber = this.route.snapshot.paramMap.get('orderNumber')!;
    this.load();
  }

  private load() {
    this.loading.set(true);
    this.api.order(this.orderNumber).subscribe({
      next: (o) => { this.order.set(o); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  private run(obs: any, okMsg: string) {
    this.busy.set(true); this.msg.set(null);
    obs.subscribe({
      next: (o: Order) => { this.order.set(o); this.busy.set(false); this.msg.set(okMsg); },
      error: (e: any) => { this.busy.set(false); this.msg.set(e?.error?.detail ?? 'Error al procesar.'); },
    });
  }

  confirmPay() { this.run(this.api.confirmPayment(this.orderNumber, this.payMethod), 'Pago confirmado. Stock descontado y comprobante generado.'); }
  advance(status: string) { this.run(this.api.updateOrderStatus(this.orderNumber, status), 'Estado actualizado a ' + this.statusLabel(status) + '.'); }
  cancel() { this.run(this.api.cancelOrder(this.orderNumber, this.cancelReason), 'Pedido cancelado. Stock liberado.'); }

  statusClass(s: string): string {
    return { Paid: 'badge-green', Delivered: 'badge-green', Shipped: 'badge-blue', Processing: 'badge-blue',
      Pending: 'badge-amber', Cancelled: 'badge-red', Refunded: 'badge-gray' }[s] ?? 'badge-gray';
  }
  statusLabel(s: string): string {
    return { Pending: 'Pendiente', Paid: 'Pagado', Processing: 'Preparando', Shipped: 'Enviado',
      Delivered: 'Entregado', Cancelled: 'Cancelado', Refunded: 'Reembolsado' }[s] ?? s;
  }
}
