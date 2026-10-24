import { Component, EventEmitter, HostListener, inject, Input, Output, signal } from '@angular/core';
import { IProduct } from '../../../../shared/Interfases/IProduct';
import { CommonModule } from '@angular/common';
import { LanguageService } from '../../../../core/services/language-service';
import { TranslatePipe } from '@ngx-translate/core';
import { Route, Router, RouterLink } from '@angular/router';

@Component({
  imports: [CommonModule, TranslatePipe, RouterLink],
  selector: 'app-product-list',
  styleUrl: './product-list.scss',
  templateUrl: './product-list.html',
})
export class ProductList {
 @Input() products: IProduct[] = [];
  @Input() total = 0;
  constructor(private _router:Router){}
    readonly imageBase = 'https://localhost:7020/';
  langService = inject(LanguageService);
    private selectedPhotos = signal<Record<number, string>>({});
    openMenuId = signal<number | null>(null);
@HostListener('document:click')
@HostListener('document:keydown.escape')
closeMenu(): void {
  this.openMenuId.set(null);
}

toggleMenu(event: Event, id: number): void {
  event.stopPropagation(); // عشان الـ click مايقفلش المنيو فوراً
  this.openMenuId.update(current => (current === id ? null : id));
}


onEdit(product: IProduct): void {
  this.closeMenu();
 this._router.navigate(['/products/edit', product.id]);
}

onDelete(product: IProduct): void {

}


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
