import { Component, HostListener, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CatalogService } from '../../core/catalog.service';
import { CartService } from '../../core/cart.service';
import { AuthService } from '../../core/auth.service';
import { SettingsService } from '../../core/settings.service';
import { Category } from '../../core/models';

@Component({
  selector: 'ax-header',
  imports: [RouterLink, FormsModule, DecimalPipe],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  private catalog = inject(CatalogService);
  private router = inject(Router);
  readonly cart = inject(CartService);
  readonly auth = inject(AuthService);
  readonly settings = inject(SettingsService);

  readonly categories = signal<Category[]>([]);
  readonly megaOpen = signal(false);
  readonly mobileOpen = signal(false);
  searchTerm = '';

  constructor() {
    this.catalog.getCategories().subscribe((c) => this.categories.set(c));
    this.cart.load();
  }

  toggleMega() {
    this.megaOpen.update((v) => !v);
  }

  closeMenus() {
    this.megaOpen.set(false);
    this.mobileOpen.set(false);
  }

  search() {
    const q = this.searchTerm.trim();
    this.router.navigate(['/catalogo'], { queryParams: q ? { search: q } : {} });
    this.closeMenus();
  }

  @HostListener('document:keydown.escape')
  onEsc() {
    this.closeMenus();
  }
}
