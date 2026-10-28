import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { Auth } from '../../Services/auth';
import { TranslatePipe } from '@ngx-translate/core';

type ConfirmState = 'loading' | 'success' | 'error';

@Component({
  selector: 'app-confirm-email',
  standalone: true,
  imports: [RouterLink , TranslatePipe],
  templateUrl: './confirm-email.html',
})
export class ConfirmEmail {
  private auth = inject(Auth);
  private route = inject(ActivatedRoute);

  state = signal<ConfirmState>('loading');

  // رسالة الخطأ: مفتاح ترجمة، أو نص جاي من الـ backend
  error = signal<{ text: string; translate: boolean } | null>(null);

  constructor() {
    const email = this.route.snapshot.queryParamMap.get('email');
    const token = this.route.snapshot.queryParamMap.get('token');

    if (!email || !token) {
      this.fail({ text: 'confirm.errors.invalidLink', translate: true });
      return;
    }

    this.auth.confirmEmail(email, token).subscribe({
      next: () => this.state.set('success'),
      error: (err: HttpErrorResponse) =>
        this.fail(
          err.status === 0
            ? { text: 'confirm.errors.network', translate: true }
            : err.error?.message
              ? { text: err.error.message, translate: false }
              : { text: 'confirm.errors.generic', translate: true }
        ),
    });
  }

  private fail(error: { text: string; translate: boolean }) {
    this.error.set(error);
    this.state.set('error');
  }
}
