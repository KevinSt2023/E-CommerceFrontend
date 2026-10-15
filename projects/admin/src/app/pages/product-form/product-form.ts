import { Component, inject, signal } from '@angular/core';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { AdminApi } from '../../core/admin-api.service';
import { AdminBrand, AdminCategory, ProductWrite } from '../../core/models';

@Component({
  selector: 'ax-product-form',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './product-form.html',
  styleUrl: './product-form.scss',
})
export class ProductForm {
  private fb = inject(FormBuilder);
  private api = inject(AdminApi);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  readonly categories = signal<AdminCategory[]>([]);
  readonly brands = signal<AdminBrand[]>([]);
  readonly saving = signal(false);
  readonly loading = signal(false);
  readonly errorMsg = signal<string | null>(null);
  readonly editId = signal<string | null>(null);
  readonly uploading = signal(false);
  readonly uploadError = signal<string | null>(null);
  readonly conditions = [
    { value: 'New', label: 'Nuevo' }, { value: 'Refurbished', label: 'Reacondicionado' },
    { value: 'Used', label: 'Usado' }, { value: 'OpenBox', label: 'Caja abierta' },
  ];

  form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(250)]],
    sku: ['', [Validators.required, Validators.maxLength(64)]],
    barcode: [''],
    categoryId: ['', Validators.required],
    brandId: [''],
    condition: ['New', Validators.required],
    model: [''],
    mpn: [''],
    shortDescription: [''],
    description: [''],
    price: [0, [Validators.required, Validators.min(0)]],
    compareAtPrice: [null as number | null],
    cost: [null as number | null],
    stock: [0, [Validators.required, Validators.min(0)]],
    lowStockThreshold: [5, [Validators.min(0)]],
    warrantyMonths: [0, [Validators.min(0)]],
    maxOrderQuantity: [null as number | null],
    allowBackorder: [false],
    weightKg: [null as number | null],
    metaTitle: [''],
    metaDescription: [''],
    isActive: [true],
    isFeatured: [false],
    images: this.fb.array([] as any[]),
    specifications: this.fb.array([] as any[]),
  });

  get images() { return this.form.get('images') as FormArray; }
  get specifications() { return this.form.get('specifications') as FormArray; }

  constructor() {
    this.api.adminCategories().subscribe((c) => this.categories.set(c));
    this.api.adminBrands().subscribe((b) => this.brands.set(b));

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.editId.set(id);
      this.loading.set(true);
      this.api.adminProduct(id).subscribe({
        next: (p) => {
          this.form.patchValue({ ...p, brandId: p.brandId ?? '', compareAtPrice: p.compareAtPrice ?? null,
            cost: p.cost ?? null, maxOrderQuantity: p.maxOrderQuantity ?? null, weightKg: p.weightKg ?? null } as any);
          p.images.forEach((img) => this.images.push(this.imageGroup(img.url, img.altText, img.isPrimary)));
          p.specifications.forEach((s) => this.specifications.push(this.specGroup(s.group, s.name, s.value)));
          this.loading.set(false);
        },
        error: () => { this.errorMsg.set('No se pudo cargar el producto.'); this.loading.set(false); },
      });
    }
  }

  private imageGroup(url = '', alt = '', primary = false) {
    return this.fb.group({ url: [url, Validators.required], altText: [alt], isPrimary: [primary] });
  }
  private specGroup(group = 'General', name = '', value = '') {
    return this.fb.group({ group: [group], name: [name, Validators.required], value: [value, Validators.required] });
  }
  addImage() { this.images.push(this.imageGroup('', '', this.images.length === 0)); }
  removeImage(i: number) { this.images.removeAt(i); }
  setPrimary(i: number) { this.images.controls.forEach((c, idx) => c.get('isPrimary')!.setValue(idx === i)); }

  /** Sube una o varias imágenes desde la PC y las agrega como filas con su URL. */
  onUploadFiles(event: Event) {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    if (!files.length) return;
    this.uploadError.set(null);
    this.uploading.set(true);

    const uploadNext = (i: number) => {
      if (i >= files.length) { this.uploading.set(false); input.value = ''; return; }
      this.api.uploadImage(files[i]).subscribe({
        next: (r) => {
          this.images.push(this.imageGroup(r.url, files[i].name.replace(/\.[^.]+$/, ''), this.images.length === 0));
          uploadNext(i + 1);
        },
        error: (e) => {
          this.uploading.set(false);
          input.value = '';
          this.uploadError.set(e?.error?.detail || 'No se pudo subir la imagen. Verifica el formato (JPG/PNG/WEBP) y que pese menos de 5 MB.');
        },
      });
    };
    uploadNext(0);
  }
  addSpec() { this.specifications.push(this.specGroup()); }
  removeSpec(i: number) { this.specifications.removeAt(i); }

  invalid(ctrl: string) { const c = this.form.get(ctrl); return !!c && c.invalid && (c.touched || c.dirty); }

  submit() {
    this.errorMsg.set(null);
    if (this.form.invalid) { this.form.markAllAsTouched(); this.errorMsg.set('Revisa los campos obligatorios.'); return; }
    const v = this.form.getRawValue();
    const dto: ProductWrite = {
      name: v.name!, sku: v.sku!, barcode: v.barcode || undefined, categoryId: v.categoryId!,
      brandId: v.brandId || undefined, condition: v.condition!, model: v.model || undefined, mpn: v.mpn || undefined,
      shortDescription: v.shortDescription || undefined, description: v.description || undefined,
      price: +v.price!, compareAtPrice: v.compareAtPrice ?? undefined, cost: v.cost ?? undefined,
      stock: +v.stock!, lowStockThreshold: +v.lowStockThreshold!, warrantyMonths: +v.warrantyMonths!,
      maxOrderQuantity: v.maxOrderQuantity ?? undefined, allowBackorder: !!v.allowBackorder, weightKg: v.weightKg ?? undefined,
      metaTitle: v.metaTitle || undefined, metaDescription: v.metaDescription || undefined,
      isActive: !!v.isActive, isFeatured: !!v.isFeatured,
      images: (v.images as any[]).map((img, idx) => ({ url: img.url, altText: img.altText || undefined, isPrimary: !!img.isPrimary, sortOrder: idx })),
      specifications: (v.specifications as any[]).map((s, idx) => ({ group: s.group || 'General', name: s.name, value: s.value, sortOrder: idx })),
    };

    this.saving.set(true);
    const id = this.editId();
    const obs: Observable<any> = id ? this.api.updateProduct(id, dto) : this.api.createProduct(dto);
    obs.subscribe({
      next: () => this.router.navigate(['/productos']),
      error: (e) => { this.saving.set(false); this.errorMsg.set(e?.error?.detail ?? 'No se pudo guardar.'); },
    });
  }
}
