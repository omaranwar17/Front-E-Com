import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../../features/Auth/Services/auth';

export const authGuard: CanActivateFn = (_route, _state) => {
  const auth = inject(Auth);
  const router = inject(Router);

  // لو مسجل دخول، كمل عادي
  if (auth.isLoggedIn()) {
    return true;
  }

  // لو مش مسجل دخول، اطرده لصفحة الـ login من غير أي returnUrl
  return router.createUrlTree(['/Login']);
};