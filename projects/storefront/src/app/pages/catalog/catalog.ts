import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CatalogService } from '../../core/catalog.service';
import { Brand, Category, ProductListItem, ProductQuery } from '../../core/models';
import { ProductCard } from '../../shared/product-card/product-card';

@Component({
  selector: 'ax-catalog',
  imports: [RouterLink, FormsModule, ProductCard],
  templateUrl: './catalog.html',
  styleUrl: './catalog.scss',
})
export class Catalog {
  private catalog = inject(CatalogService);
  private route = inject(ActivatedRoute);

  readonly products = signal<ProductListItem[]>([]);
  readonly categories = signal<Category[]>([]);
  readonly brands = signal<Brand[]>([]);
  readonly total = signal(0);
  readonly loading = signal(true);
  readonly title = signal('Catálogo');
  readonly filtersOpen = signal(false);

  // Estado de filtros
  sort = 'relevance';
  categorySlug?: string;
  search?: string;
  selectedBrands = new Set<string>();
  minPrice: number | null = null;
  maxPrice: number | null = null;
  condition = '';
  inStockOnly = false;
  onSaleOnly = false;
  private page = 1;
  private readonly pageSize = 12;

  readonly sortOptions = [
    { value: 'relevance', label: 'Relevancia' },
    { value: 'price_asc', label: 'Precio: menor a mayor' },
    { value: 'price_desc', label: 'Precio: mayor a menor' },
    { value: 'newest', label: 'Más nuevos' },
    { value: 'best_selling', label: 'Más vendidos' },
    { value: 'rating', label: 'Mejor valorados' },
  ];
  readonly conditions = [
    { value: '', label: 'Todas' },
    { value: 'New', label: 'Nuevo' },
    { value: 'Refurbished', label: 'Reacondicionado' },
    { value: 'OpenBox', label: 'Caja abierta' },
    { value: 'Used', label: 'Usado' },
  ];

  constructor() {
    this.catalog.getCategories().subscribe((c) => this.categories.set(c));
    this.catalog.getBrands().subscribe((b) => this.brands.set(b));
    this.route.queryParamMap.subscribe((p) => {
      this.categorySlug = p.get('categoria') ?? undefined;
      this.search = p.get('search') ?? undefined;
      this.onSaleOnly = !!p.get('ofertas');
      // reset filtros al cambiar de categoría/búsqueda
      this.selectedBrands.clear();
      this.minPrice = this.maxPrice = null;
      this.condition = '';
      this.inStockOnly = false;
      this.title.set(
        this.search ? `Resultados para "${this.search}"`
          : p.get('ofertas') ? 'Ofertas'
          : this.catName(this.categorySlug) ?? 'Catálogo',
      );
      this.fetch(true);
    });
  }

  private catName(slug?: string): string | undefined {
    if (!slug) return undefined;
    const flat = (cs: Category[]): Category[] => cs.flatMap((c) => [c, ...flat(c.children)]);
    return flat(this.categories()).find((c) => c.slug === slug)?.name;
  }

  private buildQuery(): ProductQuery {
    return {
      page: this.page,
      pageSize: this.pageSize,
      sort: this.sort,
      search: this.search,
      categorySlug: this.categorySlug,
      brandSlugs: this.selectedBrands.size ? [...this.selectedBrands] : undefined,
      minPrice: this.minPrice ?? undefined,
      maxPrice: this.maxPrice ?? undefined,
      condition: this.condition || undefined,
      inStockOnly: this.inStockOnly || undefined,
      onSaleOnly: this.onSaleOnly || undefined,
    };
  }

  private fetch(reset: boolean) {
    this.loading.set(true);
    this.catalog.getProducts(this.buildQuery()).subscribe((r) => {
      this.products.set(reset ? r.items : [...this.products(), ...r.items]);
      this.total.set(r.totalCount);
      this.loading.set(false);
    });
  }

  applyFilters() { this.page = 1; this.fetch(true); }
  changeSort() { this.applyFilters(); }

  toggleBrand(slug: string, checked: boolean) {
    checked ? this.selectedBrands.add(slug) : this.selectedBrands.delete(slug);
    this.applyFilters();
  }
  isBrandChecked(slug: string) { return this.selectedBrands.has(slug); }

  setCondition(c: string) { this.condition = c; this.applyFilters(); }
  toggleInStock() { this.inStockOnly = !this.inStockOnly; this.applyFilters(); }
  toggleOnSale() { this.onSaleOnly = !this.onSaleOnly; this.applyFilters(); }

  clearFilters() {
    this.selectedBrands.clear();
    this.minPrice = this.maxPrice = null;
    this.condition = '';
    this.inStockOnly = false;
    this.onSaleOnly = false;
    this.applyFilters();
  }

  get activeFilterCount() {
    return this.selectedBrands.size + (this.minPrice != null || this.maxPrice != null ? 1 : 0)
      + (this.condition ? 1 : 0) + (this.inStockOnly ? 1 : 0) + (this.onSaleOnly ? 1 : 0);
  }

  loadMore() { this.page++; this.fetch(false); }
  get canLoadMore() { return this.products().length < this.total(); }
}
