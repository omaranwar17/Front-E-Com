import { Component, inject, computed } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs/operators';
import { Navbar } from './shared/components/navbar/navbar';
import { FooterComponent } from './shared/components/footer-component/footer-component';
import { NgxSpinnerModule } from 'ngx-spinner';
import { LayoutService } from './shared/Services/layout-service';
import { Sidebar } from './shared/components/sidebar/sidebar';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [Navbar, FooterComponent, RouterOutlet, NgxSpinnerModule, Sidebar, NgClass],
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {
  private readonly router = inject(Router);
  readonly layout = inject(LayoutService);

  // نتابع الـ URL الحالي كـ Signal
  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map(e => e.urlAfterRedirects.split('?')[0]) // نشيل query params
    ),
    { initialValue: this.router.url.split('?')[0] }
  );

  // الصفحات اللي **مش** عايزين الفوتر يظهر فيها
  private readonly hiddenRoutes = ['/Carts', '/products', '/Admin/Orders'];

  // الفوتر يظهر في كل حاجة ما عدا اللي فوق
  readonly showFooter = computed(() => {
    const url = this.currentUrl();

    const isHidden = this.hiddenRoutes.some(route =>
      route === '/' ? url === '/' : url.startsWith(route)
    );

    return !isHidden;
  });
}