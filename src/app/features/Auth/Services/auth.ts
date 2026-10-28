import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, finalize, firstValueFrom, of, switchMap, tap, timeout } from 'rxjs';

export interface CurrentUser {
  email: string;
  userName: string;
  roles: string[];
}

export const API = 'https://localhost:7020/api/Acount';

@Injectable({ providedIn: 'root' })
export class Auth  {
  private http = inject(HttpClient);

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
  } catch {
    this.user.set(null);
  }
}

  login(email: string, password: string): Observable<CurrentUser> {
    return this.http.post(`${API}/login`, { email, password }).pipe(
      switchMap(() => this.http.get<CurrentUser>(`${API}/me`)),
      tap((me) => this.user.set(me))
    );
  }

  register(data: { userName: string; displayName: string; email: string; password: string }) {
    return this.http.post<{ message: string }>(`${API}/register`, data);
  }

  logout(): Observable<{ message: string }> {
  // نمسح الـ user محليًا حتى لو الـ request فشل
  return this.http
    .post<{ message: string }>(`${API}/logout`, {})
    .pipe(finalize(() => this.user.set(null)));
}

confirmEmail(email: string, token: string) {
  // بنبني الـ query بإيدينا مع encodeURIComponent
  return this.http.get<{ message: string }>(
    `${API}/confirm-email?email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}`
  );
}

forgetPassword(email: string) {
  // الـ backend واخد email كـ [FromQuery] فبيتبعت في الـ query مش في الـ body
  return this.http.post<{ message: string }>(
    `${API}/forget-password?email=${encodeURIComponent(email)}`,
    null
  );
}

resetPassword(data: { email: string; token: string; password: string }) {
  return this.http.post<{ message: string }>(`${API}/reset-password`, data);
}
  
}
