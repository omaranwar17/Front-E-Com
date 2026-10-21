import { DOCUMENT, inject, Service, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Service()
export class LanguageService {
     private translate = inject(TranslateService);
  private document = inject(DOCUMENT);
  
  // متغير عشان نعرف اللغة الحالية (عشان نستخدمه في الزرار)
  currentLang = signal('en');

  constructor() {
    // أول ما المشروع يفتح، نشوف لو فيه لغة محفوظة في المتصفح
    const savedLang = localStorage.getItem('lang') || 'en';
    this.setLanguage(savedLang);
  }

  setLanguage(lang: string) {
    this.translate.use(lang);
    this.currentLang.set(lang);
    localStorage.setItem('lang', lang);

    // تغيير اتجاه الصفحة (RTL للعربي، LTR للإنجليزي)
    const dir = lang === 'ar' ? 'rtl' : 'ltr';
    this.document.documentElement.setAttribute('dir', dir);
    this.document.documentElement.setAttribute('lang', lang);
  }

  toggleLanguage() {
    const newLang = this.currentLang() === 'en' ? 'ar' : 'en';
    this.setLanguage(newLang);
  }
}
