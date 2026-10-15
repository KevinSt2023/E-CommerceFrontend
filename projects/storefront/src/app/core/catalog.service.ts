import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Brand, Category, PagedResult, ProductDetail, ProductListItem, ProductQuery } from './models';

@Injectable({ providedIn: 'root' })
export class CatalogService {
  private http = inject(HttpClient);
  private base = environment.apiUrl;

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.base}/categories`);
  }

  getBrands(): Observable<Brand[]> {
    return this.http.get<Brand[]>(`${this.base}/brands`);
  }

  getProducts(query: ProductQuery = {}): Observable<PagedResult<ProductListItem>> {
    let params = new HttpParams();
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null || value === '') continue;
      if (Array.isArray(value)) {
        value.forEach((v) => (params = params.append(key, String(v))));
      } else {
        params = params.set(key, String(value));
      }
    }
    return this.http.get<PagedResult<ProductListItem>>(`${this.base}/products`, { params });
  }

  getProductBySlug(slug: string): Observable<ProductDetail> {
    return this.http.get<ProductDetail>(`${this.base}/products/${slug}`);
  }
}
