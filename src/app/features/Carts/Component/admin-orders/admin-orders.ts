import { Component, computed, inject, signal, OnDestroy } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';

import { AdminOrderListItem, OrderStatus } from '../../../../shared/Interfases/order';
import { OrderService } from '../../Service/order-service';
import { RouterLink } from '@angular/router';

const ORDER_TRANSITIONS: Partial<Record<OrderStatus, OrderStatus[]>> = {
  AwaitingPaymentReview: ['Confirmed', 'Rejected', 'Cancelled'],
  Pending: ['Confirmed', 'Cancelled'],
  Confirmed: ['Shipped', 'Cancelled'],
  Shipped: ['Delivered'],
};

const CONFIRM_BEFORE: OrderStatus[] = ['Rejected', 'Cancelled'];

interface ConfirmDialog {
  titleKey: string;
  messageKey: string;
  confirmKey: string;
  id: number;
  danger: boolean;
  onConfirm: () => void;
}

@Component({
  selector: 'app-admin-orders',
  imports: [CurrencyPipe, DatePipe, TranslatePipe, RouterLink],
  templateUrl: './admin-orders.html',
})
export class AdminOrders implements OnDestroy {
  private readonly adminOrders = inject(OrderService);
  private readonly translate = inject(TranslateService);
  private readonly toastr = inject(ToastrService);
  private readonly sanitizer = inject(DomSanitizer);

  readonly pageSize = 10;

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

