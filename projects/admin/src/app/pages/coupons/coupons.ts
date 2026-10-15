import { Component, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { AdminApi } from '../../core/admin-api.service';
import { AdminCoupon, CouponWrite } from '../../core/models';

@Component({
  selector: 'ax-coupons',
  imports: [FormsModule, DecimalPipe, DatePipe],
  templateUrl: './coupons.html',
  styleUrl: './coupons.scss',
})
export class Coupons {
  private api = inject(AdminApi);
  readonly items = signal<AdminCoupon[]>([]);
  readonly loading = signal(true);
  readonly editing = signal<AdminCoupon | 'new' | null>(null);
  readonly saving = signal(false);
  readonly msg = signal<string | null>(null);
  readonly err = signal<string | null>(null);

  model: CouponWrite = this.blank();

  constructor() { this.load(); }

  load() {
    this.loading.set(true);
    this.api.coupons().subscribe({ next: (c) => { this.items.set(c); this.loading.set(false); }, error: () => this.loading.set(false) });
  }
  private blank(): CouponWrite { return { code: '', description: '', isPercentage: true, value: 10, minimumOrderAmount: undefined, maxDiscountAmount: undefined, startsAtUtc: null, endsAtUtc: null, usageLimit: null, isActive: true }; }

  startNew() { this.model = this.blank(); this.editing.set('new'); this.err.set(null); }
  startEdit(c: AdminCoupon) {
    this.model = {
      code: c.code, description: c.description ?? '', isPercentage: c.isPercentage, value: c.value,
      minimumOrderAmount: c.minimumOrderAmount, maxDiscountAmount: c.maxDiscountAmount,
      startsAtUtc: c.startsAtUtc ? c.startsAtUtc.substring(0, 10) : null,
      endsAtUtc: c.endsAtUtc ? c.endsAtUtc.substring(0, 10) : null,
      usageLimit: c.usageLimit ?? null, isActive: c.isActive,
    };
    this.editing.set(c); this.err.set(null);
  }
  cancel() { this.editing.set(null); }

  save() {
    if (!this.model.code.trim()) { this.err.set('El código es obligatorio.'); return; }
    this.saving.set(true); this.err.set(null);
    const dto: CouponWrite = {
      ...this.model,
      startsAtUtc: this.model.startsAtUtc || null,
      endsAtUtc: this.model.endsAtUtc || null,
      minimumOrderAmount: this.model.minimumOrderAmount || undefined,
      maxDiscountAmount: this.model.maxDiscountAmount || undefined,
      usageLimit: this.model.usageLimit || null,
    };
    const e = this.editing();
    const obs: Observable<any> = e === 'new' ? this.api.createCoupon(dto) : this.api.updateCoupon((e as AdminCoupon).id, dto);
    obs.subscribe({
      next: () => { this.saving.set(false); this.editing.set(null); this.msg.set('Cupón guardado.'); this.load(); },
      error: (er) => { this.saving.set(false); this.err.set(er?.error?.detail ?? 'No se pudo guardar.'); },
    });
  }

  remove(c: AdminCoupon) {
    if (!confirm(`¿Eliminar el cupón "${c.code}"?`)) return;
    this.api.deleteCoupon(c.id).subscribe({
      next: () => { this.msg.set('Cupón eliminado.'); this.load(); },
      error: (e) => this.msg.set(e?.error?.detail ?? 'No se pudo eliminar.'),
    });
  }
}
