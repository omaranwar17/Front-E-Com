import { Component, inject, signal, computed } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

import { Order } from '../../../../shared/Interfases/order';
import { OrderService } from '../../Service/order-service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-my-orders',
  imports: [CurrencyPipe, DatePipe, RouterLink, TranslatePipe],
  templateUrl: './my-orders.html',
})
export class MyOrders {
  private readonly ordersService = inject(OrderService);
  private readonly toastr = inject(ToastrService);
  private readonly translate = inject(TranslateService);
  // البيانات الأساسية
  readonly list = signal<Order[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  // إعدادات الصفحات
  readonly pageSize = 10; // 6 أوردرات في الصفحة
  readonly currentPage = signal(1);

  // دالة بتحسب الأوردرات اللي هتظهر في الصفحة الحالية
  readonly paginatedOrders = computed(() => {
    const startIndex = (this.currentPage() - 1) * this.pageSize;
    return this.list().slice(startIndex, startIndex + this.pageSize);
  });

  // دالة بتعرفنا لو في صفحة تانية ولا لأ
  readonly hasMore = computed(() => {
    return this.list().length > this.currentPage() * this.pageSize;
  });

  constructor() {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);

    this.ordersService.getMyOrders().subscribe({
      next: (orders) => {
        this.list.set(orders);
        this.loading.set(false);
        this.currentPage.set(1); // نرجع للصفحة الأولى لما نحدث البيانات
      },
      error: (err: HttpErrorResponse) => {
        this.error.set(err.status === 0 ? 'MY_ORDERS.ERR_NETWORK' : 'MY_ORDERS.ERR_LOAD');
        this.loading.set(false);
      },
    });
  }

  // دالة التنقل بين الصفحات
  goTo(page: number): void {
    if (page < 1 || page > Math.ceil(this.list().length / this.pageSize)) return;
    this.currentPage.set(page);
  }
    readonly totalPages = computed(() => {
    return Math.ceil(this.list().length / this.pageSize);
  });



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

 printInvoice(orderId: number): void {
    this.ordersService.downloadInvoice(orderId, 'customer').subscribe({
      next: (blob: Blob) => {
        const fileURL = URL.createObjectURL(blob);
        const newWindow = window.open(fileURL, '_blank');
        if (newWindow) {
          newWindow.onload = () => newWindow.print();
        }
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error downloading invoice', err);
        
        // استخدام الترجمة في رسالة الخطأ
        const errorMsg = this.translate.instant('MY_ORDERS.ERR_INVOICE');
        const errorTitle = this.translate.instant('COMMON.ERROR');
        
        this.toastr.error(errorMsg, errorTitle);
      }
    });
  }
}