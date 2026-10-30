import { ChangeDetectionStrategy, Component, ElementRef, effect, input, viewChild } from '@angular/core';
import JsBarcode from 'jsbarcode';

@Component({
  selector: 'app-barcode',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<svg #svg class="max-w-full"></svg>`,
})
export class BarcodeComponent {
  readonly value = input<string | null | undefined>();
  readonly height = input(60);
  readonly showText = input(true);

  private readonly svg = viewChild.required<ElementRef<SVGSVGElement>>('svg');

  constructor() {
    effect(() => {
      const el = this.svg().nativeElement;
      const code = this.value()?.trim();
      el.innerHTML = '';
      if (!code) return;

      const options = {
        height: this.height(),
        displayValue: this.showText(),
        margin: 8,
        fontSize: 14,
      };

      // 13 رقم: EAN-13، وإلا (أو لو الـ check digit غلط) Code128 اللي بيقبل أي حروف وأرقام
      try {
        JsBarcode(el, code, { ...options, format: /^\d{13}$/.test(code) ? 'EAN13' : 'CODE128' });
      } catch {
        try {
          JsBarcode(el, code, { ...options, format: 'CODE128' });
        } catch {
          el.innerHTML = '';
        }
      }
    });
  }
}