import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { CartService } from './cart.service';
import { CreateOrderPayload, OrderDto, OrderSummary } from './models';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private http = inject(HttpClient);
  private cart = inject(CartService);
  private base = `${environment.apiUrl}/orders`;

  createOrder(payload: CreateOrderPayload): Observable<OrderDto> {
    const headers = new HttpHeaders({ 'X-Cart-Token': this.cart.cartToken() });
    return this.http.post<OrderDto>(this.base, payload, { headers });
  }

  getByNumber(orderNumber: string): Observable<OrderDto> {
    return this.http.get<OrderDto>(`${this.base}/${orderNumber}`);
  }

  getMine(): Observable<OrderSummary[]> {
    return this.http.get<OrderSummary[]>(`${this.base}/mine`);
  }
}
