import { Component, computed, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CatalogService } from '../../core/catalog.service';
import { CartService } from '../../core/cart.service';
import { ProductDetail as ProductDetailModel, ProductSpec } from '../../core/models';

@Component({
  selector: 'ax-product-detail',
  imports: [DecimalPipe, RouterLink],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.scss',
})
export class ProductDetail {
  private catalog = inject(CatalogService);
  private cart = inject(CartService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  readonly product = signal<ProductDetailModel | null>(null);
  readonly loading = signal(true);
  readonly notFound = signal(false);
  readonly activeImage = signal<string | null>(null);
  readonly qty = signal(1);
  readonly adding = signal(false);
  readonly added = signal(false);

  readonly specGroups = computed(() => {
    const specs = this.product()?.specifications ?? [];
    const groups: Record<string, ProductSpec[]> = {};
    for (const s of specs) (groups[s.group] ??= []).push(s);
    return Object.entries(groups).map(([group, items]) => ({ group, items }));
  });

  constructor() {
    this.route.paramMap.subscribe((p) => {
      const slug = p.get('slug')!;
      this.loading.set(true);
      this.notFound.set(false);
      this.catalog.getProductBySlug(slug).subscribe({
        next: (prod) => {
          this.product.set(prod);
          this.activeImage.set(prod.images?.[0]?.url ?? prod.primaryImageUrl ?? null);
          this.qty.set(1);
          this.loading.set(false);
        },
        error: () => {
          this.notFound.set(true);
          this.loading.set(false);
        },
      });
    });
  }

  changeQty(delta: number) {
    const max = this.product()?.availableStock ?? 99;
    this.qty.update((q) => Math.min(Math.max(1, q + delta), Math.max(1, max)));
  }

  addToCart() {
    const p = this.product();
    if (!p || this.adding()) return;
    this.adding.set(true);
    this.cart.add(p.id, this.qty()).subscribe({
      next: () => {
        this.adding.set(false);
        this.added.set(true);
        setTimeout(() => this.added.set(false), 1800);
      },
      error: () => this.adding.set(false),
    });
  }

  buyNow() {
    const p = this.product();
    if (!p) return;
    this.cart.add(p.id, this.qty()).subscribe(() => this.router.navigate(['/carrito']));
  }
}
