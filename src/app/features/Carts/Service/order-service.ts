import { inject, Service } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AdminOrderListItem, CreateOrderRequest, Order, OrderStatus, PaymentInfo } from '../../../shared/Interfases/order';

@Service()
export class OrderService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'https://localhost:7020/api/Orders';
  private adminUrl = 'https://localhost:7020/api/admin/orders'

  create(request: CreateOrderRequest): Observable<Order> {
    return this.http.post<Order>(this.baseUrl, request);
  }

  getPaymentInfo(): Observable<PaymentInfo> {
    return this.http.get<PaymentInfo>(`${this.baseUrl}/payment-info`);
  }



  getMyOrders(page = 1, pageSize = 20): Observable<Order[]> {
    const params = new HttpParams().set('page', page).set('pageSize', pageSize);
    return this.http.get<Order[]>(this.baseUrl, { params });
  }

  getMyOrder(id: number): Observable<Order> {
    return this.http.get<Order>(`${this.baseUrl}/${id}`);
  }

  //   getOrders(status: OrderStatus | null, page = 1, pageSize = 20): Observable<AdminOrderListItem[]> {
  //   let params = new HttpParams().set('page', page).set('pageSize', pageSize);
  //   if (status) params = params.set('status', status);
  //   return this.http.get<AdminOrderListItem[]>(this.baseUrl, { params });
  // }

  getOrders(status: OrderStatus | null, page = 1, pageSize = 20): Observable<AdminOrderListItem[]> {
    let params = new HttpParams().set('page', page).set('pageSize', pageSize);
    if (status) params = params.set('status', status);
    
    // التعديل هنا: استخدم adminUrl بدل baseUrl
    return this.http.get<AdminOrderListItem[]>(this.adminUrl, { params });
  }

  getOrder(id: number): Observable<Order> {
    return this.http.get<Order>(`${this.baseUrl}/${id}`);
  }

  updateStatus(id: number, status: OrderStatus): Observable<Order> {
    return this.http.patch<Order>(`${this.adminUrl}/${id}/status`, { status });
  }
}