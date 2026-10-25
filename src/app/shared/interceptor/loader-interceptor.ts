// import { HttpContextToken, HttpInterceptorFn } from '@angular/common/http';
// import { inject } from '@angular/core';
// import { finalize } from 'rxjs';
// import { Loading } from '../Services/loading'; // عدّل المسار حسب مكان الملف

// /** لو عايز request معيّن يشتغل من غير spinner */
// export const SKIP_LOADING = new HttpContextToken<boolean>(() => false);

// export const loaderInterceptor: HttpInterceptorFn = (req, next) => {
//   // ملفات الترجمة والـ static assets مش API calls
//   if (req.context.get(SKIP_LOADING) || req.url.includes('/assets/')) return next(req);

//   const loading = inject(Loading);
//   loading.start();

//   // finalize بيشتغل مع النجاح والخطأ والإلغاء
//   return next(req).pipe(finalize(() => loading.stop()));
// };


import { HttpContextToken, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';
import { Loading } from '../Services/loading';

export const SKIP_LOADING = new HttpContextToken<boolean>(() => false);

/** مسارات لا يجب أن تشغّل الـ spinner */
const STATIC_EXTENSIONS = /\.(json|css|js|mjs|map|svg|png|jpg|jpeg|gif|webp|ico|woff2?|ttf|eot)$/i;

export const loaderInterceptor: HttpInterceptorFn = (req, next) => {
  const isStaticAsset =
    req.method === 'GET' &&
    (STATIC_EXTENSIONS.test(req.url) || req.url.includes('/i18n/'));

  if (req.context.get(SKIP_LOADING) || isStaticAsset) {
    return next(req);
  }

  const loading = inject(Loading);
  loading.start();

  return next(req).pipe(finalize(() => loading.stop()));
};