import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { BasketService } from '../../Service/BasketService';

import { Order, PaymentInfo, PaymentMethod } from '../../../../shared/Interfases/order';
import { OrderService } from '../../Service/order-service';

const PHONE_REGEX = /^01[0125][0-9]{8}$/;

/** يحوّل الأرقام العربية والفارسية (٠-٩ / ۰-۹) لأرقام إنجليزية */
function normalizeDigits(value: string): string {
  return value
    .replace(/[\u0660-\u0669]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[\u06F0-\u06F9]/g, (d) => String(d.charCodeAt(0) - 0x06f0));
}

/** يشيل المسافات والشرطات ويحوّل +20 / 0020 / 20 لـ 0 */
function normalizePhone(value: string): string {
  return normalizeDigits(value)
    .replace(/[\s-]/g, '')
    .replace(/^(?:\+20|0020|20)(?=1)/, '0');
}

/** required بس بيرفض المسافات الفاضية. بيرجع نفس مفتاح الخطأ 'required' عشان الـ template ميتغيرش. */
const requiredTrimmed: ValidatorFn = (control) =>
  typeof control.value === 'string' && control.value.trim().length > 0
    ? null
    : { required: true };

/** بيرجع نفس مفتاح الخطأ 'pattern' عشان الـ template ميتغيرش. الفاضي بيسيبه لـ requiredTrimmed. */
const egyptianPhone: ValidatorFn = (control) => {
  const value = normalizePhone(String(control.value ?? ''));
  return value === '' || PHONE_REGEX.test(value) ? null : { pattern: true };
};

@Component({
  selector: 'app-checkout',
  imports: [CurrencyPipe, RouterLink, TranslatePipe, ReactiveFormsModule],
  templateUrl: './checkout.html',
})
export class Checkout {
  readonly basket = inject(BasketService);
  private readonly orders = inject(OrderService);
  private readonly fb = inject(FormBuilder);

  readonly submitting = signal(false);
  readonly error = signal<string | null>(null);
  readonly placedOrder = signal<Order | null>(null);
  readonly paymentInfo = signal<PaymentInfo | null>(null);

  readonly methods: PaymentMethod[] = ['CashOnDelivery', 'InstaPay', 'VodafoneCash'];

  readonly form = this.fb.nonNullable.group({
    fullName: ['', [requiredTrimmed, Validators.maxLength(100)]],
    phone: ['', [requiredTrimmed, egyptianPhone]],
    governorate: ['', [requiredTrimmed, Validators.maxLength(50)]],
    city: ['', [requiredTrimmed, Validators.maxLength(100)]],
    street: ['', [requiredTrimmed, Validators.maxLength(250)]],
    notes: ['', [Validators.maxLength(500)]],
    paymentMethod: ['CashOnDelivery' as PaymentMethod, [Validators.required]],
    paymentReference: ['', [Validators.maxLength(100)]],
  });

  constructor() {
    // بيانات الدفع (رقمك وإنستاباي) من الـ API
    this.orders.getPaymentInfo().subscribe({
      next: (info) => this.paymentInfo.set(info),
      error: () => this.paymentInfo.set(null),
    });

    // رقم العملية إجباري بس مع إنستاباي وفودافون كاش
    this.form.controls.paymentMethod.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.updateReferenceValidator());
  }

  /** هل الطريقة المختارة محتاجة تحويل ورقم عملية؟ */
  requiresReference(): boolean {
    return this.form.controls.paymentMethod.value !== 'CashOnDelivery';
  }

  private updateReferenceValidator(): void {
    const ref = this.form.controls.paymentReference;
    if (this.requiresReference()) {
      ref.setValidators([requiredTrimmed, Validators.maxLength(100)]);
    } else {
      ref.setValidators([Validators.maxLength(100)]);
      ref.setValue('');
    }
    ref.updateValueAndValidity();
  }

  placeOrder(): void {
    if (this.submitting()) return; // يمنع الضغط مرتين

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.error.set(null);

    const v = this.form.getRawValue();
    const needsRef = v.paymentMethod !== 'CashOnDelivery';

    this.orders
      .create({
        shippingAddress: {
          fullName: v.fullName.trim(),
          phone: normalizePhone(v.phone),
          governorate: v.governorate.trim(),
          city: v.city.trim(),
          street: v.street.trim(),
          notes: v.notes.trim() || null,
        },
        paymentMethod: v.paymentMethod,
        paymentReference: needsRef ? normalizeDigits(v.paymentReference.trim()) : null,
      })
      .subscribe({
        next: (order) => {
          this.basket.reset();
          this.placedOrder.set(order);
          this.submitting.set(false);
        },
        error: (err: HttpErrorResponse) => {
          this.error.set(this.resolveError(err));
          this.submitting.set(false);
        },
      });
  }

  private resolveError(err: HttpErrorResponse): string {
    if (err.status === 0) return 'CHECKOUT.ERR_NETWORK';
    if (err.status === 401) return 'CHECKOUT.ERR_UNAUTHORIZED';

    const message: unknown = err.error?.message;
    return typeof message === 'string' && message ? message : 'CHECKOUT.ERROR_GENERIC';
  }

  /** بيرجع true لو الحقل فيه خطأ واليوزر لمسه */
  hasError(name: keyof typeof this.form.controls, error: string): boolean {
    const c = this.form.controls[name];
    return c.touched && c.hasError(error);
  }
}