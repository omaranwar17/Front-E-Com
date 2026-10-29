import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

interface HomeCategory {
  readonly slug: string;
  readonly key: string; // used for HOME.SECTORS.<key>.*
  readonly icon: string;
  readonly tint: string; // tailwind text color for the icon glow
}

interface HomeFeature {
  readonly key: string;
  readonly icon: string;
}

const HERO_AUTOPLAY_MS = 5000;
const REVIEWS_AUTOPLAY_MS = 7000;
const COPIED_RESET_MS = 2000;

@Component({
  selector: 'app-home',
  imports: [RouterLink, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './home.scss',
  templateUrl: './home.html',
})
export class Home {
  private readonly destroyRef = inject(DestroyRef);

  readonly categories: readonly HomeCategory[] = [
    { slug: 'electronics', key: 'ELECTRONICS', icon: '📱', tint: 'text-sky-300' },
    { slug: 'men', key: 'MEN', icon: '👔', tint: 'text-indigo-300' },
    { slug: 'women', key: 'WOMEN', icon: '👗', tint: 'text-pink-300' },
    { slug: 'perfumes', key: 'PERFUMES', icon: '🧴', tint: 'text-amber-300' },
    { slug: 'home-kitchen', key: 'HOME_KITCHEN', icon: '🏠', tint: 'text-emerald-300' },
  ];

  /** Chips under the hero subtitle. */
  readonly chips: readonly HomeFeature[] = [
    { key: 'FAST', icon: '🚚' },
    { key: 'SECURE', icon: '🔒' },
    { key: 'RETURNS', icon: '🔄' },
    { key: 'SUPPORT', icon: '💬' },
  ];

  readonly tags = [1, 2, 3] as const;

  readonly features: readonly HomeFeature[] = [
    { key: 'DELIVERY', icon: '🚚' },
    { key: 'PAYMENT', icon: '🔒' },
    { key: 'RETURNS', icon: '🔄' },
    { key: 'SUPPORT', icon: '💬' },
    { key: 'QUALITY', icon: '✅' },
    { key: 'OFFERS', icon: '🏷️' },
  ];

  readonly reviews: readonly string[] = ['1', '2', '3'];

  /** Replace with the real number: international format, digits only. */
  readonly whatsappUrl = 'https://wa.me/201024915651';
  readonly promoCode = 'WELCOME10';

  readonly currentIndex = signal(0);
  readonly reviewIndex = signal(0);
  readonly paused = signal(false);
  readonly copied = signal(false);

  constructor() {
    const heroTimer = setInterval(() => {
      if (!this.paused()) {
        this.next();
      }
    }, HERO_AUTOPLAY_MS);
    const reviewTimer = setInterval(() => this.nextReview(), REVIEWS_AUTOPLAY_MS);
    this.destroyRef.onDestroy(() => {
      clearInterval(heroTimer);
      clearInterval(reviewTimer);
    });

  }

  next(): void {
    this.currentIndex.update((i) => (i + 1) % this.categories.length);
  }

  prev(): void {
    this.currentIndex.update((i) => (i - 1 + this.categories.length) % this.categories.length);
  }

  goTo(index: number): void {
    this.currentIndex.set(index);
  }

  nextReview(): void {
    this.reviewIndex.update((i) => (i + 1) % this.reviews.length);
  }

  prevReview(): void {
    this.reviewIndex.update((i) => (i - 1 + this.reviews.length) % this.reviews.length);
  }

  /** Signed distance of card i from the active card, wrapped to the shortest path. */
  offset(i: number): number {
    const n = this.categories.length;
    let d = i - this.currentIndex();
    if (d > n / 2) d -= n;
    if (d < -n / 2) d += n;
    return d;
  }

  cardTransform(i: number): string {
    const d = this.offset(i);
    if (Math.abs(d) > 1) {
      return `translateX(${d * 40}%) translateZ(-260px) scale(0.6)`;
    }
    return `translateX(${d * 66}%) translateZ(${d === 0 ? 0 : -90}px) rotateY(${d * -26}deg)`;
  }

  async copyCode(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.promoCode);
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), COPIED_RESET_MS);
    } catch {
      // Clipboard API unavailable (insecure context or denied permission).
    }
  }
}