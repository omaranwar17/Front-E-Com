import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- 
      mt-24: بيعمل مسافة فوق الفوتر عشان ميبقاش لازق في المحتوى
      pt-16: مسافة داخلية من فوق
      bg-[#0f172a]: لون كحلي غامق شيك
    -->
    <footer class="bg-[#0f172a] text-gray-300 mt-24 pt-20 pb-8 border-t-4 border-indigo-600">
      <div class="max-w-7xl mx-auto px-6">
        
        <!-- التقسيمة الأساسية -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          
          <!-- 1. الشعار والوصف -->
          <div class="lg:col-span-2 text-right">
            <a routerLink="/" class="inline-flex items-center gap-3 mb-6">
              <!-- أيقونة المتجر -->
              <div class="bg-indigo-600 text-white p-3 rounded-xl shadow-lg shadow-indigo-600/30">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-7 h-7">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
              </div>
              <span class="text-3xl font-extrabold text-white">{{ 'FOOTER.BRAND' | translate }}</span>
            </a>
            
            <p class="text-gray-400 text-base leading-relaxed max-w-md ml-auto mb-8">
              {{ 'FOOTER.DESCRIPTION' | translate }}
            </p>
            
            <!-- السوشيال ميديا -->
            <div class="flex gap-4 justify-end">
              <a href="#" class="w-11 h-11 rounded-full bg-slate-800 flex items-center justify-center text-gray-400 hover:text-white hover:bg-indigo-600 hover:-translate-y-1 transition-all duration-300">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
              </a>
              <a href="#" class="w-11 h-11 rounded-full bg-slate-800 flex items-center justify-center text-gray-400 hover:text-white hover:bg-indigo-600 hover:-translate-y-1 transition-all duration-300">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
            </div>
          </div>

          <!-- 2. روابط سريعة -->
          <div class="text-right lg:pr-8">
            <h3 class="text-white font-bold mb-6 text-xl">{{ 'FOOTER.QUICK_LINKS' | translate }}</h3>
            <ul class="space-y-4">
              <li><a routerLink="/" class="text-gray-400 hover:text-indigo-400 hover:pr-2 transition-all duration-300 text-sm font-medium">{{ 'FOOTER.HOME' | translate }}</a></li>
              <li><a routerLink="/products" class="text-gray-400 hover:text-indigo-400 hover:pr-2 transition-all duration-300 text-sm font-medium">{{ 'FOOTER.PRODUCTS' | translate }}</a></li>
              <li><a routerLink="/about" class="text-gray-400 hover:text-indigo-400 hover:pr-2 transition-all duration-300 text-sm font-medium">{{ 'FOOTER.ABOUT' | translate }}</a></li>
            </ul>
          </div>

          <!-- 3. خدمة العملاء -->
          <div class="text-right">
            <h3 class="text-white font-bold mb-6 text-xl">{{ 'FOOTER.CUSTOMER_SERVICE' | translate }}</h3>
            <ul class="space-y-4">
              <li><a routerLink="/account" class="text-gray-400 hover:text-indigo-400 hover:pr-2 transition-all duration-300 text-sm font-medium">{{ 'FOOTER.MY_ACCOUNT' | translate }}</a></li>
              <li><a routerLink="/contact" class="text-gray-400 hover:text-indigo-400 hover:pr-2 transition-all duration-300 text-sm font-medium">{{ 'FOOTER.CONTACT' | translate }}</a></li>
              <li><a routerLink="/faq" class="text-gray-400 hover:text-indigo-400 hover:pr-2 transition-all duration-300 text-sm font-medium">{{ 'FOOTER.FAQ' | translate }}</a></li>
            </ul>
          </div>
        </div>

        <!-- الشريط السفلي (حقوق النشر) -->
        <div class="pt-8 border-t border-slate-700/50 flex flex-col md:flex-row items-center justify-between gap-4">
          <p class="text-sm text-gray-400 text-center md:text-right w-full md:w-auto">
            &copy; {{ year }} <span class="font-bold text-white">{{ 'FOOTER.BRAND' | translate }}</span>. {{ 'FOOTER.RIGHTS' | translate }}
          </p>
          <div class="flex gap-4 opacity-70">
             <!-- لو عندك أيقونات فيزا وماستر كارد ممكن تحطها هنا -->
             <span class="text-sm text-gray-400 font-bold">VISA</span>
             <span class="text-sm text-gray-400 font-bold">MASTERCARD</span>
          </div>
        </div>
        
      </div>
    </footer>
  `,
})
export class FooterComponent {
  readonly year = new Date().getFullYear();
}