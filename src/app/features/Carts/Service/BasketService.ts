import { computed, inject, Service, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, map, Observable, of, tap, throwError } from 'rxjs';
import { BasketItem, Carts, IBasketTotal } from '../../../shared/Interfases/basket';

export type NewBasketItem = Omit<BasketItem, 'qunatity'>;

/** الحقول المطلوبة من IProduct عشان تتحول لعنصر سلة */
export interface BasketProductSource {
  id: number;
  name: string;
  newPrice: number;
  categoryName: string;
  photos?: { imageName: string }[];
}

const FALLBACK_IMAGE = 'assets/placeholder.png'; // غيّرها لصورة موجودة عندك

@Service()
export class BasketService {
  private readonly http = inject(HttpClient);

  private readonly baseUrl = 'https://localhost:7020/api/Basket';
  private readonly storageKey = 'basket_id';

  private readonly FREE_SHIPPING_THRESHOLD = 30000;
  private readonly SHIPPING_FEE = 50; // غيّرها لرسوم الشحن الحقيقية

  private readonly _basket = signal<Carts | null>(null);
  readonly basket = this._basket.asReadonly();

  readonly items = computed<BasketItem[]>(() => this._basket()?.basketItems ?? []);

  readonly itemCount = computed(() =>
    this.items().reduce((sum, i) => sum + i.qunatity, 0)
  );

  readonly subtotal = computed(() =>
    this.items().reduce((sum, i) => sum + i.price * i.qunatity, 0)
  );

  readonly shipping = computed(() => {
    const sub = this.subtotal();
    if (sub === 0) return 0; // السلة فاضية
    return sub > this.FREE_SHIPPING_THRESHOLD ? 0 : this.SHIPPING_FEE;
  });

  readonly total = computed(() => this.subtotal() + this.shipping());

  /** alias قديم عشان أي مكان لسه بيستخدم totalPrice ما يتكسرش */
  readonly totalPrice = this.total;

  /** الثلاثة مع بعض كـ object */
  readonly totals = computed<IBasketTotal>(() => ({
    shipping: this.shipping(),
    subtotal: this.subtotal(),
    total: this.total(),
  }));

  // ---------- Public API ----------

  loadBasket(): Observable<Carts> {
    const id = this.getBasketId();
    return this.http.get<Carts>(`${this.baseUrl}/${id}`).pipe(
      map((basket) => this.normalize(basket, id)),
      tap((basket) => this._basket.set(basket))
    );
  }

  /** مرّر IProduct مباشرة: بيتحول لـ BasketItem بالحقول الستة بس. */
  addProduct(product: BasketProductSource, quantity = 1): Observable<Carts> {
    return this.addItem(
      {
        id: product.id,
        name: product.name,
        image: product.photos?.[0]?.imageName || FALLBACK_IMAGE, // الـ API بيرفض الـ string الفاضي
        price: product.newPrice,
        category: product.categoryName || 'Uncategorized', // الـ API بيرفض الـ string الفاضي
      },
      quantity
    );
  }

  addItem(item: NewBasketItem, quantity = 1): Observable<Carts> {
    if (!Number.isInteger(quantity) || quantity < 1) {
      return throwError(() => new Error('Quantity must be a positive integer.'));
    }

    const current = this.items();
    const exists = current.some((i) => i.id === item.id);

    const next: BasketItem[] = exists
      ? current.map((i) =>
          i.id === item.id ? { ...i, qunatity: i.qunatity + quantity } : i
        )
      : [
          ...current,
          {
            // حقول صريحة بس، عشان أي حقل زيادة ما يتبعتش للـ API
            id: item.id,
            name: item.name,
            image: item.image,
            price: item.price,
            category: item.category,
            qunatity: quantity,
          },
        ];

    return this.save(next);
  }

  incrementItem(itemId: number): Observable<Carts> {
    return this.save(
      this.items().map((i) =>
        i.id === itemId ? { ...i, qunatity: i.qunatity + 1 } : i
      )
    );
  }

  decrementItem(itemId: number): Observable<Carts> {
    const next = this.items()
      .map((i) => (i.id === itemId ? { ...i, qunatity: i.qunatity - 1 } : i))
      .filter((i) => i.qunatity > 0);
    return this.save(next);
  }

  removeItem(itemId: number): Observable<Carts> {
    return this.save(this.items().filter((i) => i.id !== itemId));
  }

  clearBasket(): Observable<void> {
    const id = this.getBasketId();
    const previous = this._basket();

    this._basket.set({ id, basketItems: [] });

    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(
      catchError((err: HttpErrorResponse) => {
        if (err.status === 404) return of(void 0);
        this._basket.set(previous);
        return throwError(() => err);
      })
    );
  }

  // ---------- Internals ----------

  private save(basketItems: BasketItem[]): Observable<Carts> {
    const id = this.getBasketId();
    const previous = this._basket();
    const payload: Carts = { id, basketItems };

    this._basket.set(payload);

    return this.http.post<Carts>(this.baseUrl, payload).pipe(
      map(() => payload),
      catchError((err: HttpErrorResponse) => {
        this._basket.set(previous);
        return throwError(() => err);
      })
    );
  }

  private normalize(basket: Carts | null, id: string): Carts {
    return { id: basket?.id || id, basketItems: basket?.basketItems ?? [] };
  }

  private getBasketId(): string {
    try {
      let id = localStorage.getItem(this.storageKey);
      if (!id) {
        id = crypto.randomUUID();
        localStorage.setItem(this.storageKey, id);
      }
      return id;
    } catch {
      return this._basket()?.id ?? crypto.randomUUID();
    }
  }
}