  readonly status = signal<OrderStatus | null>(null);
  readonly page = signal(1);
  readonly list = signal<AdminOrderListItem[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  readonly updatingId = signal<number | null>(null);
  readonly actionError = signal<string | null>(null);

  // متغير عشان نتحكم في فتح وقفل الدروب داون
  readonly openDropdownId = signal<number | null>(null);

  // حالة عرض الإيصال
  readonly receiptOrderId = signal<number | null>(null);
  readonly receiptUrl = signal<SafeUrl | null>(null);
  readonly receiptLoading = signal(false);
  private rawReceiptUrl: string | null = null;

  // حالة مودال التأكيد (بديل window.confirm)
  readonly confirmDialog = signal<ConfirmDialog | null>(null);

  // دالة بتحسب أرقام الصفحات اللي تظهر في الباجينيشن
  readonly pageNumbers = computed(() => {
    const pages = [];
    let start = Math.max(1, this.page() - 1);
    let end = start + 2;

    if (this.page() > 1 && !this.hasMore()) {
      start = this.page() - 2;
      end = this.page();
    }

    for (let i = start; i <= end; i++) {
      if (i > 0) pages.push(i);
    }
    return pages;
  });

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
        if (id !== this.requestId) return;
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
              : 'ADMIN_ORDERS.ERR_LOAD'
        );
        this.loading.set(false);
      },
    });
  }

  transitionsFor(order: AdminOrderListItem): OrderStatus[] {
    return ORDER_TRANSITIONS[order.status] ?? [];
  }

  actionKey(order: AdminOrderListItem, target: OrderStatus): string {
    return target === 'Confirmed' && order.status === 'AwaitingPaymentReview'
      ? 'ADMIN_ORDERS.ACTION_ConfirmPayment'
      : `ADMIN_ORDERS.ACTION_${target}`;
  }

  actionClass(target: OrderStatus): string {
    return target === 'Rejected' || target === 'Cancelled'
      ? 'text-red-600 font-medium'
      : 'text-gray-700';
  }

  // دالة فتح وقفل الدروب داون
  toggleDropdown(id: number): void {
    if (this.openDropdownId() === id) {
      this.openDropdownId.set(null);
    } else {
      this.openDropdownId.set(id);
    }
  }

  // ===== تغيير الحالة =====
  changeStatus(order: AdminOrderListItem, target: OrderStatus): void {
    if (this.updatingId() !== null) return;

    if (CONFIRM_BEFORE.includes(target)) {
      this.confirmDialog.set({
        titleKey: 'ADMIN_ORDERS.CONFIRM_TITLE',
        messageKey: `ADMIN_ORDERS.CONFIRM_${target}`,
        confirmKey: `ADMIN_ORDERS.ACTION_${target}`,
        id: order.id,
        danger: true,
        onConfirm: () => this.performStatusChange(order, target),
      });
      return;
    }

    this.performStatusChange(order, target);
  }

  private performStatusChange(order: AdminOrderListItem, target: OrderStatus): void {
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
                : 'ADMIN_ORDERS.ERR_UPDATE'
        );
        this.updatingId.set(null);

        if (err.status === 400 || err.status === 404) this.load();
      },
    });
  }

  private applyUpdate(id: number, newStatus: OrderStatus): void {
    const filter = this.status();
    this.list.update((items) =>
      filter && filter !== newStatus
        ? items.filter((i) => i.id !== id)
        : items.map((i) => (i.id === id ? { ...i, status: newStatus } : i))
    );
  }

  // ===== الحذف (للطلبات الملغاة فقط) =====
  canDelete(order: AdminOrderListItem): boolean {
    return order.status === 'Cancelled';
  }

  deleteOrder(order: AdminOrderListItem): void {
    if (this.updatingId() !== null || !this.canDelete(order)) return;

    this.confirmDialog.set({
      titleKey: 'ADMIN_ORDERS.DELETE_TITLE',
      messageKey: 'ADMIN_ORDERS.CONFIRM_DELETE',
      confirmKey: 'ADMIN_ORDERS.DELETE',
      id: order.id,
      danger: true,
      onConfirm: () => this.performDelete(order),
    });
  }

  private performDelete(order: AdminOrderListItem): void {
    this.updatingId.set(order.id);
    this.actionError.set(null);

    this.adminOrders.deleteOrder(order.id).subscribe({
      next: () => {
        this.updatingId.set(null);
        this.toastr.success(
          this.translate.instant('ADMIN_ORDERS.DELETED', { id: order.id }),
          this.translate.instant('COMMON.SUCCESS'),
        );
        // لو ده آخر عنصر في صفحة غير الأولى، ارجع صفحة
        if (this.list().length === 1 && this.page() > 1) {
          this.page.update((p) => p - 1);
        }
        // reload عشان الباجينيشن يفضل دقيق (العناصر بتتزحزح بين الصفحات)
        this.load();
      },
      error: (err: HttpErrorResponse) => {
        this.updatingId.set(null);
        this.actionError.set(
          err.status === 0
            ? 'ADMIN_ORDERS.ERR_NETWORK'
            : err.status === 403
              ? 'ADMIN_ORDERS.ERR_FORBIDDEN'
              : err.status === 404
                ? 'ADMIN_ORDERS.ERR_NOT_FOUND'
                : err.status === 400 || err.status === 409
                  ? 'ADMIN_ORDERS.ERR_DELETE_NOT_ALLOWED'
                  : 'ADMIN_ORDERS.ERR_DELETE'
        );
        if (err.status === 400 || err.status === 404 || err.status === 409) this.load();
      },
    });
  }

  // ===== مودال التأكيد =====
  acceptConfirm(): void {
    const dialog = this.confirmDialog();
    this.confirmDialog.set(null);
    dialog?.onConfirm();
  }

  closeConfirm(): void {
    this.confirmDialog.set(null);
  }

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

  // دالة طباعة الفاتورة للأدمن
  printInvoice(orderId: number): void {
    this.adminOrders.downloadInvoice(orderId, 'admin').subscribe({
      next: (blob: Blob) => {
        const fileURL = URL.createObjectURL(blob);
        const newWindow = window.open(fileURL, '_blank');
        if (newWindow) {
          newWindow.onload = () => newWindow.print();
        }
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error downloading invoice', err);
        const errorMsg = this.translate.instant('MY_ORDERS.ERR_INVOICE');
        const errorTitle = this.translate.instant('COMMON.ERROR');
        this.toastr.error(errorMsg, errorTitle);
      },
    });
  }

  // عرض الإيصال
  viewReceipt(orderId: number): void {
    this.closeReceipt();
    this.receiptOrderId.set(orderId);
    this.receiptLoading.set(true);

    this.adminOrders.getReceipt(orderId).subscribe({
      next: (blob: Blob) => {
        this.rawReceiptUrl = URL.createObjectURL(blob);
        this.receiptUrl.set(this.sanitizer.bypassSecurityTrustUrl(this.rawReceiptUrl));
        this.receiptLoading.set(false);
      },
      error: () => {
        this.receiptLoading.set(false);
        this.receiptOrderId.set(null);
        this.toastr.error(
          this.translate.instant('ADMIN_ORDERS.ERR_RECEIPT'),
          this.translate.instant('COMMON.ERROR'),
        );
      },
    });
  }

  closeReceipt(): void {
    if (this.rawReceiptUrl) URL.revokeObjectURL(this.rawReceiptUrl);
    this.rawReceiptUrl = null;
    this.receiptUrl.set(null);
    this.receiptOrderId.set(null);
    this.receiptLoading.set(false);
  }

  ngOnDestroy(): void {
    this.closeReceipt();
  }
}