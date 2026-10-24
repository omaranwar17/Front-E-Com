import { TranslatePipe } from '@ngx-translate/core';
import { IProduct } from '../../../../shared/Interfases/IProduct';
import { IPagnation } from '../../../../shared/Interfases/Pagnation';
import { Categorys } from '../categorys/categorys';
import { ProductList } from '../product-list/product-list';
import { ProductService } from './../../Service/product-service';
import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { LanguageService } from '../../../../core/services/language-service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, EMPTY, Subject, switchMap } from 'rxjs';

@Component({
  imports: [ProductList , Categorys , TranslatePipe],
  selector: 'app-product',
  styleUrl: './product.scss',
  templateUrl: './product.html',
})
export class Product implements OnInit {

 langService = inject(LanguageService);
  private destroyRef = inject(DestroyRef);

  constructor(private _ProductService: ProductService) {}

  // State اللي بيتعرض في الـ template
  products = signal<IProduct[]>([]);
  pageNumber = signal(1);
  totalCount = signal(0);
  readonly pageSize = 9;

  totalPages = computed(() =>
    Math.max(1, Math.ceil(this.totalCount() / this.pageSize))
  );

  pages = computed(() => {
    const total = this.totalPages();
    const current = this.pageNumber();
    const windowSize = 5;
    let start = Math.max(1, current - Math.floor(windowSize / 2));
    const end = Math.min(total, start + windowSize - 1);
    start = Math.max(1, end - windowSize + 1);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  });

  // Filters state (name | price | price_desc | newest)
  private searchText = '';
  private categoryId: number | null = null;
  private sort = 'name';

  private load$ = new Subject<void>();

  ngOnInit(): void {
    this.load$
      .pipe(
        switchMap(() =>
          this._ProductService
            .getProducts({
              search: this.searchText,
              categoryId: this.categoryId,
              sort: this.sort,
              pageNumber: this.pageNumber(),
              pageSize: this.pageSize,
            })
            .pipe(
              catchError((err) => {
                console.error('Error fetching products', err);
                return EMPTY;
              })
            )
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((res) => {
        this.products.set(res.data ?? []);
        this.totalCount.set(res.totalCount ?? 0);

        // لو الصفحة الحالية بقت أكبر من الإجمالي، نرجع لآخر صفحة صالحة
        if (this.pageNumber() > this.totalPages()) {
          this.pageNumber.set(this.totalPages());
          this.load$.next();
        }
      });

    this.load$.next();
  }

  handleSearch(searchText: string) {
    this.searchText = searchText?.trim() ?? '';
    this.resetAndLoad();
  }

  handleCategory(categoryId: number | null) {
    this.categoryId = categoryId;
    this.resetAndLoad();
  }

  handleSort(sortValue: string) {
    this.sort = sortValue;
    this.resetAndLoad();
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages() || page === this.pageNumber()) return;
    this.pageNumber.set(page);
    this.load$.next();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // أي تغيير في الفلاتر يرجع لأول صفحة
  private resetAndLoad() {
    this.pageNumber.set(1);
    this.load$.next();
  }



}
