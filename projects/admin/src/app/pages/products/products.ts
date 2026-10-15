import { Component, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AdminApi } from '../../core/admin-api.service';
import { AdminProductListItem } from '../../core/models';

@Component({
  selector: 'ax-products',
  imports: [DecimalPipe, FormsModule, RouterLink],
  templateUrl: './products.html',
  styleUrl: './products.scss',
})
export class Products {
  private api = inject(AdminApi);
  readonly items = signal<AdminProductListItem[]>([]);
  readonly total = signal(0);
  readonly loading = signal(true);
  readonly page = signal(1);
  readonly msg = signal<string | null>(null);
  readonly pageSize = 15;

  search = '';
  activeFilter = '';

  constructor() { this.load(); }

  load() {
    this.loading.set(true);
    const isActive = this.activeFilter === '' ? undefined : this.activeFilter === 'true';
    this.api.adminProducts({ search: this.search, isActive, page: this.page(), pageSize: this.pageSize })
      .subscribe({
        next: (r) => { this.items.set(r.items); this.total.set(r.totalCount); this.loading.set(false); },
        error: () => this.loading.set(false),
      });
  }

  applyFilters() { this.page.set(1); this.load(); }
  get totalPages() { return Math.max(1, Math.ceil(this.total() / this.pageSize)); }
  goPage(p: number) { if (p >= 1 && p <= this.totalPages) { this.page.set(p); this.load(); } }

  archive(p: AdminProductListItem) {
    if (!confirm(`¿Archivar "${p.name}"? Dejará de mostrarse en la tienda (el historial de pedidos se conserva).`)) return;
    this.api.deleteProduct(p.id).subscribe({
      next: () => { this.msg.set(`"${p.name}" archivado.`); this.load(); },
      error: (e) => this.msg.set(e?.error?.detail ?? 'No se pudo archivar.'),
    });
  }
}
