import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { AdminApi } from '../../core/admin-api.service';
import { AdminCategory, CategoryWrite } from '../../core/models';

@Component({
  selector: 'ax-categories',
  imports: [FormsModule],
  templateUrl: './categories.html',
  styleUrl: './categories.scss',
})
export class Categories {
  private api = inject(AdminApi);
  readonly items = signal<AdminCategory[]>([]);
  readonly loading = signal(true);
  readonly editing = signal<AdminCategory | 'new' | null>(null);
  readonly saving = signal(false);
  readonly msg = signal<string | null>(null);
  readonly err = signal<string | null>(null);

  model: CategoryWrite = this.blank();

  constructor() { this.load(); }

  load() {
    this.loading.set(true);
    this.api.adminCategories().subscribe({ next: (c) => { this.items.set(c); this.loading.set(false); }, error: () => this.loading.set(false) });
  }

  private blank(): CategoryWrite { return { name: '', slug: '', description: '', imageUrl: '', iconName: '', parentId: null, sortOrder: 0, isActive: true }; }

  startNew() { this.model = this.blank(); this.editing.set('new'); this.err.set(null); }
  startEdit(c: AdminCategory) {
    this.model = { name: c.name, slug: c.slug, description: c.description ?? '', imageUrl: c.imageUrl ?? '', iconName: c.iconName ?? '', parentId: c.parentId ?? null, sortOrder: c.sortOrder, isActive: c.isActive };
    this.editing.set(c); this.err.set(null);
  }
  cancel() { this.editing.set(null); }

  save() {
    if (!this.model.name.trim()) { this.err.set('El nombre es obligatorio.'); return; }
    this.saving.set(true); this.err.set(null);
    const dto: CategoryWrite = { ...this.model, parentId: this.model.parentId || null };
    const e = this.editing();
    const obs: Observable<any> = e === 'new' ? this.api.createCategory(dto) : this.api.updateCategory((e as AdminCategory).id, dto);
    obs.subscribe({
      next: () => { this.saving.set(false); this.editing.set(null); this.msg.set('Categoría guardada.'); this.load(); },
      error: (er) => { this.saving.set(false); this.err.set(er?.error?.detail ?? 'No se pudo guardar.'); },
    });
  }

  remove(c: AdminCategory) {
    if (!confirm(`¿Eliminar la categoría "${c.name}"?`)) return;
    this.api.deleteCategory(c.id).subscribe({
      next: () => { this.msg.set('Categoría eliminada.'); this.load(); },
      error: (e) => this.msg.set(e?.error?.detail ?? 'No se pudo eliminar.'),
    });
  }

  get parentOptions() { return this.items().filter((c) => !c.parentId && (this.editing() === 'new' || c.id !== (this.editing() as AdminCategory)?.id)); }
}
