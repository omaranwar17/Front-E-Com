import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, finalize, firstValueFrom, map, of, switchMap, tap, timeout } from 'rxjs';
import { BasketService } from '../../Carts/Service/BasketService';
import { environment } from '../../../../environments/environment';

export interface CurrentUser {
  email: string;
  userName: string;
  roles: string[];
}

export const API = `${environment.apiUrl}/api/Acount`;


@Injectable({ providedIn: 'root' })
export class Auth {
  private http = inject(HttpClient);
  private basket = inject(BasketService);

  user = signal<CurrentUser | null>(null);
  isLoggedIn = computed(() => this.user() !== null);
  isAdmin = computed(() => this.user()?.roles.includes('Admin') ?? false);

  async load(): Promise<void> {
    try {
      const me = await firstValueFrom(
        this.http.get<CurrentUser>(`${API}/me`).pipe(
          timeout(5000),
          catchError(() => of(null))
        )
      );
      this.user.set(me);

      if (me) {
        await firstValueFrom(
          this.basket.loadBasket().pipe(
            timeout(5000),
            catchError(() => of(null))
          )
        );
      } else {
        this.basket.reset();
      }
    } catch {
      this.user.set(null);
      this.basket.reset();
    }
  }

  login(email: string, password: string): Observable<CurrentUser> {
    return this.http.post(`${API}/login`, { email, password }).pipe(
      switchMap(() => this.http.get<CurrentUser>(`${API}/me`)),
      tap((me) => {
        this.user.set(me);
        this.basket.reset(); // نتأكد إن مفيش سلة يوزر سابق باقية
      }),
      // فشل تحميل السلة ما يفشلش الـ login
      switchMap((me) =>
        this.basket.loadBasket().pipe(
          catchError(() => of(null)),
          map(() => me)
        )
      )
    );
  }

  register(data: { userName: string; displayName: string; email: string; password: string }) {
    return this.http.post<{ message: string }>(`${API}/register`, data);
  }

  logout(): Observable<{ message: string }> {
    // نمسح اليوزر والسلة محلياً حتى لو الـ request فشل
    return this.http
      .post<{ message: string }>(`${API}/logout`, {})
      .pipe(
        finalize(() => {
          this.user.set(null);
          this.basket.reset();
        })
      );
  }

  confirmEmail(email: string, token: string) {
    return this.http.get<{ message: string }>(
      `${API}/confirm-email?email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}`
    );
  }

  forgetPassword(email: string) {
    return this.http.post<{ message: string }>(
      `${API}/forget-password?email=${encodeURIComponent(email)}`,
      null
    );
  }

  resetPassword(data: { email: string; token: string; password: string }) {
    return this.http.post<{ message: string }>(`${API}/reset-password`, data);
  }
}