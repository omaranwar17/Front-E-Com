import { Component, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { AdminOrderListItem, OrderStatus } from '../../../../shared/Interfases/order';
import { OrderService } from '../../Service/order-service';



/** لازم يطابق OrderStatuses.Transitions في الـ backend. أي حالة مش موجودة هنا نهائية. */
const ORDER_TRANSITIONS: Partial<Record<OrderStatus, OrderStatus[]>> = {
  AwaitingPaymentReview: ['Confirmed', 'Rejected', 'Cancelled'],
  Pending: ['Confirmed', 'Cancelled'],
  Confirmed: ['Shipped', 'Cancelled'],
  Shipped: ['Delivered'],
};

/** الحالات اللي مفيش رجوع منها، فبنطلب تأكيد قبلها */
const CONFIRM_BEFORE: OrderStatus[] = ['Rejected', 'Cancelled'];

@Component({
  selector: 'app-admin-orders',
  imports: [CurrencyPipe, DatePipe, TranslatePipe],
  templateUrl: './admin-orders.html',
})
export class AdminOrders {
  private readonly adminOrders = inject(OrderService);
  private readonly translate = inject(TranslateService);

  readonly pageSize = 20;

  /** null = كل الحالات */
  readonly filters: (OrderStatus | null)[] = [
    'AwaitingPaymentReview',
    'Pending',
    'Confirmed',
    'Shipped',
    'Delivered',
    'Rejected',
    'Cancelled',
    null,
  ];

  readonly status = signal<OrderStatus | null>('AwaitingPaymentReview');
  readonly page = signal(1);
  readonly list = signal<AdminOrderListItem[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  /** الأوردر اللي بيتغير حالته دلوقتي (بيمنع الضغط مرتين) */
  readonly updatingId = signal<number | null>(null);
  readonly actionError = signal<string | null>(null);

  private requestId = 0;

  constructor() {
    this.load();
  }

  setStatus(status: OrderStatus | null): void {
    if (this.status() === status) return;
    this.status.set(status);
    this.page.set(1);
    this.actionError.set(null);
    this.load();
  }

  goTo(page: number): void {
    if (page < 1) return;
    this.page.set(page);
    this.actionError.set(null);
    this.load();
  }

  hasMore(): boolean {
    return this.list().length === this.pageSize;
  }

  load(): void {
    const id = ++this.requestId;
    this.loading.set(true);
    this.error.set(null);

    this.adminOrders.getOrders(this.status(), this.page(), this.pageSize).subscribe({
      next: (orders) => {
        if (id !== this.requestId) return; // رد قديم
        this.list.set(orders);
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        if (id !== this.requestId) return;
        this.list.set([]);
        this.error.set(
          err.status === 0
            ? 'ADMIN_ORDERS.ERR_NETWORK'
            : err.status === 403
              ? 'ADMIN_ORDERS.ERR_FORBIDDEN'
              : 'ADMIN_ORDERS.ERR_LOAD',
        );
        this.loading.set(false);
      },
    });
  }

  /** الحالات اللي الأوردر ده يقدر يتحول لها */
  transitionsFor(order: AdminOrderListItem): OrderStatus[] {
    return ORDER_TRANSITIONS[order.status] ?? [];
  }

  /** مفتاح الترجمة للزرار. تأكيد أوردر التحويل اسمه "تأكيد الدفع" */
  actionKey(order: AdminOrderListItem, target: OrderStatus): string {
    return target === 'Confirmed' && order.status === 'AwaitingPaymentReview'
      ? 'ADMIN_ORDERS.ACTION_ConfirmPayment'
      : `ADMIN_ORDERS.ACTION_${target}`;
  }

  actionClass(target: OrderStatus): string {
    return target === 'Rejected' || target === 'Cancelled'
      ? 'border-red-300 text-red-700 hover:bg-red-50'
      : 'border-indigo-300 text-indigo-700 hover:bg-indigo-50';
  }

  changeStatus(order: AdminOrderListItem, target: OrderStatus): void {
    if (this.updatingId() !== null) return;

    if (
      CONFIRM_BEFORE.includes(target) &&
      !window.confirm(this.translate.instant(`ADMIN_ORDERS.CONFIRM_${target}`, { id: order.id }))
    ) {
      return;
    }

    this.updatingId.set(order.id);
    this.actionError.set(null);

    this.adminOrders.updateStatus(order.id, target).subscribe({
      next: () => {
        this.applyUpdate(order.id, target);
        this.updatingId.set(null);
      },
      error: (err: HttpErrorResponse) => {
        this.actionError.set(
          err.status === 0
            ? 'ADMIN_ORDERS.ERR_NETWORK'
            : err.status === 404
              ? 'ADMIN_ORDERS.ERR_NOT_FOUND'
              : err.status === 403
                ? 'ADMIN_ORDERS.ERR_FORBIDDEN'
                : 'ADMIN_ORDERS.ERR_UPDATE',
        );
        this.updatingId.set(null);

        // 400 / 404 معناها إن الحالة اتغيرت من مكان تاني، فنحدّث القايمة
        if (err.status === 400 || err.status === 404) this.load();
      },
    });
  }

  /** لو الفلتر مش "الكل" والحالة الجديدة خارجه، الصف يختفي. غير كده نحدّث الحالة في مكانها. */
  private applyUpdate(id: number, newStatus: OrderStatus): void {
    const filter = this.status();
    this.list.update((items) =>
      filter && filter !== newStatus
        ? items.filter((i) => i.id !== id)
        : items.map((i) => (i.id === id ? { ...i, status: newStatus } : i)),
    );
  }

  /** ألوان الشارة حسب الحالة. أي حالة جديدة بتاخد اللون الرمادي. */
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