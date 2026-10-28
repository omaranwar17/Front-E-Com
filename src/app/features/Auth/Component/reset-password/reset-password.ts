import { Component, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { TranslatePipe } from '@ngx-translate/core';
import { Auth } from '../../Services/auth';

function passwordsMatch(group: AbstractControl): ValidationErrors | null {
  return group.get('newPassword')?.value === group.get('confirmPassword')?.value
    ? null
    : { mismatch: true };
}

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, TranslatePipe],
  templateUrl: './reset-password.html',
})
export class ResetPassword {
private fb = inject(FormBuilder);
  private auth = inject(Auth);
  private route = inject(ActivatedRoute);

  // queryParamMap بيفك الـ encoding (%2B, %2F, %3D) لوحده
  email = this.route.snapshot.queryParamMap.get('email') ?? '';
  token = this.route.snapshot.queryParamMap.get('token') ?? '';

  loading = signal(false);
  done = signal(false);
  showPassword = signal(false);

  // رسالة الخطأ: لو جاية من الـ backend (نص إنجليزي) بتتعرض زي ما هي،
  // ولو network بتتعرض كمفتاح ترجمة
  error = signal<{ text: string; translate: boolean } | null>(null);

  form = this.fb.nonNullable.group(
    {
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
    },
    { validators: passwordsMatch }
  );

  get newPassword() {
    return this.form.controls.newPassword;
  }

  get confirmPassword() {
    return this.form.controls.confirmPassword;
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.auth
      .resetPassword({
        email: this.email,
        token: this.token,
        password: this.newPassword.value,
      })
      .subscribe({
        next: () => {
          this.done.set(true);
          this.loading.set(false);
        },
        error: (err: HttpErrorResponse) => {
          this.error.set(
            err.status === 0
              ? { text: 'reset.errors.network', translate: true }
              : err.error?.message
                ? { text: err.error.message, translate: false }
                : { text: 'reset.errors.generic', translate: true }
          );
          this.loading.set(false);
        },
      });
  }
}