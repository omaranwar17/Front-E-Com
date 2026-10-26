import { ApplicationConfig, inject, provideAppInitializer, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

// استيراد الدوال الجديدة من ngx-translate
import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import { loaderInterceptor } from './shared/interceptor/loader-interceptor';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideToastr } from 'ngx-toastr';
import { catchError, firstValueFrom, of } from 'rxjs';
import { BasketService } from './features/Carts/Service/BasketService';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideToastr({
      timeOut: 3000,
      positionClass: 'toast-top-right', // مكان الإشعار
      preventDuplicates: true,          // منع تكرار نفس الإشعار
      progressBar: true,                // شريط التحميل أسفل الإشعار
      closeButton: true                 // زر إغلاق
    }),
 
    provideRouter(routes),

    provideHttpClient(withInterceptors([loaderInterceptor])),
  provideAppInitializer(() =>
    firstValueFrom(
      inject(BasketService).loadBasket().pipe(catchError(() => of(null)))
    )
  ),


    // الطريقة الصح للإصدار 18 مع Angular 22
    provideTranslateService({
      loader: provideTranslateHttpLoader({
        prefix: './i18n/',
        suffix: '.json'
      }),
      fallbackLang: 'en' 
    })
  ]
};