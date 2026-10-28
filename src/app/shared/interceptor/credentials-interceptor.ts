import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { API, Auth } from '../../features/Auth/Services/auth';

const API_ORIGIN = 'https://localhost:7020';

// 401 على دول طبيعي (باسورد غلط / مش عامل لوجن)
const SILENT_401 = [`${API}/login`, `${API}/me`];

export const credentialsInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith(API_ORIGIN)) return next(req);

  const auth = inject(Auth);
  const router = inject(Router);

  return next(req.clone({ withCredentials: true })).pipe(
    catchError((err: HttpErrorResponse) => {
      const isSilent = SILENT_401.some((u) => req.url.startsWith(u));

      // الجلسة انتهت: كان في user مسجل والـ cookie اتحذفت
      if (err.status === 401 && !isSilent && auth.isLoggedIn()) {
        auth.user.set(null);

        if (!router.url.startsWith('/Login')) {
          router.navigate(['/Login'], { queryParams: { returnUrl: router.url } });
        }
      }

      return throwError(() => err);
    })
  );
};