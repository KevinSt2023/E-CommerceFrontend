import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  AdminBrand, AdminCategory, AdminCoupon, AdminProduct, AdminProductListItem, BrandWrite, CategoryWrite,
  CouponWrite, Dashboard, LowStockItem, Order, OrderSummary, PagedResult, ProductScan, ProductStock,
  ProductWrite, StockMovement, StoreSettings, UserListItem,
} from './models';

function toParams(obj: Record<string, any>): HttpParams {
  let p = new HttpParams();
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined && v !== null && v !== '') p = p.set(k, String(v));
  }
  return p;
}

@Injectable({ providedIn: 'root' })
export class AdminApi {
  private http = inject(HttpClient);
  private api = environment.apiUrl;

  // Dashboard
  dashboard(): Observable<Dashboard> {
    return this.http.get<Dashboard>(`${this.api}/admin/dashboard`);
  }

  // Pedidos
  orders(q: { status?: string; search?: string; page?: number; pageSize?: number }): Observable<PagedResult<OrderSummary>> {
    return this.http.get<PagedResult<OrderSummary>>(`${this.api}/orders`, { params: toParams(q) });
  }
  order(orderNumber: string): Observable<Order> {
    return this.http.get<Order>(`${this.api}/orders/${orderNumber}`);
  }
  confirmPayment(orderNumber: string, paymentMethod: string, transactionId?: string): Observable<Order> {
    return this.http.post<Order>(`${this.api}/orders/${orderNumber}/confirm-payment`, { paymentMethod, transactionId });
  }
  updateOrderStatus(orderNumber: string, status: string): Observable<Order> {
    return this.http.put<Order>(`${this.api}/orders/${orderNumber}/status`, { status });
  }
  cancelOrder(orderNumber: string, reason?: string): Observable<Order> {
    return this.http.post<Order>(`${this.api}/orders/${orderNumber}/cancel`, { reason });
  }

  // Inventario
  lowStock(): Observable<LowStockItem[]> {
    return this.http.get<LowStockItem[]>(`${this.api}/inventory/low-stock`);
  }
  receiveStock(body: { productId: string; quantity: number; type: string; reference?: string; notes?: string }): Observable<ProductStock> {
    return this.http.post<ProductStock>(`${this.api}/inventory/receive`, body);
  }
  adjustStock(body: { productId: string; newStock: number; notes?: string }): Observable<ProductStock> {
    return this.http.post<ProductStock>(`${this.api}/inventory/adjust`, body);
  }
  movements(q: { productId?: string; page?: number; pageSize?: number }): Observable<PagedResult<StockMovement>> {
    return this.http.get<PagedResult<StockMovement>>(`${this.api}/inventory/movements`, { params: toParams(q) });
  }
  scanBarcode(code: string): Observable<ProductScan> {
    return this.http.get<ProductScan>(`${this.api}/products/barcode/${encodeURIComponent(code)}`);
  }

  // Productos (catálogo)
  adminProducts(q: { search?: string; categoryId?: string; isActive?: boolean; page?: number; pageSize?: number }): Observable<PagedResult<AdminProductListItem>> {
    return this.http.get<PagedResult<AdminProductListItem>>(`${this.api}/admin/products`, { params: toParams(q) });
  }
  adminProduct(id: string): Observable<AdminProduct> {
    return this.http.get<AdminProduct>(`${this.api}/admin/products/${id}`);
  }
  createProduct(dto: ProductWrite): Observable<{ id: string }> {
    return this.http.post<{ id: string }>(`${this.api}/admin/products`, dto);
  }
  updateProduct(id: string, dto: ProductWrite): Observable<void> {
    return this.http.put<void>(`${this.api}/admin/products/${id}`, dto);
  }
  deleteProduct(id: string): Observable<void> {
    return this.http.delete<void>(`${this.api}/admin/products/${id}`);
  }

  // Categorías
  adminCategories(): Observable<AdminCategory[]> { return this.http.get<AdminCategory[]>(`${this.api}/admin/categories`); }
  createCategory(dto: CategoryWrite): Observable<{ id: string }> { return this.http.post<{ id: string }>(`${this.api}/admin/categories`, dto); }
  updateCategory(id: string, dto: CategoryWrite): Observable<void> { return this.http.put<void>(`${this.api}/admin/categories/${id}`, dto); }
  deleteCategory(id: string): Observable<void> { return this.http.delete<void>(`${this.api}/admin/categories/${id}`); }

  // Marcas
  adminBrands(): Observable<AdminBrand[]> { return this.http.get<AdminBrand[]>(`${this.api}/admin/brands`); }
  createBrand(dto: BrandWrite): Observable<{ id: string }> { return this.http.post<{ id: string }>(`${this.api}/admin/brands`, dto); }
  updateBrand(id: string, dto: BrandWrite): Observable<void> { return this.http.put<void>(`${this.api}/admin/brands/${id}`, dto); }
  deleteBrand(id: string): Observable<void> { return this.http.delete<void>(`${this.api}/admin/brands/${id}`); }

  // Cupones
  coupons(): Observable<AdminCoupon[]> { return this.http.get<AdminCoupon[]>(`${this.api}/admin/coupons`); }
  createCoupon(dto: CouponWrite): Observable<{ id: string }> { return this.http.post<{ id: string }>(`${this.api}/admin/coupons`, dto); }
  updateCoupon(id: string, dto: CouponWrite): Observable<void> { return this.http.put<void>(`${this.api}/admin/coupons/${id}`, dto); }
  deleteCoupon(id: string): Observable<void> { return this.http.delete<void>(`${this.api}/admin/coupons/${id}`); }

  // Usuarios
  users(q: { search?: string; role?: string; page?: number; pageSize?: number }): Observable<PagedResult<UserListItem>> {
    return this.http.get<PagedResult<UserListItem>>(`${this.api}/admin/users`, { params: toParams(q) });
  }
  updateUserRole(id: string, role: string): Observable<void> {
    return this.http.put<void>(`${this.api}/admin/users/${id}/role`, { role });
  }
  updateUserStatus(id: string, isActive: boolean): Observable<void> {
    return this.http.put<void>(`${this.api}/admin/users/${id}/status`, { isActive });
  }

  // Configuración del negocio
  getSettings(): Observable<StoreSettings> { return this.http.get<StoreSettings>(`${this.api}/admin/settings`); }
  updateSettings(dto: StoreSettings): Observable<StoreSettings> { return this.http.put<StoreSettings>(`${this.api}/admin/settings`, dto); }
  /** Datos públicos del negocio (RUC, logo, dirección) — accesible también para Vendedor, p. ej. comprobantes. */
  storeInfo(): Observable<StoreSettings> { return this.http.get<StoreSettings>(`${this.api}/settings`); }

  // Subida de imágenes desde la PC → devuelve la URL pública
  uploadImage(file: File): Observable<{ url: string; fileName: string }> {
    const form = new FormData();
    form.append('file', file);
    return this.http.post<{ url: string; fileName: string }>(`${this.api}/admin/uploads/image`, form);
  }
}
