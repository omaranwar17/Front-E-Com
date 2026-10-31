import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LayoutService {
  private readonly STORAGE_KEY = 'sidebar-collapsed';

  /** ديسكتوب: true = 80px (أيقونات فقط) */
  readonly collapsed = signal<boolean>(this.read());

  /** موبايل: السايدبار overlay */
  readonly mobileOpen = signal<boolean>(false);

  toggle(): void {
    this.collapsed.update(value => {
      const next = !value;
      this.write(next);
      return next;
    });
  }

  toggleMobile(): void {
    this.mobileOpen.update(value => !value);
  }

  closeMobile(): void {
    this.mobileOpen.set(false);
  }

  private read(): boolean {
    try {
      return localStorage.getItem(this.STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  }

  private write(value: boolean): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, String(value));
    } catch {
      // التخزين غير متاح (private mode مثلاً): الحالة تفضل في الذاكرة فقط
    }
  }
}