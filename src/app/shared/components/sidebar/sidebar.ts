import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { LayoutService } from '../../Services/layout-service';
import { Auth } from '../../../features/Auth/Services/auth';
import { BasketService } from '../../../features/Carts/Service/BasketService';

interface SidebarItem {
  route: string;
  icon: string;
  labelKey: string;
  /** يظهر badge بعدد عناصر السلة */
  showCartBadge?: boolean;
}

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, RouterLink, RouterLinkActive, TranslatePipe],
  templateUrl: './sidebar.html',
})
export class Sidebar {
  readonly auth = inject(Auth);
  readonly layout = inject(LayoutService);
  readonly basket = inject(BasketService);

  private readonly router = inject(Router);

  logout(): void {
    this.layout.closeMobile();
    this.auth.logout().subscribe({
      next: () => this.router.navigate(['/Login']),
      error: () => this.router.navigate(['/Login']), // نفس سلوك النافبار: المستخدم بيتمسح محلياً
    });
  }

  readonly items: SidebarItem[] = [
    { route: '/Home',     icon: 'fa-house',         labelKey: 'NAV.HOME' },
    { route: '/products', icon: 'fa-bag-shopping',  labelKey: 'NAV.SHOPPING' },
    { route: '/Carts',    icon: 'fa-cart-shopping', labelKey: 'NAV.CART', showCartBadge: true },
    { route: '/About',    icon: 'fa-circle-info',   labelKey: 'NAV.ABOUT' },
  ];

  /** تظهر للأدمن فقط */
  readonly adminItems: SidebarItem[] = [
    { route: '/Admin/Orders', icon: 'fa-clipboard-list', labelKey: 'ADMIN_ORDERS.TITLE' },
  ];
}