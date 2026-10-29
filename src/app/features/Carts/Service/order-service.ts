import { inject, Service } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateOrderRequest, Order, PaymentInfo } from '../../../shared/Interfases/order';

@Service()
export class OrderService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'https://localhost:7020/api/Orders';

  create(request: CreateOrderRequest): Observable<Order> {
    return this.http.post<Order>(this.baseUrl, request);
  }

  getPaymentInfo(): Observable<PaymentInfo> {
    return this.http.get<PaymentInfo>(`${this.baseUrl}/payment-info`);
  }
}