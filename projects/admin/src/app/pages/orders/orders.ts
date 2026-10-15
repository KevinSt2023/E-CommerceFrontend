import { Component, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AdminApi } from '../../core/admin-api.service';
import { OrderSummary } from '../../core/models';

@Component({
  selector: 'ax-orders',
  imports: [DecimalPipe, DatePipe, FormsModule, RouterLink],
  templateUrl: './orders.html',
  styleUrl: './orders.scss',
})
export class Orders {
  private api = inject(AdminApi);
  readonly orders = signal<OrderSummary[]>([]);
  readonly total = signal(0);
  readonly loading = signal(true);
  readonly page = signal(1);
  readonly pageSize = 15;

  search = '';
  status = '';
  readonly statuses = ['', 'Pending', 'Paid', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

  constructor() { this.load(); }

  load() {
    this.loading.set(true);
    this.api.orders({ status: this.status, search: this.search, page: this.page(), pageSize: this.pageSize })
      .subscribe({
        next: (r) => { this.orders.set(r.items); this.total.set(r.totalCount); this.loading.set(false); },
        error: () => this.loading.set(false),
      });
  }

  applyFilters() { this.page.set(1); this.load(); }
  setStatus(s: string) { this.status = s; this.applyFilters(); }
  get totalPages() { return Math.max(1, Math.ceil(this.total() / this.pageSize)); }
  goPage(p: number) { if (p >= 1 && p <= this.totalPages) { this.page.set(p); this.load(); } }

  statusClass(s: string): string {
    return { Paid: 'badge-green', Delivered: 'badge-green', Shipped: 'badge-blue', Processing: 'badge-blue',
      Pending: 'badge-amber', Cancelled: 'badge-red', Refunded: 'badge-gray' }[s] ?? 'badge-gray';
  }
  statusLabel(s: string): string {
    return { '': 'Todos', Pending: 'Pendiente', Paid: 'Pagado', Processing: 'Preparando', Shipped: 'Enviado',
      Delivered: 'Entregado', Cancelled: 'Cancelado', Refunded: 'Reembolsado' }[s] ?? s;
  }
}
