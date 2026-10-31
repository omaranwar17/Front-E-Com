import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer class="mt-6 border-t border-gray-200 bg-white text-gray-600">
      <!-- خط علوي بنفس تدرج اللوجو -->
      <div class="h-1 bg-gradient-to-r from-indigo-600 to-violet-600"></div>

      <div class="max-w-7xl mx-auto px-6 pt-16 pb-8">

        <!-- التقسيمة الأساسية -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mb-12">

          <!-- 1. الشعار والوصف -->
          <div class="lg:col-span-2 text-start">
            <a routerLink="/" class="inline-flex items-center gap-3 mb-6">
              <img src="logo-icon.svg" alt="" class="h-12 w-12 shadow-lg shadow-indigo-600/20 rounded-2xl" />
              <span class="text-3xl font-extrabold text-gray-900">{{ 'FOOTER.BRAND' | translate }}</span>
            </a>

            <p class="text-gray-500 text-base leading-relaxed max-w-md mb-8">
              {{ 'FOOTER.DESCRIPTION' | translate }}
            </p>

            <!-- السوشيال ميديا -->
            <div class="flex gap-3 justify-start">
              <a href="#" aria-label="Twitter"
                 class="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:text-white hover:bg-indigo-600 hover:-translate-y-1 transition-all duration-300">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
              </a>
              <a href="#" aria-label="Instagram"
                 class="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:text-white hover:bg-indigo-600 hover:-translate-y-1 transition-all duration-300">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
            </div>
          </div>

          <!-- 2. روابط سريعة -->
          <div class="text-start">
            <h3 class="text-gray-900 font-bold mb-6 text-xl">{{ 'FOOTER.QUICK_LINKS' | translate }}</h3>
            <ul class="space-y-4">
              <li><a routerLink="/Home" class="text-gray-500 hover:text-indigo-600 hover:ps-2 transition-all duration-300 text-sm font-medium">{{ 'FOOTER.HOME' | translate }}</a></li>
              <li><a routerLink="/products" class="text-gray-500 hover:text-indigo-600 hover:ps-2 transition-all duration-300 text-sm font-medium">{{ 'FOOTER.PRODUCTS' | translate }}</a></li>
              <li><a routerLink="/About" class="text-gray-500 hover:text-indigo-600 hover:ps-2 transition-all duration-300 text-sm font-medium">{{ 'FOOTER.ABOUT' | translate }}</a></li>
            </ul>
          </div>

        </div>

        <!-- الشريط السفلي (حقوق النشر) -->
        <div class="pt-8 border-t border-gray-200 flex flex-col md:flex-row items-center justify-between gap-4">
          <p class="text-sm text-gray-500 text-center md:text-start w-full md:w-auto">
            &copy; {{ year }} <span class="font-bold text-gray-900">{{ 'FOOTER.BRAND' | translate }}</span>. {{ 'FOOTER.RIGHTS' | translate }}
          </p>
          <div class="flex gap-4 opacity-70">
            <span class="text-sm text-gray-500 font-bold">VISA</span>
            <span class="text-sm text-gray-500 font-bold">MASTERCARD</span>
          </div>
        </div>

      </div>
    </footer>
  `,
})
export class FooterComponent {
  readonly year = new Date().getFullYear();
}