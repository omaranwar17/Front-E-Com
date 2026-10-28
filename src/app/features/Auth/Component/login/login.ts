

import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { Auth } from '../../Services/auth';


@Component({
  imports: [ReactiveFormsModule, RouterLink, TranslatePipe],
  selector: 'app-login',
  styleUrl: './login.scss',
  templateUrl: './login.html',
})
export class Login {
  private fb = inject(FormBuilder);
  private auth = inject(Auth);
  private router = inject(Router);
  private toastr = inject(ToastrService);
  private translate = inject(TranslateService);

  loading = signal(false);
  showPassword = signal(false);

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  get email() { return this.form.controls.email; }
  get password() { return this.form.controls.password; }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    const { email, password } = this.form.getRawValue();

    this.auth.login(email, password).subscribe({
      next: () => {
        this.toastr.success(this.translate.instant('login.success'));
        this.router.navigate(['/Home']);
      },
      error: (e: any) => {
        this.loading.set(false);
        this.toastr.error(e.error?.message ?? this.translate.instant('login.failed'));
      },
    });
  }
}
