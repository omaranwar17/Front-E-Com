import { Component, inject } from '@angular/core';
import { BasketService } from '../../Service/BasketService';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { Router, RouterLink } from '@angular/router';

@Component({
  imports: [CommonModule , TranslatePipe , RouterLink],
  selector: 'app-basket',
  styleUrl: './basket.scss',
  templateUrl: './basket.html',
})
export class Basket {
  readonly basket = inject(BasketService);
  readonly imageBase = 'https://localhost:7020/';
  readonly placeholder = 'assets/placeholder.png'; // غيّرها لصورة موجودة عندك
constructor(private router: Router){}
  imageUrl(path: string): string {
    if (!path) return this.placeholder;
    return /^(https?:|assets\/|data:)/.test(path) ? path : this.imageBase + path;
  }

  onImgError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (!img.src.endsWith(this.placeholder)) img.src = this.placeholder; // يمنع loop لو الـ placeholder نفسه مش موجود
  }

   goToCheckout() {
    this.router.navigate(['/Carts/Checkout']);
  }
}
