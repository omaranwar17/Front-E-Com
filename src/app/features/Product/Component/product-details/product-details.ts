import { CurrencyPipe } from '@angular/common';
import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { catchError, map, of, switchMap, tap } from 'rxjs';
import { IProduct } from '../../../../shared/Interfases/IProduct';
import { ProductService } from '../../Service/product-service';
import { BasketService } from '../../../Carts/Service/BasketService';
import { ToastrService } from 'ngx-toastr';

@Component({
  imports: [RouterLink, TranslatePipe, CurrencyPipe],
  selector: 'app-product-details',
  styleUrl: './product-details.scss',
  templateUrl: './product-details.html',
})
export class ProductDetails implements OnInit {

  private _route = inject(ActivatedRoute);
  private productService = inject(ProductService);
  private translate = inject(TranslateService);
   private toastr = inject(ToastrService);
  private destroyRef = inject(DestroyRef);
  private readonly basket = inject(BasketService);

  readonly imageBase = 'https://localhost:7020'; // ⚠️ انسخ القيمة الفعلية من ProductList
  readonly maxQuantity = 99;

  product = signal<IProduct | null>(null);
  loading = signal(true);
  selectedPhoto = signal<string | null>(null);

  quantity = signal(1);
  wishlisted = signal(false);

  photos = computed(() => this.product()?.photos?.map((p) => p.imageName) ?? []);
  mainPhoto = computed(() => this.selectedPhoto() ?? this.photos()[0] ?? null);

  discount = computed(() => {
    const p = this.product();
    if (!p || !p.oldPrice || p.oldPrice <= p.newPrice) return 0;
    return Math.round(((p.oldPrice - p.newPrice) / p.oldPrice) * 100);
  });

  total = computed(() => (this.product()?.newPrice ?? 0) * this.quantity());

  ngOnInit(): void {
    // paramMap (مش snapshot) عشان لو الـ id اتغير والـ component اتعاد استخدامه
    this._route.paramMap
      .pipe(
        map((params) => Number(params.get('id'))),
        tap(() => {
          this.loading.set(true);
          this.selectedPhoto.set(null);
          this.quantity.set(1);
          this.wishlisted.set(false);
        }),
        switchMap((id) =>
          Number.isInteger(id) && id > 0
            ? this.productService.getProductById(id).pipe(catchError(() => of(null)))
            : of(null)
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((p) => {
        this.product.set(p);
        this.loading.set(false);
      });
  }

  photoUrl(name: string): string {
    const base = this.imageBase.replace(/\/+$/, '');
    return `${base}/${name.replace(/^\/+/, '')}`;
  }

  increase(): void {
    this.quantity.update((q) => Math.min(q + 1, this.maxQuantity));
  }

  decrease(): void {
    this.quantity.update((q) => Math.max(q - 1, 1));
  }

  setQuantity(event: Event): void {
    const input = event.target as HTMLInputElement;
    const parsed = Math.floor(Number(input.value));
    const next = Number.isFinite(parsed) ? Math.min(Math.max(parsed, 1), this.maxQuantity) : 1;
    this.quantity.set(next);
    input.value = String(next); // لو القيمة اتصلحت لنفس قيمة الـ signal، الـ DOM مش هيتحدّث لوحده
  }

  toggleWishlist(): void {
    this.wishlisted.update((v) => !v);
  }

//    addToCart(product: IProduct): void {
//   this.basket.addProduct(product).subscribe({
//     next: () => this.toastr.success(product.name),
//     error: (e) => {
//       console.error('Add to cart failed', e.status, e.error);
//       this.toastr.error(this.translate.instant('COMMON.SOMETHING_WRONG'));
//     },
//   });
// }

addToCart(product: IProduct): void {
  // بنقرأ الكمية الحالية من الـ Signal
  const selectedQty = this.quantity(); 

  // بنبعتها للسيرفس
  this.basket.addProduct(product, selectedQty).subscribe({
    next: () => this.toastr.success(product.name),
    error: (e) => {
      console.error('Add to cart failed', e.status, e.error);
      this.toastr.error(this.translate.instant('COMMON.SOMETHING_WRONG'));
    },
  });
}

buyNow(product: IProduct): void {
  const selectedQty = this.quantity();
  this.basket.addProduct(product, selectedQty).subscribe({
    next: () => {
      // بعد الإضافة، نروح لصفحة السلة (أو الـ Checkout)
      // تأكد إنك معمل inject للـ Router فوق
      // this.router.navigate(['/Carts']); 
      this.toastr.success('تمت الإضافة، جاري تحويلك...');
    },
    error: (e) => this.toastr.error(this.translate.instant('COMMON.SOMETHING_WRONG'))
  });
}
   

  
}