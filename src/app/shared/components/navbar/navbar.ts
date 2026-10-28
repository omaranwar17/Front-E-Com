import { Component, inject, signal } from '@angular/core';
import { LanguageService } from '../../../core/services/language-service';
import { TranslatePipe } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { BasketService } from '../../../features/Carts/Service/BasketService';
import { Auth } from '../../../features/Auth/Services/auth';

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
        auth = inject(Auth);
  private router = inject(Router);
         readonly basket = inject(BasketService);
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

   logout() {
  this.isAccountMenuOpen.set(false);
  this.auth.logout().subscribe({
    next: () => this.router.navigate(['/Login']),
    error: () => this.router.navigate(['/Login']), // الـ user اتمسح محليًا في finalize
  });
}
}
