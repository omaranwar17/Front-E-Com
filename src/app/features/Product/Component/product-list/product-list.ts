import { Component, EventEmitter, inject, Input, Output, signal } from '@angular/core';
import { IProduct } from '../../../../shared/Interfases/IProduct';
import { CommonModule } from '@angular/common';
import { LanguageService } from '../../../../core/services/language-service';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  imports: [CommonModule , TranslatePipe],
  selector: 'app-product-list',
  styleUrl: './product-list.scss',
  templateUrl: './product-list.html',
})
export class ProductList {
 @Input() products: IProduct[] = [];
  @Input() total = 0;
    readonly imageBase = 'https://localhost:7020/';
  langService = inject(LanguageService);
    private selectedPhotos = signal<Record<number, string>>({});

  mainPhoto(product: IProduct): string | null {
    return this.selectedPhotos()[product.id] ?? product.photos?.[0]?.imageName ?? null;
  }

  selectPhoto(product: IProduct, imageName: string): void {
    if (this.selectedPhotos()[product.id] === imageName) return;
    this.selectedPhotos.update((s) => ({ ...s, [product.id]: imageName }));
  }

  // نسبة الخصم (0 لو مفيش خصم فعلي)
  discount(product: IProduct): number {
    if (!product.oldPrice || product.oldPrice <= product.newPrice) return 0;
    return Math.round((1 - product.newPrice / product.oldPrice) * 100);
  }
}
