import { Component, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { OrderService } from '../../core/order.service';
import { OrderSummary, UserProfile } from '../../core/models';
import { TwoFactor } from '../../shared/two-factor/two-factor';

@Component({
  selector: 'ax-account',
  imports: [DecimalPipe, DatePipe, RouterLink, TwoFactor],
  templateUrl: './account.html',
  styleUrl: './account.scss',
})
export class Account {
  private auth = inject(AuthService);
  private orders = inject(OrderService);
  private router = inject(Router);

  readonly user = this.auth.user;
  readonly profile = signal<UserProfile | null>(null);
  readonly myOrders = signal<OrderSummary[]>([]);
  readonly loadingOrders = signal(true);
  readonly section = signal<'orders' | 'profile' | 'security'>('orders');

  constructor() {
    this.loadProfile();
    this.orders.getMine().subscribe({
      next: (o) => {
        this.myOrders.set(o);
        this.loadingOrders.set(false);
      },
      error: () => this.loadingOrders.set(false),
    });
  }

  loadProfile() {
    this.auth.me().subscribe({ next: (p) => this.profile.set(p), error: () => {} });
  }

  statusLabel(s: string): string {
    const map: Record<string, string> = {
      Pending: 'Pendiente', Paid: 'Pagado', Processing: 'Preparando',
      Shipped: 'Enviado', Delivered: 'Entregado', Cancelled: 'Cancelado',
    };
    return map[s] ?? s;
  }

  logout() {
    this.auth.logout().subscribe(() => this.router.navigateByUrl('/'));
  }
}
