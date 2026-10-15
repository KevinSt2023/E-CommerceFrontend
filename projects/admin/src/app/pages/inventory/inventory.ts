import { Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminApi } from '../../core/admin-api.service';
import { LowStockItem, StockMovement } from '../../core/models';

interface Selected { productId: string; sku: string; name: string; stock: number; reservedStock: number; availableStock: number; }

@Component({
  selector: 'ax-inventory',
  imports: [DatePipe, FormsModule],
  templateUrl: './inventory.html',
  styleUrl: './inventory.scss',
})
export class Inventory {
  private api = inject(AdminApi);

  readonly lowStock = signal<LowStockItem[]>([]);
  readonly loadingLow = signal(true);
  readonly selected = signal<Selected | null>(null);
  readonly movements = signal<StockMovement[]>([]);
  readonly scanError = signal<string | null>(null);
  readonly actionMsg = signal<string | null>(null);
  readonly busy = signal(false);

  scanCode = '';
  receiveQty: number | null = null;
  receiveRef = '';
  adjustQty: number | null = null;

  constructor() { this.loadLowStock(); }

  loadLowStock() {
    this.loadingLow.set(true);
    this.api.lowStock().subscribe({
      next: (l) => { this.lowStock.set(l); this.loadingLow.set(false); },
      error: () => this.loadingLow.set(false),
    });
  }

  scan() {
    const code = this.scanCode.trim();
    if (!code) return;
    this.scanError.set(null);
    this.api.scanBarcode(code).subscribe({
      next: (p) => {
        this.select({ productId: p.id, sku: p.sku, name: p.name, stock: p.stock, reservedStock: p.reservedStock, availableStock: p.availableStock });
        this.scanCode = '';
      },
      error: (e) => this.scanError.set(e?.error?.detail ?? 'Código no encontrado.'),
    });
  }

  selectLow(item: LowStockItem) {
    this.select({ productId: item.productId, sku: item.sku, name: item.name, stock: item.stock, reservedStock: item.reservedStock, availableStock: item.availableStock });
  }

  private select(s: Selected) {
    this.selected.set(s);
    this.actionMsg.set(null);
    this.receiveQty = null; this.adjustQty = s.stock; this.receiveRef = '';
    this.loadMovements(s.productId);
  }

  loadMovements(productId: string) {
    this.api.movements({ productId, pageSize: 15 }).subscribe({ next: (r) => this.movements.set(r.items) });
  }

  receive() {
    const s = this.selected(); if (!s || !this.receiveQty || this.receiveQty <= 0) return;
    this.busy.set(true); this.actionMsg.set(null);
    this.api.receiveStock({ productId: s.productId, quantity: this.receiveQty, type: 'Purchase', reference: this.receiveRef || undefined })
      .subscribe({ next: (ps) => this.afterAction(ps, 'Ingreso registrado en el kardex.'), error: (e) => this.failAction(e) });
  }

  adjust() {
    const s = this.selected(); if (!s || this.adjustQty === null || this.adjustQty < 0) return;
    this.busy.set(true); this.actionMsg.set(null);
    this.api.adjustStock({ productId: s.productId, newStock: this.adjustQty, notes: 'Ajuste por conteo' })
      .subscribe({ next: (ps) => this.afterAction(ps, 'Stock ajustado.'), error: (e) => this.failAction(e) });
  }

  private afterAction(ps: any, msg: string) {
    this.busy.set(false);
    this.actionMsg.set(msg);
    this.selected.set({ productId: ps.productId, sku: ps.sku, name: ps.name, stock: ps.stock, reservedStock: ps.reservedStock, availableStock: ps.availableStock });
    this.receiveQty = null;
    this.loadMovements(ps.productId);
    this.loadLowStock();
  }
  private failAction(e: any) { this.busy.set(false); this.actionMsg.set(e?.error?.detail ?? 'Error al procesar.'); }

  movType(t: string): string {
    return { Purchase: 'Ingreso', Sale: 'Venta', Adjustment: 'Ajuste', Return: 'Devolución', ReservationRelease: 'Liberación' }[t] ?? t;
  }
}
