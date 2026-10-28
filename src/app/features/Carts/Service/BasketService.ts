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
    size?: string | null;
  photos?: { imageName: string }[];
}

const FALLBACK_IMAGE = 'assets/placeholder.png'; // غيّرها لصورة موجودة عندك
const LEGACY_STORAGE_KEY = 'basket_id';
// السيرفر بيستبدل الـ id بالـ key المبني على اليوزر، فالقيمة هنا شكلية
const PLACEHOLDER_ID = 'pending';

@Service()
export class BasketService {
  private readonly http = inject(HttpClient);

  // السيرفر بيحدد السلة من التوكن، فمفيش id في الـ URL
  private readonly baseUrl = 'https://localhost:7020/api/Basket';

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

  constructor() {
    // تنظيف الـ id القديم اللي كان متخزن قبل ربط السلة باليوزر
    try {
      localStorage.removeItem(LEGACY_STORAGE_KEY);
    } catch {
      /* التخزين مش متاح، مفيش مشكلة */
    }
  }

  // ---------- Public API ----------

  /** بيحمّل سلة اليوزر الحالي. بيرجّع 401 لو مش عامل login. */
  loadBasket(): Observable<Carts> {
    return this.http.get<Carts>(this.baseUrl).pipe(
      map((basket) => this.normalize(basket)),
      tap((basket) => this._basket.set(basket))
    );
  }

  /** بيفضّي السلة محلياً بس (عند الـ logout). مبيمسحش حاجة من السيرفر. */
  reset(): void {
    this._basket.set(null);
  }

  /** مرّر IProduct مباشرة: بيتحول لـ BasketItem بالحقول الستة بس. */
 addProduct(product: BasketProductSource, quantity = 1): Observable<Carts> {
  return this.addItem(
    {
      id: product.id,
      name: product.name,
      image: product.photos?.[0]?.imageName || FALLBACK_IMAGE, 
      price: product.newPrice,
      category: product.categoryName || 'Uncategorized', 
      size: product.size || null, // ✅ ضيف السطر ده عشان يتبعت
    },
    quantity
  );
}

 addItem(item: NewBasketItem & { size?: string | null }, quantity = 1): Observable<Carts> {
  if (!Number.isInteger(quantity) || quantity < 1) {
    return throwError(() => new Error('Quantity must be a positive integer.'));
  }

  const current = this.items();
  
  // ✅ 1. بنقارن بالـ id والـ size (عشان التيشيرت XS مختلف عن التيشيرت L)
  const exists = current.some((i) => i.id === item.id && i.size === item.size);

  const next: BasketItem[] = exists
    ? current.map((i) =>
        (i.id === item.id && i.size === item.size) 
          ? { ...i, qunatity: i.qunatity + quantity } 
          : i
      )
    : [
        ...current,
        {
          id: item.id,
          name: item.name,
          image: item.image,
          price: item.price,
          category: item.category,
          qunatity: quantity,
          size: item.size || null, // ✅ 2. بنحفظ المقاس هنا
        },
      ];

  return this.save(next);
}

 incrementItem(itemId: number, size: string | null | undefined): Observable<Carts> {
  return this.save(
    this.items().map((i) => (i.id === itemId && i.size === size) ? { ...i, qunatity: i.qunatity + 1 } : i)
  );
}

decrementItem(itemId: number, size: string | null | undefined): Observable<Carts> {
  const next = this.items()
    .map((i) => (i.id === itemId && i.size === size) ? { ...i, qunatity: i.qunatity - 1 } : i)
    .filter((i) => i.qunatity > 0);
  return this.save(next);
}

removeItem(itemId: number, size: string | null | undefined): Observable<Carts> {
  return this.save(this.items().filter((i) => !(i.id === itemId && i.size === size)));
}

  clearBasket(): Observable<void> {
    const previous = this._basket();

    this._basket.set({ id: previous?.id || PLACEHOLDER_ID, basketItems: [] });

    return this.http.delete<void>(this.baseUrl).pipe(
      catchError((err: HttpErrorResponse) => {
        if (err.status === 404) return of(void 0);
        this._basket.set(previous);
        return throwError(() => err);
      })
    );
  }

  // ---------- Internals ----------

  private save(basketItems: BasketItem[]): Observable<Carts> {
    const previous = this._basket();
    const payload: Carts = { id: previous?.id || PLACEHOLDER_ID, basketItems };

    this._basket.set(payload);

    return this.http.post<Carts>(this.baseUrl, payload).pipe(
      map(() => payload),
      catchError((err: HttpErrorResponse) => {
        this._basket.set(previous);
        return throwError(() => err);
      })
    );
  }

  private normalize(basket: Carts | null): Carts {
    return { id: basket?.id || PLACEHOLDER_ID, basketItems: basket?.basketItems ?? [] };
  }
}