import { Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminApi } from '../../core/admin-api.service';
import { AuthService } from '../../core/auth.service';
import { UserListItem } from '../../core/models';

@Component({
  selector: 'ax-users',
  imports: [DatePipe, FormsModule],
  templateUrl: './users.html',
  styleUrl: './users.scss',
})
export class Users {
  private api = inject(AdminApi);
  private auth = inject(AuthService);

  readonly users = signal<UserListItem[]>([]);
  readonly total = signal(0);
  readonly loading = signal(true);
  readonly page = signal(1);
  readonly msg = signal<string | null>(null);
  readonly pageSize = 15;

  search = '';
  roleFilter = '';
  readonly roles = ['Customer', 'Staff', 'Admin'];
  readonly myId = this.auth.user()?.userId;

  constructor() { this.load(); }

  load() {
    this.loading.set(true);
    this.api.users({ search: this.search, role: this.roleFilter, page: this.page(), pageSize: this.pageSize })
      .subscribe({
        next: (r) => { this.users.set(r.items); this.total.set(r.totalCount); this.loading.set(false); },
        error: () => this.loading.set(false),
      });
  }

  applyFilters() { this.page.set(1); this.load(); }
  get totalPages() { return Math.max(1, Math.ceil(this.total() / this.pageSize)); }
  goPage(p: number) { if (p >= 1 && p <= this.totalPages) { this.page.set(p); this.load(); } }

  changeRole(u: UserListItem, role: string) {
    if (role === u.role) return;
    this.msg.set(null);
    this.api.updateUserRole(u.id, role).subscribe({
      next: () => { u.role = role; this.msg.set(`Rol de ${u.firstName} actualizado a ${this.roleLabel(role)}.`); },
      error: (e) => { this.msg.set(e?.error?.detail ?? 'No se pudo cambiar el rol.'); this.load(); },
    });
  }

  toggleActive(u: UserListItem) {
    this.msg.set(null);
    this.api.updateUserStatus(u.id, !u.isActive).subscribe({
      next: () => { u.isActive = !u.isActive; this.msg.set(`Cuenta de ${u.firstName} ${u.isActive ? 'activada' : 'desactivada'}.`); },
      error: (e) => this.msg.set(e?.error?.detail ?? 'No se pudo actualizar.'),
    });
  }

  roleLabel(r: string): string {
    return { Admin: 'Administrador', Staff: 'Vendedor', Customer: 'Cliente' }[r] ?? r;
  }
  roleClass(r: string): string {
    return { Admin: 'badge-red', Staff: 'badge-blue', Customer: 'badge-gray' }[r] ?? 'badge-gray';
  }
}
