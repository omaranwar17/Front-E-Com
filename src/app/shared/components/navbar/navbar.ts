import { Component, inject, signal } from '@angular/core';
import { LanguageService } from '../../../core/services/language-service';
import { TranslatePipe } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';

@Component({
  imports: [CommonModule, TranslatePipe],
  selector: 'app-navbar',
  styleUrl: './navbar.scss',
  templateUrl: './navbar.html',
})
export class Navbar {

    isMobileMenuOpen = signal(false);
      isLangMenuOpen = signal(false); 
     langService = inject(LanguageService);
   // دالة بتعكس الحالة (لو مفتوح تقفله ولو مقفول تفتحه)
  toggleMobileMenu() {
    this.isMobileMenuOpen.update(val => !val);
  }

    toggleLangMenu() {
    this.isLangMenuOpen.update(val => !val);
  }
  
}
