import { ApplicationConfig, DEFAULT_CURRENCY_CODE, inject, provideAppInitializer, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import { loaderInterceptor } from './shared/interceptor/loader-interceptor';
import { provideToastr } from 'ngx-toastr';
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

    // يحمّل اليوزر وسلته قبل عرض الموقع
    provideAppInitializer(() => inject(Auth).load()),

    provideTranslateService({
      loader: provideTranslateHttpLoader({
        prefix: './i18n/',
        suffix: '.json'
      }),
      fallbackLang: 'en'
    })
  ]
};