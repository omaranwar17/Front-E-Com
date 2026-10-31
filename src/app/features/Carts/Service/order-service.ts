import { inject, Service } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AdminOrderListItem, CreateOrderRequest, Order, OrderStatus, PaymentInfo } from '../../../shared/Interfases/order';
import { environment } from '../../../../environments/environment';

@Service()
export class OrderService {
  private readonly http = inject(HttpClient);

  private baseUrl = `${environment.apiUrl}/api/Orders`;
  private adminUrl = `${environment.apiUrl}/api/admin/orders`;

  // <-- جديد: بقت FormData بدل JSON، وبتاخد الصورة كباراميتر تاني
  create(request: CreateOrderRequest, receiptImage?: File | null): Observable<Order> {
    const fd = new FormData();
    const a = request.shippingAddress;

    // أسماء الحقول لازم تطابق الـ DTO في الباك بالظبط
    fd.append('ShippingAddress.FullName', a.fullName);
    fd.append('ShippingAddress.Phone', a.phone);
    fd.append('ShippingAddress.Governorate', a.governorate);
    fd.append('ShippingAddress.City', a.city);
    fd.append('ShippingAddress.Street', a.street);
    if (a.notes) fd.append('ShippingAddress.Notes', a.notes);

    fd.append('PaymentMethod', request.paymentMethod);
    if (request.paymentReference)
      fd.append('PaymentReference', request.paymentReference);
    if (receiptImage)
      fd.append('ReceiptImage', receiptImage);

    // متحطش Content-Type يدويًا، المتصفح بيضيفه مع الـ boundary
    return this.http.post<Order>(this.baseUrl, fd);
  }

  getPaymentInfo(): Observable<PaymentInfo> {
    return this.http.get<PaymentInfo>(`${this.baseUrl}/payment-info`);
  }

  deleteOrder(id: number): Observable<void> {
  return this.http.delete<void>(`${this.baseUrl}/${id}`);
}

  getMyOrders(page = 1, pageSize = 20): Observable<Order[]> {
    const params = new HttpParams().set('page', page).set('pageSize', pageSize);
    return this.http.get<Order[]>(this.baseUrl, { params });
  }

  getMyOrder(id: number): Observable<Order> {
    return this.http.get<Order>(`${this.baseUrl}/${id}`);
  }

  getOrders(status: OrderStatus | null, page = 1, pageSize = 20): Observable<AdminOrderListItem[]> {
    let params = new HttpParams().set('page', page).set('pageSize', pageSize);
    if (status) params = params.set('status', status);
    return this.http.get<AdminOrderListItem[]>(this.adminUrl, { params });
  }

  getOrder(id: number): Observable<Order> {
    return this.http.get<Order>(`${this.baseUrl}/${id}`);
  }

  updateStatus(id: number, status: OrderStatus): Observable<Order> {
    return this.http.patch<Order>(`${this.adminUrl}/${id}/status`, { status });
  }

  downloadInvoice(orderId: number, type: 'customer' | 'admin'): Observable<Blob> {
    const url = type === 'admin'
      ? `${this.baseUrl}/${orderId}/admin-invoice`
      : `${this.baseUrl}/${orderId}/my-invoice`;

    return this.http.get(url, { responseType: 'blob' });
  }

  // <-- جديد: جلب صورة الإيصال للأدمن بالـ token (عن طريق الـ interceptor)
  getReceipt(orderId: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/${orderId}/receipt`, { responseType: 'blob' });
  }
}