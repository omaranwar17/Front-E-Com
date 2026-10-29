import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { OrderService } from '../../Service/order-service';
import { Order } from '../../../../shared/Interfases/order';
import { translate, TranslatePipe } from '@ngx-translate/core';
         // ⚠️ عدّل المسار

@Component({
  selector: 'app-order-details-component',
  standalone: true,
  imports: [CommonModule, RouterLink , TranslatePipe],
  templateUrl: './order-details-component.html',
  styleUrl: './order-details-component.scss',
})
export class OrderDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private orderService = inject(OrderService);

  order = signal<Order | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);


  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (!idParam) {
      this.error.set('رقم الطلب غير صحيح');
      this.loading.set(false);
      return;
    }

    const orderId = Number(idParam);

    this.orderService.getMyOrder(orderId).subscribe({
      next: (data) => {
        this.order.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err?.error?.message ?? 'حدث خطأ أثناء جلب الطلب');
        this.loading.set(false);
      },
    });
  }

  // لون البادج حسب الحالة
  statusClass(status: string): string {
    switch (status) {
      case 'Pending':         return 'bg-yellow-100 text-yellow-800';
      case 'Confirmed':       return 'bg-blue-100 text-blue-800';
      case 'Shipped':         return 'bg-indigo-100 text-indigo-800';
      case 'Delivered':       return 'bg-green-100 text-green-800';
      case 'Cancelled':       return 'bg-red-100 text-red-800';
      case 'AwaitingPaymentReview': return 'bg-orange-100 text-orange-800';
      default:                return 'bg-gray-100 text-gray-800';
    }
  }

getImageUrl(url: string | null | undefined): string {
  if (!url) return 'assets/placeholder.png'; // صورة افتراضية لو مفيش صورة
  
  // لو المسار أصلاً كامل (بيبدأ بـ http)
  if (url.startsWith('http')) return url;
  
  // ضيف الـ API URL (عدل البورت والـ path حسب الباك إند بتاعك)
  const apiBaseUrl = 'https://localhost:7020'; 
  return `${apiBaseUrl}/${url.replace(/^\/+/, '')}`;
}
}
