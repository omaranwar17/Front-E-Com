import { Component, inject, signal } from '@angular/core';
import { LanguageService } from '../../../core/services/language-service';
import { TranslatePipe } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  imports: [CommonModule, TranslatePipe, RouterLink, RouterLinkActive],
  selector: 'app-navbar',
  styleUrl: './navbar.scss',
  templateUrl: './navbar.html',
})
export class Navbar {

    isMobileMenuOpen = signal(false);
      isLangMenuOpen = signal(false); 
       isAccountMenuOpen = signal(false); 
     langService = inject(LanguageService);
   // دالة بتعكس الحالة (لو مفتوح تقفله ولو مقفول تفتحه)
  toggleMobileMenu() {
    this.isMobileMenuOpen.update(val => !val);
  }

    toggleLangMenu() {
    this.isLangMenuOpen.update(val => !val);
  }
  
    toggleAccountMenu() {
    this.isAccountMenuOpen.update(val => !val);
  }
}
