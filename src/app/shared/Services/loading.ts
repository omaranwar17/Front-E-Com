import { inject, Service } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';

@Service()
export class Loading {
  private spinner = inject(NgxSpinnerService);

  private readonly SHOW_DELAY_MS = 50;
  private readonly MIN_VISIBLE_MS = 500;


  private pending = 0;
  private visible = false;
  private shownAt = 0;
  private showTimer: ReturnType<typeof setTimeout> | null = null;

  start(): void {
    this.pending++;
    if (this.pending > 1 || this.visible || this.showTimer !== null) return;

    this.showTimer = setTimeout(() => {
      this.showTimer = null;
      if (this.pending === 0) return;
      this.visible = true;
      this.shownAt = Date.now();
      void this.spinner.show();
    }, this.SHOW_DELAY_MS);
  }

  stop(): void {
    this.pending = Math.max(0, this.pending - 1);
    if (this.pending > 0) return;

    // الـ request خلص قبل ما الـ spinner يظهر
    if (this.showTimer !== null) {
      clearTimeout(this.showTimer);
      this.showTimer = null;
    }
    if (!this.visible) return;

    const remaining = Math.max(0, this.MIN_VISIBLE_MS - (Date.now() - this.shownAt));
    setTimeout(() => {
      // لو request جديد بدأ في الأثناء، سيبه ظاهر
      if (this.pending === 0 && this.visible) {
        this.visible = false;
        void this.spinner.hide();
      }
    }, remaining);
  }
}