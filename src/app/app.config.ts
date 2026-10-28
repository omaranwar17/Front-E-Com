import { ApplicationConfig, DEFAULT_CURRENCY_CODE, inject, provideAppInitializer, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import { loaderInterceptor } from './shared/interceptor/loader-interceptor';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideToastr } from 'ngx-toastr';
import { catchError, firstValueFrom, of } from 'rxjs';
import { BasketService } from './features/Carts/Service/BasketService';
import { credentialsInterceptor } from './shared/interceptor/credentials-interceptor';
import { Auth } from './features/Auth/Services/auth';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideToastr({
      timeOut: 3000,
      positionClass: 'toast-top-right',
      preventDuplicates: true,
      progressBar: true,
      closeButton: true
    }),
    { provide: DEFAULT_CURRENCY_CODE, useValue: 'EGP' },

    provideRouter(routes),

    provideHttpClient(withInterceptors([loaderInterceptor, credentialsInterceptor])),

    // ✅ جديد: تحميل بيانات اليوزر (ودوره) عند فتح الموقع
    provideAppInitializer(() => inject(Auth).load()),

    provideAppInitializer(() =>
      firstValueFrom(
        inject(BasketService).loadBasket().pipe(catchError(() => of(null)))
      )
    ),

    provideTranslateService({
      loader: provideTranslateHttpLoader({
        prefix: './i18n/',
        suffix: '.json'
      }),
      fallbackLang: 'en'
    })
  ]
};