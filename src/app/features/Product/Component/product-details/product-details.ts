import { CurrencyPipe } from '@angular/common';
import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { catchError, map, of, switchMap, tap } from 'rxjs';
import { IProduct } from '../../../../shared/Interfases/IProduct';
import { ProductService } from '../../Service/product-service';

@Component({
  imports: [RouterLink, TranslatePipe, CurrencyPipe],
  selector: 'app-product-details',
  styleUrl: './product-details.scss',
  templateUrl: './product-details.html',
})
export class ProductDetails {

 private _route = inject(ActivatedRoute);
  private productService = inject(ProductService);
  private destroyRef = inject(DestroyRef);

  readonly imageBase = 'https://localhost:7020'; // ⚠️ انسخ القيمة الفعلية من ProductList

  product = signal<IProduct | null>(null);
  loading = signal(true);
  selectedPhoto = signal<string | null>(null);

  photos = computed(() => this.product()?.photos?.map((p) => p.imageName) ?? []);
  mainPhoto = computed(() => this.selectedPhoto() ?? this.photos()[0] ?? null);

  discount = computed(() => {
    const p = this.product();
    if (!p || !p.oldPrice || p.oldPrice <= p.newPrice) return 0;
    return Math.round(((p.oldPrice - p.newPrice) / p.oldPrice) * 100);
  });

  ngOnInit(): void {
    // paramMap (مش snapshot) عشان لو الـ id اتغير والـ component اتعاد استخدامه
    this._route.paramMap
      .pipe(
        map((params) => Number(params.get('id'))),
        tap(() => {
          this.loading.set(true);
          this.selectedPhoto.set(null);
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
}
