import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { AdminApi } from '../../core/admin-api.service';
import { AdminBrand, BrandWrite } from '../../core/models';

@Component({
  selector: 'ax-brands',
  imports: [FormsModule],
  templateUrl: './brands.html',
  styleUrl: './brands.scss',
})
export class Brands {
  private api = inject(AdminApi);
  readonly items = signal<AdminBrand[]>([]);
  readonly loading = signal(true);
  readonly editing = signal<AdminBrand | 'new' | null>(null);
  readonly saving = signal(false);
  readonly msg = signal<string | null>(null);
  readonly err = signal<string | null>(null);

  model: BrandWrite = this.blank();

  constructor() { this.load(); }

  load() {
    this.loading.set(true);
    this.api.adminBrands().subscribe({ next: (b) => { this.items.set(b); this.loading.set(false); }, error: () => this.loading.set(false) });
  }
  private blank(): BrandWrite { return { name: '', slug: '', logoUrl: '', description: '', isActive: true }; }

  startNew() { this.model = this.blank(); this.editing.set('new'); this.err.set(null); }
  startEdit(b: AdminBrand) {
    this.model = { name: b.name, slug: b.slug, logoUrl: b.logoUrl ?? '', description: b.description ?? '', isActive: b.isActive };
    this.editing.set(b); this.err.set(null);
  }
  cancel() { this.editing.set(null); }

  save() {
    if (!this.model.name.trim()) { this.err.set('El nombre es obligatorio.'); return; }
    this.saving.set(true); this.err.set(null);
    const e = this.editing();
    const obs: Observable<any> = e === 'new' ? this.api.createBrand(this.model) : this.api.updateBrand((e as AdminBrand).id, this.model);
    obs.subscribe({
      next: () => { this.saving.set(false); this.editing.set(null); this.msg.set('Marca guardada.'); this.load(); },
      error: (er) => { this.saving.set(false); this.err.set(er?.error?.detail ?? 'No se pudo guardar.'); },
    });
  }

  remove(b: AdminBrand) {
    if (!confirm(`¿Eliminar la marca "${b.name}"? Los productos quedarán sin marca.`)) return;
    this.api.deleteBrand(b.id).subscribe({
      next: () => { this.msg.set('Marca eliminada.'); this.load(); },
      error: (e) => this.msg.set(e?.error?.detail ?? 'No se pudo eliminar.'),
    });
  }
}
