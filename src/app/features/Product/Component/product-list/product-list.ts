import { Component, EventEmitter, HostListener, inject, Input, Output, signal } from '@angular/core';
import { IProduct } from '../../../../shared/Interfases/IProduct';
import { CommonModule } from '@angular/common';
import { LanguageService } from '../../../../core/services/language-service';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Route, Router, RouterLink } from '@angular/router';
import { ProductService } from '../../Service/product-service';
import { ToastrService } from 'ngx-toastr';

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
    private toastr = inject(ToastrService);
  @Output() deleted = new EventEmitter<void>();
  productToDelete = signal<IProduct | null>(null);
deleting = signal(false);
deleteError = signal('');
private translate = inject(TranslateService);
private _productService = inject(ProductService);
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
  this.closeMenu();
  this.deleteError.set('');
  this.productToDelete.set(product);
}

cancelDelete(): void {
  if (this.deleting()) return; // ماتقفلش وقت الحذف
  this.productToDelete.set(null);
}



confirmDelete(): void {
  const product = this.productToDelete();
  if (!product || this.deleting()) return;

  this.deleting.set(true);
  this.deleteError.set('');

  this._productService.deleteProduct(product.id).subscribe({
    next: () => {
      this.deleting.set(false);
      this.productToDelete.set(null);
      
      // استخدام translate.instant بدل الـ Pipe
      const title = this.translate.instant('COMMON.SUCCESS');
      const msg = this.translate.instant('Product.DELETE_SUCCESS');
      
      this.toastr.success(msg, title);
      
      this.deleted.emit();
    },
    error: (err) => {
      console.error('Delete failed', err);
      this.deleting.set(false);
      
      const errorMsgKey = err?.error?.message || 'COMMON.SOMETHING_WRONG';
      
      // لو الباك إند بيرجع نص مش مفتاح ترجمة، هيفضل زي ما هو.. لو بيرجع مفتاح، هيترجم
      this.deleteError.set(errorMsgKey); 
      
      const title = this.translate.instant('Product.DELETE_FAILED'); // أو COMMON.ERROR
      const msg = this.translate.instant(errorMsgKey);
      
      this.toastr.error(msg, title);
    },
  });
}

@HostListener('document:keydown.escape')
onEscape(): void {
  this.cancelDelete();
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
