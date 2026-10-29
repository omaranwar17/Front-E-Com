import { Component, inject, OnInit, signal } from '@angular/core';
import { Navbar } from './shared/components/navbar/navbar';
import { Footer } from './shared/components/footer/footer';
import { Product } from './features/Product/Component/product/product';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { NgxSpinnerModule } from 'ngx-spinner';
import { FooterComponent } from './shared/components/footer-component/footer-component';
import { filter } from 'rxjs';






@Component({
  imports: [Navbar, FooterComponent, RouterOutlet  , NgxSpinnerModule],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App implements OnInit {
  protected readonly title = signal('my-app');
  categ:any;

showFooter = signal(true);
  private router = inject(Router);

  ngOnInit(): void {
    // بنراقب تغيير الصفحات عشان نخفي/نظهر الفوتر
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      const url = event.urlAfterRedirects;
      
      // الصفحات اللي مش عايزين الفوتر يظهر فيها
      const hiddenRoutes = ['/','/Admin/Orders', '/Carts', '/admin'];
      
      // لو الرابط فيه أي حاجة من دي، بنخفي الفوتر
      const isHidden = hiddenRoutes.some(route => url.includes(route));
      
      this.showFooter.set(!isHidden);
    });
  }



}









