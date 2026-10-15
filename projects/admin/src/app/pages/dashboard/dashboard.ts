import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminApi } from '../../core/admin-api.service';
import { Dashboard as DashboardData } from '../../core/models';

@Component({
  selector: 'ax-dashboard',
  imports: [DecimalPipe, DatePipe, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  private api = inject(AdminApi);
  readonly data = signal<DashboardData | null>(null);
  readonly loading = signal(true);

  readonly maxSale = computed(() => Math.max(1, ...(this.data()?.salesLast7Days.map((s) => s.total) ?? [1])));

  constructor() {
    this.api.dashboard().subscribe({
      next: (d) => { this.data.set(d); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  statusClass(s: string): string {
    return { Paid: 'badge-green', Delivered: 'badge-green', Shipped: 'badge-blue', Processing: 'badge-blue',
      Pending: 'badge-amber', Cancelled: 'badge-red' }[s] ?? 'badge-gray';
  }
  statusLabel(s: string): string {
    return { Pending: 'Pendiente', Paid: 'Pagado', Processing: 'Preparando', Shipped: 'Enviado',
      Delivered: 'Entregado', Cancelled: 'Cancelado' }[s] ?? s;
  }
  barHeight(v: number): string {
    return Math.max(4, (v / this.maxSale()) * 100) + '%';
  }
}
