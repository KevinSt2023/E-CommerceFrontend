import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { CreateIntentResult } from './models';

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/payments/stripe`;

  createIntent(orderNumber: string): Observable<CreateIntentResult> {
    return this.http.post<CreateIntentResult>(`${this.base}/create-intent`, { orderNumber });
  }
}
