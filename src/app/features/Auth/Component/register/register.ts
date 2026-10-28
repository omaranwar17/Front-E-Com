import { Component, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { Auth } from '../../Services/auth';


function passwordsMatch(group: AbstractControl): ValidationErrors | null {
  const password = group.get('password')?.value;
  const confirm = group.get('confirmPassword')?.value;
  return password === confirm ? null : { mismatch: true };
}

@Component({
  imports: [ReactiveFormsModule, RouterLink, TranslatePipe],
  selector: 'app-register',
  styleUrl: './register.scss',
  templateUrl: './register.html',
})
export class Register {
  private fb = inject(FormBuilder);
  private auth = inject(Auth);
  private router = inject(Router);
  private toastr = inject(ToastrService);
  private translate = inject(TranslateService);

  loading = signal(false);
  showPassword = signal(false);   // 👈 جديد
  showConfirm = signal(false);    // 👈 جديد

  form = this.fb.nonNullable.group(
    {
      userName: ['', [Validators.required, Validators.minLength(3)]],
      displayName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: passwordsMatch }
  );

  get userName() { return this.form.controls.userName; }
  get displayName() { return this.form.controls.displayName; }
  get email() { return this.form.controls.email; }
  get password() { return this.form.controls.password; }
  get confirmPassword() { return this.form.controls.confirmPassword; }

  // 👈 جديد: قوة الباسورد من 0 لـ 4 (نفس شروط الـ Identity في الباك إند)
  get strength(): number {
    const v = this.password.value;
    if (!v) return 0;
    return [
      v.length >= 6,
      /[a-z]/.test(v) && /[A-Z]/.test(v),
      /\d/.test(v),
      /[^A-Za-z0-9]/.test(v),
    ].filter(Boolean).length;
  }

  get strengthColor(): string {
    return this.strength <= 1 ? 'bg-red-500' : this.strength <= 3 ? 'bg-amber-500' : 'bg-emerald-500';
  }

  get strengthKey(): string {
    return this.strength <= 1 ? 'register.strength.weak'
         : this.strength <= 3 ? 'register.strength.medium'
         : 'register.strength.strong';
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    const { userName, displayName, email, password } = this.form.getRawValue();

    this.auth.register({ userName, displayName, email, password }).subscribe({
      next: () => {
        this.toastr.success(this.translate.instant('register.success'));
        this.router.navigate(['/Login']);
      },
      error: (e: any) => {
        this.loading.set(false);
        this.toastr.error(e.error?.message ?? this.translate.instant('register.failed'));
      },
    });
  }
}