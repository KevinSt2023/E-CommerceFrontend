import { Component, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CatalogService } from '../../core/catalog.service';
import { SettingsService } from '../../core/settings.service';
import { Category, ProductListItem } from '../../core/models';
import { ProductCard } from '../../shared/product-card/product-card';

@Component({
  selector: 'ax-home',
  imports: [RouterLink, ProductCard, DecimalPipe],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  private catalog = inject(CatalogService);
  readonly settings = inject(SettingsService);

  readonly categories = signal<Category[]>([]);
  readonly featured = signal<ProductListItem[]>([]);
  readonly onSale = signal<ProductListItem[]>([]);
  readonly loading = signal(true);

  readonly heroStats = [
    { icon: 'pi pi-box', label: 'Productos originales' },
    { icon: 'pi pi-shield', label: 'Garantía oficial' },
    { icon: 'pi pi-truck', label: 'Envío a todo el Perú' },
    { icon: 'pi pi-credit-card', label: 'Pago seguro' },
  ];

  constructor() {
    this.catalog.getCategories().subscribe((c) => this.categories.set(c));
    this.catalog.getProducts({ featuredOnly: true, pageSize: 8, sort: 'best_selling' }).subscribe((r) => {
      this.featured.set(r.items);
      this.loading.set(false);
    });
    this.catalog.getProducts({ onSaleOnly: true, pageSize: 4, sort: 'newest' }).subscribe((r) => this.onSale.set(r.items));
  }
}
