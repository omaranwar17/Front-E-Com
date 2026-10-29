import { Component, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { TranslatePipe } from '@ngx-translate/core';

import { Order } from '../../../../shared/Interfases/order';
import { OrderService } from '../../Service/order-service';

@Component({
  selector: 'app-my-orders',
  imports: [CurrencyPipe, DatePipe, RouterLink, TranslatePipe],
  templateUrl: './my-orders.html',
})
export class MyOrders {
  private readonly orders = inject(OrderService);

  readonly list = signal<Order[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  constructor() {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);

    this.orders.getMyOrders().subscribe({
      next: (orders) => {
        this.list.set(orders);
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.error.set(err.status === 0 ? 'MY_ORDERS.ERR_NETWORK' : 'MY_ORDERS.ERR_LOAD');
        this.loading.set(false);
      },
    });
  }

  /** ألوان الشارة حسب الحالة. أي حالة جديدة بتاخد اللون الرمادي تلقائياً. */
  statusClass(status: string): string {
    switch (status) {
      case 'AwaitingPaymentReview':
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Confirmed':
      case 'Shipped':
        return 'bg-blue-100 text-blue-800';
      case 'Delivered':
        return 'bg-green-100 text-green-800';
      case 'Rejected':
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }
}